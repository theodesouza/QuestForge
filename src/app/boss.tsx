/**
 * Batalha contra um chefão (rota /boss?id=…). Cada turno é uma questão: acertos causam
 * dano (maior em questões difíceis e em combo), erros custam Determinação.
 * Sem cronômetro e sem sorte — o foco continua sendo a questão.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { findQuestion, getQuestion } from '../content/bank';
import { BOSSES, getBoss, type BossDef } from '../content/bosses';
import { getRegion } from '../content/regions';
import { subtopicLabel } from '../content/topics';
import { getItem, RARITY_LABEL } from '../content/items';
import { activeHeadIndex, headSpans, headsFelled, type BattleState } from '../domain/boss/battle';
import { bossNodeStatus } from '../domain/game/game';
import { battleReviewItems } from '../domain/game/review';
import type { GameEvent } from '../domain/game/types';
import { BossArt } from '../features/boss/BossArt';
import { HeadsBar } from '../features/boss/HeadsBar';
import { AnswerBar } from '../features/question/AnswerBar';
import { QuestionBody } from '../features/question/QuestionBody';
import { ReviewBanner, ReviewBar, reviewAttempt, useReview } from '../features/question/review';
import { useAttempt } from '../features/question/useAttempt';
import { battleAnswer, beginBattle, dismissBattle, retreat } from '../state/actions';
import { useGame, useGameStore } from '../state/store';
import { Button } from '../ui/Button';
import { calm } from '../ui/calm';
import { haptic, useReduceMotion } from '../ui/feedback';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { ItemGlyph } from '../ui/ItemGlyph';
import { MapBackdrop } from '../ui/MapBackdrop';
import { Panel } from '../ui/Panel';
import { ProgressBar } from '../ui/ProgressBar';
import { Screen } from '../ui/Screen';
import { Text } from '../ui/Text';
import { colors, radius, rarityColor, space } from '../ui/theme';

function traitIcon(boss: BossDef): 'shield' | 'lock' | 'target' {
  return boss.trait.kind === 'armor' ? 'shield' : boss.trait.kind === 'heads' ? 'target' : 'lock';
}

function pickLine(lines: string[], n: number) {
  return lines[n % lines.length];
}

// ——————————————————————————————————————————————— introdução

function Intro({ boss }: { boss: BossDef }) {
  const reduce = useReduceMotion();
  const progress = useGame((g) => g.bosses[boss.id]);
  const status = useGame((g) => bossNodeStatus(g, boss.id));
  const [busy, setBusy] = useState(false);
  const knowledge = Math.min(30, (progress?.failedSinceWin ?? 0) * 10);

  const fight = async () => {
    setBusy(true);
    try {
      await beginBattle(boss.id);
    } catch (e) {
      Alert.alert('A batalha não começou', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (status === 'locked') {
    return (
      <Screen footer={<Button label="Voltar" variant="secondary" onPress={() => router.back()} />} glow={boss.accent}>
        <View style={styles.introArt}>
          <BossArt art={boss.art} size={200} defeated />
        </View>
        <Text variant="title" align="center">
          O guardião dorme
        </Text>
        <Text variant="body" color={colors.parchmentDim} align="center">
          Conclua as missões de {getRegion(boss.regionId).name} para despertar {boss.name}.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen
      glow={boss.accent}
      footer={
        <>
          <Button label={`Enfrentar ${boss.name}`} icon="sword" onPress={fight} loading={busy} />
          <Button label="Agora não" variant="ghost" onPress={() => router.back()} />
        </>
      }
    >
      <Animated.View entering={reduce ? undefined : FadeIn.duration(600)} style={styles.introArt}>
        <BossArt art={boss.art} size={230} />
      </Animated.View>
      <View style={styles.center}>
        <Text variant="label" color={boss.accent}>
          {boss.epithet}
        </Text>
        <Text variant="hero" align="center">
          {boss.name}
        </Text>
      </View>
      <View style={styles.lines}>
        {boss.lines.intro.map((l, i) => (
          <Animated.View key={i} entering={reduce ? undefined : FadeInDown.delay(400 + i * 450).duration(400)}>
            <Text variant="question" align="center" style={styles.quote}>
              “{l}”
            </Text>
          </Animated.View>
        ))}
      </View>
      <Panel accent={boss.accent}>
        <View style={styles.rule}>
          <Icon name={traitIcon(boss)} size={20} color={colors.mist} />
          <View style={{ flex: 1 }}>
            <Text variant="subheading">{boss.trait.name}</Text>
            <Text variant="caption" color={colors.parchmentDim}>
              {boss.trait.description}
            </Text>
          </View>
        </View>
        {boss.trait.kind === 'heads'
          ? boss.trait.heads.map((h) => (
              <View key={h.id} style={styles.headRow} accessible accessibilityLabel={`${h.name}: ${h.share[0]}/${h.share[1]} da vida. ${h.subtopics.map((s) => subtopicLabel(boss.topics[0], s)).join(', ')}.`}>
                <View style={[styles.headDot, { backgroundColor: h.color }]} />
                <Text variant="caption" color={colors.parchment} style={{ flex: 1 }}>
                  <Text variant="caption" color={h.color}>
                    {h.name} · {h.share[0]}/{h.share[1]}
                  </Text>
                  {'  '}
                  {h.subtopics.map((s) => subtopicLabel(boss.topics[0], s)).join(' · ')}
                </Text>
              </View>
            ))
          : null}
        <View style={styles.rule}>
          <Icon name="sparkle" size={20} color={colors.brass} fill={colors.brassGlow} />
          <View style={{ flex: 1 }}>
            <Text variant="subheading">Técnica: {boss.technique.name}</Text>
            <Text variant="caption" color={colors.parchmentDim}>
              A cada {boss.technique.every} acertos seguidos, um golpe extra de +{boss.technique.bonus} de dano.
            </Text>
          </View>
        </View>
        <View style={styles.rule}>
          <Icon name="flag" size={20} color={colors.verdigris} />
          <View style={{ flex: 1 }}>
            <Text variant="subheading">Sem pressa, sem sorte</Text>
            <Text variant="caption" color={colors.parchmentDim}>
              Não há cronômetro. Você tem {boss.resolve} pontos de Determinação; perdê-los é uma retirada — o XP fica com você e a próxima tentativa ganha Conhecimento do Inimigo.
            </Text>
          </View>
        </View>
      </Panel>
      {progress && (progress.wins > 0 || knowledge > 0) ? (
        <Text variant="caption" color={colors.mist} align="center">
          {progress.wins > 0 ? `Vitórias: ${progress.wins}${progress.flawless ? ' · já venceu sem erros' : ''}` : `Conhecimento do Inimigo: +${knowledge}% de dano`}
        </Text>
      ) : null}
    </Screen>
  );
}

// ——————————————————————————————————————————————— batalha

type Hit = { id: number; damage: number; technique: boolean; healed: number };

function Hud({ boss, battle, hit, line }: { boss: BossDef; battle: BattleState; hit: Hit | null; line: string }) {
  const reduce = useReduceMotion();
  return (
    <View style={styles.hud}>
      <View style={styles.hudRow}>
        <Text variant="subheading" numberOfLines={1} style={styles.hudName}>
          {boss.name}
        </Text>
        <View style={styles.hpRow}>
          {hit && hit.damage > 0 ? (
            <Animated.View key={hit.id} entering={reduce ? FadeIn : calm.rise()} accessibilityLiveRegion="polite">
              <Text variant="number" color={hit.technique ? colors.brass : colors.parchment}>
                −{hit.damage}
                {hit.technique ? ' · técnica!' : ''}
              </Text>
            </Animated.View>
          ) : null}
          {hit && hit.healed > 0 ? (
            <Animated.View key={`h${hit.id}`} entering={reduce ? FadeIn : calm.rise()} accessibilityLiveRegion="polite">
              <Text variant="number" color={colors.ember}>
                +{hit.healed} {boss.trait.kind === 'heads' ? 'regenera' : 'juros'}
              </Text>
            </Animated.View>
          ) : null}
          <Text variant="number" color={colors.ember}>
            {battle.hp}/{battle.maxHp}
          </Text>
        </View>
      </View>
      {boss.trait.kind === 'heads' ? (
        <HeadsBar boss={boss} battle={battle} />
      ) : (
        <ProgressBar value={battle.hp / battle.maxHp} color={colors.ember} height={10} accessibilityLabel={`Vida de ${boss.name}: ${battle.hp} de ${battle.maxHp}`} />
      )}
      <View style={styles.hudRow}>
        <View style={styles.resolve} accessible accessibilityLabel={`Determinação: ${battle.resolve} de ${battle.maxResolve}`}>
          {Array.from({ length: battle.maxResolve }, (_, i) => (
            <Icon key={i} name="shield" size={18} color={i < battle.resolve ? colors.verdigris : colors.ink500} fill={i < battle.resolve ? colors.verdigrisGlow : 'none'} />
          ))}
        </View>
        <View style={styles.hudTags}>
          {boss.trait.kind === 'heads' ? (
            <View style={styles.tag} accessible accessibilityLabel={`Cabeça de pé: ${headSpans(boss)[activeHeadIndex(boss, battle.hp)].head.name}`}>
              <View style={[styles.headDot, { backgroundColor: headSpans(boss)[activeHeadIndex(boss, battle.hp)].head.color }]} />
              <Text variant="caption" color={colors.mist}>
                {headSpans(boss)[activeHeadIndex(boss, battle.hp)].head.name}
              </Text>
            </View>
          ) : !battle.armorBroken ? (
            <View style={styles.tag} accessible accessibilityLabel={`${boss.trait.name} ativa`}>
              <Icon name={traitIcon(boss)} size={13} color={colors.mist} />
              <Text variant="caption" color={colors.mist}>
                {boss.trait.kind === 'armor' ? 'couraça' : 'cofre'}
              </Text>
            </View>
          ) : null}
          {battle.combo > 0 ? (
            <View style={[styles.tag, { backgroundColor: colors.brassGlow }]}>
              <Icon name="bolt" size={13} color={colors.brass} fill={colors.brass} strokeWidth={1} />
              <Text variant="caption" color={colors.brass}>combo ×{battle.combo}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Text variant="caption" color={colors.parchmentDim} numberOfLines={2} style={styles.narration}>
        {line}
      </Text>
    </View>
  );
}

function Battle({ boss, battle, onFinished }: { boss: BossDef; battle: BattleState; onFinished: (events: GameEvent[]) => void }) {
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const [shownId, setShownId] = useState<string | null>(battle.currentQuestionId);
  const attempt = useAttempt(shownId);
  const scroll = useRef<ScrollView>(null);
  const feedbackOffset = useRef(0);
  const shake = useSharedValue(0);
  const flash = useSharedValue(0);
  const [hit, setHit] = useState<Hit | null>(null);
  const [line, setLine] = useState<string>(boss.lines.intro[2]);
  const finalEvents = useRef<GameEvent[]>([]);

  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [shownId]);

  // Rever golpes anteriores sem perder a questão atual (seleção, dicas, rolagem e tempo).
  const reviewItems = useMemo(() => battleReviewItems(battle, !!attempt.outcome), [battle, attempt.outcome]);
  const review = useReview(reviewItems);
  const reviewed = review.item;
  const savedScroll = useRef(0);
  const { setPaused } = attempt;
  const openReview = useCallback(() => {
    setPaused(true);
    review.open();
  }, [review, setPaused]);
  const closeReview = useCallback(() => {
    review.close();
    setPaused(false);
    const y = savedScroll.current;
    requestAnimationFrame(() => scroll.current?.scrollTo({ y, animated: false }));
  }, [review, setPaused]);
  const reviewedAttempt = useMemo(() => (reviewed ? reviewAttempt(reviewed) : null), [reviewed]);
  useEffect(() => {
    if (reviewed) scroll.current?.scrollTo({ y: 0, animated: false });
  }, [reviewed]);
  useEffect(() => {
    if (!reviewed) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closeReview();
      return true;
    });
    return () => sub.remove();
  }, [reviewed, closeReview]);

  const artStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }], opacity: 1 - flash.value * 0.45 }));

  const question = shownId ? findQuestion(shownId) : undefined;

  const send = async (input: Parameters<typeof battleAnswer>[0]) => {
    const events = await battleAnswer(input);
    const after = useGameStore.getState().game?.battle;
    const turn = after?.turns[after.turns.length - 1];
    if (after && turn) {
      if (turn.correct) {
        haptic(turn.technique ? 'heavy' : 'impact');
        setHit({ id: after.turns.length, damage: turn.damage, technique: turn.technique, healed: 0 });
        if (!reduce) {
          shake.set(withSequence(withTiming(10, { duration: 60 }), withTiming(-8, { duration: 70 }), withTiming(0, { duration: 80 })));
          flash.set(withSequence(withTiming(1, { duration: 80 }), withTiming(0, { duration: 260 })));
        }
        const felled = boss.trait.kind === 'heads' && (turn.headsFelled ?? 0) > 0 ? boss.trait.heads[headsFelled(boss, after.hp) - 1] : null;
        setLine(
          felled && after.status !== 'won'
            ? felled.fall
            : turn.armorBroke
            ? boss.lines.phase2
            : turn.technique
              ? boss.technique.line
              : after.status === 'won'
                ? boss.lines.defeat
                : pickLine(boss.lines.playerHit, after.turns.length),
        );
      } else {
        setHit((turn.healed ?? 0) > 0 ? { id: after.turns.length, damage: 0, technique: false, healed: turn.healed ?? 0 } : null);
        setLine(after.status === 'retreated' ? boss.lines.retreat : pickLine(boss.lines.bossHit, after.turns.length));
      }
      if (after.status !== 'active') finalEvents.current = events;
    }
    return events;
  };

  const onContinue = () => {
    const b = useGameStore.getState().game?.battle;
    if (!b || b.status !== 'active') onFinished(finalEvents.current);
    else setShownId(b.currentQuestionId);
  };

  const onClose = () => {
    Alert.alert('Recuar da batalha?', 'Você pode retomar depois — a batalha fica salva. Recuar agora conta como retirada.', [
      { text: 'Continuar lutando', style: 'cancel' },
      { text: 'Pausar e sair', onPress: () => router.back() },
      {
        text: 'Recuar',
        style: 'destructive',
        onPress: async () => {
          await retreat();
          onFinished([]);
        },
      },
    ]);
  };

  const ended = useGameStore((s) => s.game?.battle?.status !== 'active');

  return (
    <View style={styles.root}>
      <MapBackdrop glow={boss.accent} />
      <View style={[styles.top, { paddingTop: insets.top + space.xs }]}>
        <IconButton icon="close" label="Pausar ou recuar" onPress={onClose} color={colors.parchment} />
        <View style={{ flex: 1 }}>
          <Hud boss={boss} battle={battle} hit={hit} line={line} />
        </View>
      </View>
      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={64}
        onScroll={(e) => {
          if (!reviewed) savedScroll.current = e.nativeEvent.contentOffset.y;
        }}
      >
        <View style={styles.arena} onLayout={(e) => (feedbackOffset.current = e.nativeEvent.layout.height + space.lg)}>
          <Animated.View style={artStyle}>
            <BossArt art={boss.art} size={150} cracked={battle.armorBroken} defeated={battle.status === 'won'} headsFelled={headsFelled(boss, battle.hp)} />
          </Animated.View>
        </View>
        {reviewed && reviewedAttempt ? (
          <View style={{ gap: space.lg }}>
            <ReviewBanner review={review} label="o golpe" />
            <QuestionBody question={getQuestion(reviewed.questionId)} attempt={reviewedAttempt} attemptKey={battle.id} readOnly />
          </View>
        ) : question ? (
          <QuestionBody
            question={question}
            attempt={attempt}
            attemptKey={battle.id}
            onFeedbackLayout={(y) => scroll.current?.scrollTo({ y: Math.max(0, y + feedbackOffset.current - 140), animated: !reduce })}
          />
        ) : null}
      </ScrollView>
      {reviewed ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
          <ReviewBar review={review} returnLabel="Voltar à questão atual" />
        </View>
      ) : question ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
          <AnswerBar
            attempt={attempt}
            onPrevious={reviewItems.length > 0 ? openReview : undefined}
            confirmLabel="Atacar"
            onConfirm={() => attempt.submit(send)}
            onContinue={onContinue}
            continueLabel={ended ? 'Ver resultado' : 'Próximo golpe'}
          />
        </View>
      ) : null}
    </View>
  );
}

// ——————————————————————————————————————————————— resultado

function Result({ boss, battle, events }: { boss: BossDef; battle: BattleState; events: GameEvent[] }) {
  const reduce = useReduceMotion();
  const progress = useGame((g) => g.bosses[boss.id]);
  const won = battle.status === 'won';
  const items = events.filter((e): e is Extract<GameEvent, { type: 'item' }> => e.type === 'item' && e.source.startsWith('boss:'));
  const correct = battle.turns.filter((t) => t.correct).length;
  const [busy, setBusy] = useState(false);

  const leave = async () => {
    await dismissBattle();
    router.replace('/atlas');
  };
  const again = async () => {
    setBusy(true);
    try {
      await dismissBattle();
      await beginBattle(boss.id);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    haptic(won ? 'success' : 'error');
  }, [won]);

  return (
    <Screen
      glow={won ? colors.brass : boss.accent}
      footer={
        <>
          {!won ? <Button label="Tentar de novo" icon="sword" onPress={again} loading={busy} /> : null}
          <Button label="Voltar ao Atlas" variant={won ? 'primary' : 'ghost'} onPress={leave} />
        </>
      }
    >
      <Animated.View entering={reduce ? undefined : FadeIn.duration(500)} style={styles.introArt}>
        <BossArt art={boss.art} size={190} defeated={won} cracked headsFelled={headsFelled(boss, battle.hp)} />
      </Animated.View>
      <View style={styles.center}>
        <Text variant="label" color={won ? colors.brass : colors.mist}>
          {won ? 'Guardião derrotado' : 'Retirada estratégica'}
        </Text>
        <Text variant="hero" align="center">
          {won ? 'Vitória!' : 'Ainda não.'}
        </Text>
        <Text variant="question" align="center" style={styles.quote}>
          “{won ? boss.lines.defeat : boss.lines.retreat}”
        </Text>
      </View>

      <View style={styles.resultStats}>
        <Panel style={styles.resultStat} corners={false}>
          <Text variant="title" color={colors.brass}>+{battle.xpEarned}</Text>
          <Text variant="caption" color={colors.mist}>XP</Text>
        </Panel>
        <Panel style={styles.resultStat} corners={false}>
          <Text variant="title" color={colors.verdigris}>{correct}/{battle.turns.length}</Text>
          <Text variant="caption" color={colors.mist}>golpes certeiros</Text>
        </Panel>
        <Panel style={styles.resultStat} corners={false}>
          <Text variant="title">×{battle.maxCombo}</Text>
          <Text variant="caption" color={colors.mist}>maior combo</Text>
        </Panel>
      </View>

      {items.length > 0 ? (
        <View style={{ gap: space.sm }}>
          <Text variant="label" color={colors.brass}>Espólios</Text>
          {items.map((e) => {
            const item = getItem(e.itemId);
            return (
              <View key={e.itemId} style={[styles.loot, { borderColor: rarityColor[item.rarity] }]}>
                <ItemGlyph itemId={e.itemId} size={48} />
                <View style={{ flex: 1 }}>
                  <Text variant="subheading">{item.name}</Text>
                  <Text variant="caption" color={rarityColor[item.rarity]}>
                    {RARITY_LABEL[item.rarity]}
                  </Text>
                  <Text variant="caption" color={colors.parchmentDim}>
                    {item.description}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {!won ? (
        <Panel accent={colors.iris}>
          <Text variant="subheading">Como voltar mais forte</Text>
          <Text variant="body" color={colors.parchmentDim}>
            As questões que você errou viraram Ecos e voltam amanhã para revisão. Na próxima tentativa, você terá Conhecimento do Inimigo: +
            {Math.min(30, (progress?.failedSinceWin ?? 1) * 10)}% de dano.
          </Text>
        </Panel>
      ) : null}
    </Screen>
  );
}

function resolveBoss(id: string | undefined): BossDef {
  try {
    return getBoss(id ?? BOSSES[0].id);
  } catch {
    return BOSSES[0];
  }
}

export default function BossScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const saved = useGame((g) => g.battle);
  const [finalEvents, setFinalEvents] = useState<GameEvent[]>([]);
  // Mantém a tela de batalha até o jogador ver o feedback do último golpe.
  const [fighting, setFighting] = useState<string | null>(null);
  // Batalha que esta tela mostrou (para exibir o resultado dela mesmo que a rota peça outro chefão).
  const [shown, setShown] = useState<string | null>(null);
  const activeId = saved?.status === 'active' ? saved.id : null;
  if (activeId && fighting !== activeId) setFighting(activeId);
  if (activeId && shown !== activeId) setShown(activeId);
  // Uma batalha em andamento sempre manda. Já o resultado de uma batalha encerrada contra
  // outro chefão, que esta tela não mostrou, não aparece ao abrir este: vale a introdução.
  const stale =
    !!saved && saved.status !== 'active' && shown !== saved.id && !!params.id && saved.bossId !== params.id;
  const battle = stale ? null : saved;
  const boss = resolveBoss(battle?.bossId ?? params.id);

  if (!battle) return <Intro boss={boss} />;
  if (battle.status === 'active' || fighting === battle.id) {
    return (
      <Battle
        key={battle.id}
        boss={boss}
        battle={battle}
        onFinished={(events) => {
          setFinalEvents(events);
          setFighting(null);
        }}
      />
    );
  }
  return <Result boss={boss} battle={battle} events={finalEvents} />;
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingLeft: space.xxxl - 4 },
  headDot: { width: 9, height: 9, borderRadius: 5 },
  root: { flex: 1, backgroundColor: colors.ink900 },
  introArt: { alignItems: 'center', paddingTop: space.lg },
  center: { alignItems: 'center', gap: space.xs },
  lines: { gap: space.sm },
  quote: { fontStyle: 'italic', color: colors.parchmentDim },
  rule: { flexDirection: 'row', gap: space.md, paddingVertical: space.sm },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: space.xs, paddingHorizontal: space.sm, paddingBottom: space.sm },
  hud: { gap: 6, paddingRight: space.md, paddingTop: 4 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm },
  hudName: { flexShrink: 1 },
  hudTags: { flexDirection: 'row', gap: space.xs },
  resolve: { flexDirection: 'row', gap: 4 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, height: 24, borderRadius: radius.pill, backgroundColor: colors.ink800 },
  content: { paddingHorizontal: space.xl, paddingBottom: space.xxxl, gap: space.lg },
  arena: { alignItems: 'center' },
  hpRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexShrink: 0 },
  narration: { fontStyle: 'italic' },
  footer: { paddingHorizontal: space.xl, paddingTop: space.md, backgroundColor: colors.ink900, borderTopWidth: 1, borderTopColor: colors.lineSoft },
  resultStats: { flexDirection: 'row', gap: space.sm },
  resultStat: { flex: 1, alignItems: 'center', paddingVertical: space.lg },
  loot: { flexDirection: 'row', gap: space.md, alignItems: 'center', padding: space.md, borderRadius: radius.md, borderWidth: 1.2, backgroundColor: colors.ink800 },
});
