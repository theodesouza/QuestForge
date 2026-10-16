/**
 * Revelação de item conquistado — a cerimônia cresce com a raridade:
 *   comum     cartão sobe com um brilho simples
 *   incomum   + anel de luz e faíscas
 *   raro      + energia convergindo antes da revelação e raios girando atrás
 *   épico     + carga mais longa, raios duplos, ondas de choque
 *   lendário  + escuridão maior, carga longa, coroa de raios dourada, várias ondas
 * Mostra o astrolábio já com o item (prévia de como fica) e oferece equipar na hora.
 * Espera a celebração de nível e não aparece no meio de uma questão ou batalha.
 * Com movimento reduzido: só um fade, sem carga nem partículas.
 */
import { usePathname } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Circle, Polygon } from 'react-native-svg';
import { RARITY_LABEL, RARITY_TIER, SLOT_LABEL, getItem } from '../../content/items';
import { BOSSES } from '../../content/bosses';
import { dismissReveal, equip } from '../../state/actions';
import { useGameStore } from '../../state/store';
import { Astrolabe } from '../../ui/Astrolabe';
import { Button } from '../../ui/Button';
import { haptic, useReduceMotion } from '../../ui/feedback';
import { Text } from '../../ui/Text';
import { colors, fonts, radius, rarityColor, space } from '../../ui/theme';
import { resolveSynergy } from '../../ui/vfx/synergy';
import { levelForXp } from '../../domain/progression/levels';
import { C, FxProvider, Particles, Spin, Wave } from '../../ui/vfx/engine';
import { ray } from '../../ui/vfx/geometry';

const HOLD_ON: readonly string[] = ['/session', '/boss'];
/** Duração da carga de energia antes da revelação, por raridade (ms). */
const CHARGE_MS = [0, 0, 650, 950, 1400] as const;

function sourceLabel(source: string): string {
  if (source.startsWith('level:')) return `Recompensa do nível ${source.slice(6)}`;
  if (source === 'oficina') return 'Forjado na Oficina';
  if (source === 'encomendas') return 'Prêmio da semana de encomendas';
  if (source.startsWith('boss:')) {
    const [, id, extra] = source.split(':');
    const boss = BOSSES.find((b) => b.id === id);
    return extra === 'flawless' ? `Feito perfeito contra ${boss?.name ?? 'o chefão'}` : `Espólio de ${boss?.name ?? 'um chefão'}`;
  }
  return 'Nova conquista';
}

export function ItemRevealOverlay() {
  const reveal = useGameStore((s) => s.reveals[0]);
  const celebrating = useGameStore((s) => s.celebrations.length > 0);
  const game = useGameStore((s) => s.game);
  const pathname = usePathname();
  if (!reveal || !game || celebrating || HOLD_ON.includes(pathname)) return null;
  return <Reveal key={reveal.id} revealId={reveal.id} itemId={reveal.itemId} source={reveal.source} level={levelForXp(game.profile.xp)} />;
}

