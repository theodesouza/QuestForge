/**
 * Acampamento — a tela inicial. Em um olhar: quem sou, quanto falta para o
 * próximo nível, qual recompensa me espera, e como começar com UM toque.
 */
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { QUESTIONS } from '../../content/bank';
import { getBoss } from '../../content/bosses';
import { getItem } from '../../content/items';
import { subtopicLabel } from '../../content/topics';
import { nextNode } from '../../domain/campaign/campaign';
import { EXPEDITION_SIZES } from '../../domain/game/game';
import { recommendStages } from '../../domain/academy/recommend';
import { recommendFocus } from '../../domain/learning/recommend';
import { dueQuestionIds } from '../../domain/learning/srs';
import { levelProgress, rankFor } from '../../domain/progression/levels';
import { nextItemLevel } from '../../domain/progression/rewards';
import { RecCard } from '../../features/academy/bits';
import { DailyQuestCard } from '../../features/quests/DailyQuestCard';
import { UpdateBanner } from '../../features/updates/UpdateBanner';
import { useStagePaused } from '../../features/useStagePaused';
import { useStarter } from '../../features/useStarter';
import { dismissRestedNotice, refreshQuests, startEchoHunt, startExpedition, startFocus, startMission, startStageDrill } from '../../state/actions';
import { useGame, useGameStore } from '../../state/store';
import { Astrolabe } from '../../ui/Astrolabe';
import { Button } from '../../ui/Button';
import { Chip } from '../../ui/Chip';
import { useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { IconButton } from '../../ui/IconButton';
import { ItemGlyph } from '../../ui/ItemGlyph';
import { Panel } from '../../ui/Panel';
import { Pill } from '../../ui/Pill';
import { ProgressBar } from '../../ui/ProgressBar';
import { Screen } from '../../ui/Screen';
import { Text } from '../../ui/Text';
import { TAB_BAR_SPACE, colors, radius, space } from '../../ui/theme';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Boa noite';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

const DURATIONS = Object.keys(EXPEDITION_SIZES).map(Number);

export default function Camp() {
  const reduce = useReduceMotion();
  const stagePaused = useStagePaused();
  const profile = useGame((g) => g.profile);
  const questionStates = useGame((g) => g.questionStates);
  const campaign = useGame((g) => g.campaign);
  const bosses = useGame((g) => g.bosses);
  const session = useGame((g) => g.session);
  const battle = useGame((g) => g.battle);
  const restedNotice = useGameStore((s) => s.restedNotice);
  const now = useGameStore((s) => s.now);
  const { busy, start } = useStarter();
  useFocusEffect(
    useCallback(() => {
      refreshQuests().catch(() => undefined);
    }, []),
  );

  const progress = levelProgress(profile.xp);
  const rank = rankFor(progress.level);
  const reward = nextItemLevel(progress.level);
  const next = nextNode({ progress: campaign, bosses });
  const dueCount = useMemo(() => dueQuestionIds(questionStates, now).length, [questionStates, now]);
  const focus = useMemo(() => recommendFocus(QUESTIONS, questionStates), [questionStates]);
  const academy = useGame((g) => g.academy);
  const study = useMemo(
    () => recommendStages({ questionStates, academy, campaign, bosses }, now, { limit: 1 })[0] ?? null,
    [questionStates, academy, campaign, bosses, now],
  );
  const enter = (i: number) => (reduce ? undefined : FadeInDown.delay(60 * i).duration(380));

  const resume = session
    ? { label: session.mode === 'mission' ? 'Missão em andamento' : 'Expedição em andamento', detail: `${Math.min(session.index + 1, session.queue.length)} de ${session.queue.length}`, to: '/session' as const }
    : battle && battle.status === 'active'
      ? { label: 'Batalha em andamento', detail: `${getBoss(battle.bossId).name} com ${battle.hp} de vida`, to: `/boss?id=${battle.bossId}` }
      : null;

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="caption" color={colors.mist}>
            {greeting()}{profile.name ? `, ${profile.name}` : ''}
          </Text>
          <Text variant="title">Acampamento</Text>
        </View>
        <Pressable onPress={() => router.push('/workshop')} accessibilityRole="button" accessibilityLabel={`Tinta: ${profile.ink}. Abrir a Oficina`}>
          <Pill icon="ink" value={String(profile.ink)} color={colors.iris} label="Tinta" />
        </Pressable>
        <IconButton icon="settings" label="Ajustes" onPress={() => router.push('/settings')} />
      </View>

      <UpdateBanner />

      {restedNotice ? (
        <Animated.View entering={enter(0)}>
          <Pressable onPress={dismissRestedNotice} accessibilityRole="button" accessibilityHint="Toque para dispensar">
            <Panel accent={colors.verdigris} tone="raised" style={styles.rested}>
              <Icon name="flame" size={24} color={colors.verdigris} fill={colors.verdigrisGlow} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="subheading" color={colors.verdigris}>
                  Que bom te ver de volta!
                </Text>
                <Text variant="caption" color={colors.parchmentDim}>
                  Enquanto você descansava, acumulou +{restedNotice} de Descanso do Viajante: o XP das próximas questões vale o dobro.
                </Text>
              </View>
            </Panel>
          </Pressable>
        </Animated.View>
      ) : null}

      {resume ? (
        <Animated.View entering={enter(0)}>
          <Pressable onPress={() => router.push(resume.to)} accessibilityRole="button" accessibilityLabel={`${resume.label}, ${resume.detail}. Retomar`}>
            <View style={styles.resume}>
              <Icon name="play" size={18} color={colors.ink900} fill={colors.ink900} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong" color={colors.ink900}>
                  {resume.label}
                </Text>
                <Text variant="caption" color={colors.ink700}>
                  {resume.detail} · nada foi perdido
                </Text>
              </View>
              <Text variant="bodyStrong" color={colors.ink900}>
                Retomar
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      ) : null}

      {/* Herói */}
      <Animated.View entering={enter(1)} style={styles.hero}>
        <Pressable onPress={() => router.push('/hero')} accessibilityRole="button" accessibilityLabel="Ver herói">
          <Astrolabe level={progress.level} equipped={profile.equipped} size={236} animate={!reduce} paused={stagePaused} />
        </Pressable>
        <View style={styles.levelRow}>
          <Text variant="hero">Nível {progress.level}</Text>
        </View>
        <Text variant="subheading" color={colors.brass} align="center">
          {profile.equipped.title ? getItem(profile.equipped.title).name : rank.title}
        </Text>
        <View style={styles.xpBlock}>
          <ProgressBar
            value={progress.ratio}
            ticks={10}
            height={12}
            accessibilityLabel={`Experiência: ${progress.into} de ${progress.span}`}
          />
          <View style={styles.xpLabels}>
            <Text variant="caption" color={colors.mist}>
              {progress.isMax ? 'Nível máximo alcançado' : `${progress.into} / ${progress.span} XP`}
            </Text>
            {!progress.isMax ? (
              <Text variant="caption" color={colors.brass}>
                faltam {progress.remaining} XP
              </Text>
            ) : null}
          </View>
        </View>
        {reward ? (
          <View style={styles.nextReward} accessible accessibilityLabel={`Próxima recompensa no nível ${reward.level}: ${reward.itemIds.map((i) => getItem(i).name).join(' e ')}`}>
            <ItemGlyph itemId={reward.itemIds[0]} size={34} />
            <View style={{ flex: 1 }}>
              <Text variant="label" color={colors.mist}>
                Próxima recompensa · nível {reward.level}
              </Text>
              <Text variant="bodyStrong">{reward.itemIds.map((i) => getItem(i).name).join(' + ')}</Text>
            </View>
          </View>
        ) : null}
        {profile.restedPool > 0 ? (
          <View style={styles.restedTag}>
            <Icon name="flame" size={14} color={colors.verdigris} fill={colors.verdigris} strokeWidth={1} />
            <Text variant="caption" color={colors.verdigris}>
              Descanso do Viajante: XP em dobro nas próximas questões ({profile.restedPool})
            </Text>
          </View>
        ) : null}
      </Animated.View>

      {/* Próxima missão */}
      <Animated.View entering={enter(2)}>
        {next ? (
          <Panel tone="raised" style={styles.mission}>
            <Text variant="label" color={colors.brass}>
              {next.node.kind === 'boss' ? 'Chefão desbloqueado' : 'Próxima missão'} · {next.region.name}
            </Text>
            <Text variant="heading">{next.node.title}</Text>
            <Text variant="body" color={colors.parchmentDim}>
              {next.node.kind === 'mission' ? `${next.node.subtitle} · ${next.node.questionCount} questões` : next.node.subtitle}
            </Text>
            <Button
              label={next.node.kind === 'boss' ? 'Enfrentar o chefão' : 'Começar missão'}
              icon={next.node.kind === 'boss' ? 'sword' : 'play'}
              loading={busy === 'mission'}
              onPress={() => {
                const node = next.node;
                if (node.kind === 'boss') router.push(`/boss?id=${node.bossId}`);
                else start('mission', () => startMission(node.id));
              }}
              style={{ marginTop: space.sm }}
            />
          </Panel>
        ) : (
          <Panel tone="raised" style={styles.mission}>
            <Text variant="label" color={colors.verdigris}>
              Região conquistada
            </Text>
            <Text variant="heading">Todas as regiões abertas foram conquistadas.</Text>
            <Text variant="body" color={colors.parchmentDim}>
              Novas regiões serão reveladas em próximas atualizações. Enquanto isso, mantenha o mapa vivo com expedições e caçando Ecos.
            </Text>
          </Panel>
        )}
      </Animated.View>

      {/* Encomendas do dia */}
      <Animated.View entering={enter(3)}>
        <DailyQuestCard />
      </Animated.View>

      {/* Expedição rápida */}
      <Animated.View entering={enter(3)} style={styles.section}>
        <View style={styles.sectionHead}>
          <Text variant="subheading">Expedição rápida</Text>
          <Text variant="caption" color={colors.mist}>
            questões adaptadas a você
          </Text>
        </View>
        <View style={styles.durations}>
          {DURATIONS.map((m) => (
            <Chip
              key={m}
              label={`${m} min`}
              icon={m === profile.dailyMinutes ? 'clock' : undefined}
              selected={busy === `exp${m}`}
              accessibilityLabel={`Expedição de ${m} minutos, ${EXPEDITION_SIZES[m]} questões`}
              onPress={() => start(`exp${m}`, () => startExpedition(m))}
            />
          ))}
        </View>
      </Animated.View>

      {/* Treinador */}
      <Animated.View entering={enter(4)} style={styles.row}>
        <Pressable
          style={[styles.tile, dueCount === 0 && styles.tileDisabled]}
          disabled={dueCount === 0}
          accessibilityRole="button"
          accessibilityLabel={dueCount ? `Caçar Ecos: ${dueCount} prontos` : 'Nenhum Eco pronto agora'}
          onPress={() => start('echo', startEchoHunt)}
        >
          <Icon name="echo" size={22} color={colors.iris} />
          <Text variant="subheading">{dueCount > 0 ? `${dueCount} Eco${dueCount > 1 ? 's' : ''} à espreita` : 'Sem Ecos agora'}</Text>
          <Text variant="caption" color={colors.mist}>
            {dueCount > 0 ? 'Derrotar um Eco vale 150% de XP' : 'Erros voltam no dia seguinte para revisão'}
          </Text>
        </Pressable>
        {focus ? (
          <Pressable
            style={styles.tile}
            accessibilityRole="button"
            accessibilityLabel={`Treino sugerido: ${subtopicLabel(focus.topic, focus.subtopic)}`}
            onPress={() => start('focus', () => startFocus(focus.topic, focus.subtopic))}
          >
            <Icon name="target" size={22} color={colors.verdigris} />
            <Text variant="subheading" numberOfLines={2}>
              {subtopicLabel(focus.topic, focus.subtopic)}
            </Text>
            <Text variant="caption" color={colors.mist}>
              {focus.reason === 'fraco'
                ? 'Seu ponto mais frágil agora'
                : focus.reason === 'descoberta'
                  ? 'Ainda em descoberta'
                  : focus.reason === 'inexplorado'
                    ? 'Muito cobrado no ENEM, ainda inexplorado'
                    : 'Consolide o que já sabe'}
            </Text>
          </Pressable>
        ) : null}
      </Animated.View>

      {/* Academia */}
      <Animated.View entering={enter(5)} style={styles.section}>
        <View style={styles.sectionHead}>
          <Text variant="subheading">Academia</Text>
          <Pressable onPress={() => router.push('/academy')} accessibilityRole="button" accessibilityLabel="Abrir a Academia" hitSlop={8}>
            <Text variant="caption" color={colors.brass}>
              todas as aulas
            </Text>
          </Pressable>
        </View>
        {study ? (
          <RecCard rec={study} onTest={(ref) => start('drill', () => startStageDrill(ref))} />
        ) : (
          <Pressable onPress={() => router.push('/academy')} accessibilityRole="button" style={styles.tile}>
            <Icon name="scroll" size={22} color={colors.verdigris} />
            <Text variant="subheading">Aprenda no seu ritmo</Text>
            <Text variant="caption" color={colors.mist}>
              Aulas em etapas, da descoberta à maestria, com laboratórios e desafios.
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rested: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.brass,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    minHeight: 60,
  },
  hero: { alignItems: 'center', gap: space.xs, paddingTop: space.sm },
  levelRow: { marginTop: space.sm },
  xpBlock: { alignSelf: 'stretch', gap: 6, marginTop: space.md },
  xpLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  nextReward: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.sm,
    padding: space.sm,
    paddingRight: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ink850,
  },
  restedTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.sm },
  mission: { gap: space.xs },
  section: { gap: space.md },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  durations: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  row: { flexDirection: 'row', gap: space.md },
  tile: {
    flex: 1,
    gap: space.xs,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.ink800,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    minHeight: 132,
  },
  tileDisabled: { opacity: 0.6 },
});