function Reveal({ revealId, itemId, source, level }: { revealId: string; itemId: string; source: string; level: number }) {
  const reduce = useReduceMotion();
  const insets = useSafeAreaInsets();
  const item = getItem(itemId);
  const tier = RARITY_TIER[item.rarity];
  const color = rarityColor[item.rarity];
  const equipped = useGameStore((s) => s.game?.profile.equipped);
  const [phase, setPhase] = useState<'charge' | 'shown'>(reduce || CHARGE_MS[tier] === 0 ? 'shown' : 'charge');
  const [busy, setBusy] = useState(false);
  const announced = useRef(false);

  useEffect(() => {
    if (phase !== 'charge') return;
    haptic('impact');
    const t = setTimeout(() => setPhase('shown'), CHARGE_MS[tier]);
    return () => clearTimeout(t);
  }, [phase, tier]);

  useEffect(() => {
    if (phase !== 'shown' || announced.current) return;
    announced.current = true;
    haptic(tier >= 3 ? 'heavy' : 'success');
    if (tier >= 4) setTimeout(() => haptic('success'), 180);
    AccessibilityInfo.announceForAccessibility(`Novo item ${RARITY_LABEL[item.rarity]}: ${item.name}. ${SLOT_LABEL[item.slot]}.`);
  }, [phase, tier, item]);

  // Prévia: o astrolábio com o item novo (títulos não mudam o astrolábio).
  const preview = useMemo(() => {
    if (!equipped || item.slot === 'title') return null;
    return { ...equipped, [item.slot]: itemId };
  }, [equipped, item.slot, itemId]);
  const isEquipped = equipped?.[item.slot] === itemId;
  // A sinergia só depende de núcleo e aura: para molduras e títulos não faz sentido citá-la.
  const synergy = preview && (item.slot === 'core' || item.slot === 'aura') ? resolveSynergy(preview) : null;
  const stage = 300;
  const close = () => dismissReveal(revealId);

  return (
    <Animated.View
      entering={FadeIn.duration(reduce ? 120 : 220)}
      exiting={FadeOut.duration(200)}
      style={[StyleSheet.absoluteFill, styles.scrim, { backgroundColor: tier >= 4 ? 'rgba(4,6,14,0.97)' : colors.scrim }]}
      accessibilityViewIsModal
    >
      <View style={[styles.content, { paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + space.lg }]}>
        <View style={{ width: stage, height: stage, alignItems: 'center', justifyContent: 'center' }}>
          <FxProvider value={{ animate: !reduce, density: 1, px: stage }}>
            {phase === 'charge' ? (
              <>
                <Particles mode="converge" count={6 + tier * 4} period={Math.max(700, CHARGE_MS[tier])} colors={[color, '#FFFFFF']} size={[3, 5]} radius={[20, 118]} glow={tier >= 3} seed={7} />
                <Wave period={Math.max(700, CHARGE_MS[tier])} from={110} to={18} drawnAt={60} peak={0.6}>
                  <Circle cx={C} cy={C} r={60} stroke={color} strokeWidth={2} fill="none" />
                </Wave>
              </>
            ) : (
              <>
                {tier >= 2 && !reduce ? (
                  <Spin period={tier >= 4 ? 28000 : 18000} opacity={tier >= 4 ? 0.55 : 0.4}>
                    {Array.from({ length: tier >= 4 ? 24 : 12 }, (_, i) => (
                      <Polygon key={i} points={ray(i * (tier >= 4 ? 15 : 30), 40, 120, tier >= 4 ? 2.4 : 3.5)} fill={color} />
                    ))}
                  </Spin>
                ) : null}
                {tier >= 3 && !reduce ? (
                  <Spin period={20000} reverse opacity={0.35}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <Polygon key={i} points={ray(i * 30 + 15, 50, 110, 1.8)} fill="#FFFFFF" />
                    ))}
                  </Spin>
                ) : null}
                {tier >= 1 && !reduce
                  ? Array.from({ length: Math.min(3, tier) }, (_, i) => (
                      <Wave key={i} period={1800 + tier * 300} phase={i / 3} from={70} to={120} drawnAt={100} peak={0.5} hold={0.3}>
                        <Circle cx={C} cy={C} r={100} stroke={color} strokeWidth={2} fill="none" />
                      </Wave>
                    ))
                  : null}
                {tier >= 1 && !reduce ? (
                  <Particles mode="radial" count={4 + tier * 3} period={2200} colors={[color, '#FFFFFF']} size={[2.5, 4]} radius={[60, 118]} sparkle glow={tier >= 4} seed={13} />
                ) : null}
              </>
            )}
          </FxProvider>

          {phase === 'shown' ? (
            <Animated.View entering={reduce ? FadeIn : ZoomIn.springify().damping(12 + (4 - tier))} style={StyleSheet.absoluteFill}>
              <View style={styles.center}>
                {preview ? (
                  <Astrolabe level={level} equipped={preview} size={stage * 0.82} animate={!reduce} />
                ) : (
                  <View style={[styles.titleBadge, { borderColor: color }]}>
                    <Text variant="label" color={colors.mist}>
                      Título
                    </Text>
                    <Text variant="title" color={color} align="center">
                      {item.name}
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          ) : null}
        </View>

        {phase === 'shown' ? (
          <Animated.View entering={reduce ? FadeIn : FadeInDown.delay(180).duration(360)} style={styles.info} accessible accessibilityRole="header">
            <Text variant="label" color={color} style={[styles.rarity, tier >= 4 && styles.rarityLegend]}>
              {RARITY_LABEL[item.rarity]} · {SLOT_LABEL[item.slot]}
            </Text>
            <Text variant="title" align="center">
              {item.name}
            </Text>
            <Text variant="body" color={colors.parchmentDim} align="center">
              {item.description}
            </Text>
            <Text variant="caption" color={colors.mist} align="center">
              {sourceLabel(source)}
            </Text>
            {synergy ? (
              <Text variant="caption" color={color} align="center">
                Com o seu equipamento: {synergy.label}
              </Text>
            ) : null}
          </Animated.View>
        ) : (
          <View style={styles.info}>
            <Text variant="label" color={color} style={styles.rarity}>
              Algo {tier >= 4 ? 'lendário' : tier >= 3 ? 'épico' : 'raro'} se forma…
            </Text>
          </View>
        )}

        {phase === 'shown' ? (
          <Animated.View entering={reduce ? FadeIn : FadeIn.delay(350)} style={styles.actions}>
            {preview && !isEquipped ? (
              <Button
                label="Equipar agora"
                icon="sparkle"
                loading={busy}
                onPress={async () => {
                  setBusy(true);
                  try {
                    await equip(itemId);
                    haptic('success');
                  } finally {
                    setBusy(false);
                    close();
                  }
                }}
              />
            ) : null}
            <Button label={isEquipped ? 'Já está equipado · Continuar' : 'Continuar'} variant={preview && !isEquipped ? 'ghost' : 'primary'} onPress={close} />
          </Animated.View>
        ) : (
          <Pressable onPress={() => setPhase('shown')} accessibilityRole="button" accessibilityLabel="Revelar agora" style={styles.skip}>
            <Text variant="caption" color={colors.mistDim}>
              Toque para revelar
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrim: { zIndex: 110 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl, gap: space.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  info: { alignItems: 'center', gap: space.xs, minHeight: 60 },
  rarity: { letterSpacing: 2 },
  rarityLegend: { fontFamily: fonts.display, fontSize: 15, letterSpacing: 4 },
  actions: { alignSelf: 'stretch', gap: space.sm },
  titleBadge: {
    paddingVertical: space.lg,
    paddingHorizontal: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    backgroundColor: colors.ink800,
    alignItems: 'center',
    gap: 4,
  },
  skip: { padding: space.md },
});
