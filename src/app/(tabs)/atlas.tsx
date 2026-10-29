/**
 * Atlas — a campanha como um mapa que você redesenha. Caminho em zigue-zague,
 * nós como medalhões; regiões vencidas continuam abertas para revisão.
 */
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { REGIONS, findNode, type CampaignNode } from '../../content/regions';
import { nodeStatus, regionCompletion, type NodeStatus } from '../../domain/campaign/campaign';
import { missionPool } from '../../domain/game/game';
import { unseenCount } from '../../domain/learning/missionPlan';
import { useStarter } from '../../features/useStarter';
import { startMission } from '../../state/actions';
import { useGame } from '../../state/store';
import { useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { Panel } from '../../ui/Panel';
import { ProgressBar } from '../../ui/ProgressBar';
import { Screen } from '../../ui/Screen';
import { Stars } from '../../ui/Stars';
import { Text } from '../../ui/Text';
import { TAB_BAR_SPACE, colors, space } from '../../ui/theme';

const MEDAL = 66;

function Medallion({ node, status }: { node: CampaignNode; status: NodeStatus }) {
  const boss = node.kind === 'boss';
  const color = status === 'completed' ? colors.brass : status === 'available' ? (boss ? colors.ember : colors.verdigris) : colors.ink500;
  return (
    <View
      style={[
        styles.medal,
        {
          borderColor: color,
          backgroundColor: status === 'completed' ? colors.brass : colors.ink800,
          width: boss ? MEDAL + 10 : MEDAL,
          height: boss ? MEDAL + 10 : MEDAL,
          borderRadius: boss ? 22 : MEDAL / 2,
          transform: boss ? [{ rotate: '45deg' }] : undefined,
        },
        status === 'available' && styles.medalGlow,
      ]}
    >
      <View style={boss ? { transform: [{ rotate: '-45deg' }] } : undefined}>
        <Icon
          name={status === 'locked' ? 'lock' : status === 'completed' ? 'check' : boss ? 'sword' : 'flag'}
          size={26}
          color={status === 'completed' ? colors.ink900 : color}
          fill={status === 'available' && !boss ? colors.verdigrisGlow : 'none'}
          strokeWidth={status === 'completed' ? 2.4 : 1.75}
        />
      </View>
    </View>
  );
}

export default function Atlas() {
  const reduce = useReduceMotion();
  const campaign = useGame((g) => g.campaign);
  const bosses = useGame((g) => g.bosses);
  const view = { progress: campaign, bosses };
  const [width, setWidth] = useState(0);
  const { busy, start } = useStarter();
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const questionStates = useGame((g) => g.questionStates);
  const unseen = useMemo(() => {
    const out: Record<string, number> = {};
    for (const r of REGIONS) for (const n of r.nodes) if (n.kind === 'mission') out[n.id] = unseenCount(missionPool(n), questionStates);
    return out;
  }, [questionStates]);

  const open = (node: CampaignNode, status: NodeStatus) => {
    if (status === 'locked') {
      const req = node.requires.map((id) => findNode(id)?.node.title).filter(Boolean).join(', ');
      Alert.alert('Ainda envolto em névoa', `Conclua primeiro: ${req}.`);
      return;
    }
    if (node.kind === 'boss') router.push(`/boss?id=${node.bossId}`);
    else start(node.id, () => startMission(node.id));
  };

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <Text variant="title">Atlas</Text>
      {REGIONS.map((region) => {
        const done = regionCompletion(region, view);
        return (
          <View key={region.id} style={{ gap: space.lg }}>
            <Panel tone="raised" accent={region.color}>
              <Text variant="label" color={region.color}>
                Região {region.index}
              </Text>
              <Text variant="heading">{region.name}</Text>
              <Text variant="caption" color={colors.mist}>
                {region.tagline}
              </Text>
              <Text variant="body" color={colors.parchmentDim} style={{ marginTop: space.sm }}>
                {region.lore}
              </Text>
              <View style={styles.regionProgress}>
                <ProgressBar value={done.done / done.total} height={8} color={region.color} />
                <Text variant="caption" color={colors.mist}>
                  {done.done} de {done.total} marcos redesenhados
                </Text>
              </View>
            </Panel>

            <View onLayout={onLayout}>
              {region.nodes.map((node, i) => {
                const status = nodeStatus(node, view);
                const left = i % 2 === 0;
                const xFrom = left ? 0.22 : 0.78;
                const xTo = left ? 0.78 : 0.22;
                const progress = node.kind === 'mission' ? campaign[node.id] : undefined;
                return (
                  <Animated.View key={node.id} entering={reduce ? undefined : FadeInDown.delay(80 * i).duration(380)}>
                    <Pressable
                      onPress={() => open(node, status)}
                      disabled={busy !== null}
                      accessibilityRole="button"
                      accessibilityLabel={`${node.title}. ${status === 'locked' ? 'Bloqueado' : status === 'completed' ? 'Concluído' : 'Disponível'}`}
                      style={[styles.nodeRow, { flexDirection: left ? 'row' : 'row-reverse' }]}
                    >
                      <View style={[styles.medalSlot, { width: width * 0.44 }]}>
                        <Medallion node={node} status={status} />
                      </View>
                      <View style={[styles.nodeText, { alignItems: left ? 'flex-start' : 'flex-end' }]}>
                        <Text variant="subheading" align={left ? 'left' : 'right'} color={status === 'locked' ? colors.mistDim : colors.parchment}>
                          {node.title}
                        </Text>
                        <Text variant="caption" align={left ? 'left' : 'right'} color={colors.mist}>
                          {node.subtitle}
                        </Text>
                        {progress && node.kind === 'mission' ? (
                          <View style={[styles.record, { justifyContent: left ? 'flex-start' : 'flex-end' }]}>
                            <Stars value={progress.bestStars} size={13} />
                            <Text variant="caption" color={progress.completedAt ? colors.brass : colors.mistDim}>
                              {progress.bestScore !== null ? `recorde ${progress.bestScore}` : `melhor: ${progress.bestCorrect}/${node.questionCount}`}
                            </Text>
                          </View>
                        ) : null}
                        {node.kind === 'mission' && status !== 'locked' && progress ? (
                          <Text variant="caption" color={colors.verdigris} align={left ? 'left' : 'right'}>
                            {unseen[node.id] > 0 ? `${unseen[node.id]} questões inéditas` : 'todas resolvidas · revisão'}
                          </Text>
                        ) : null}
                        {node.kind === 'boss' && bosses[node.bossId]?.wins ? (
                          <Text variant="caption" color={colors.brass}>
                            derrotado {bosses[node.bossId].wins}×
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                    {i < region.nodes.length - 1 && width > 0 ? (
                      <Svg width={width} height={44} style={styles.connector}>
                        <Path
                          d={`M ${width * xFrom} 0 C ${width * xFrom} 30, ${width * xTo} 14, ${width * xTo} 44`}
                          stroke={status === 'completed' ? colors.brass : colors.ink500}
                          strokeWidth={2}
                          strokeDasharray="2 7"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </Svg>
                    ) : null}
                  </Animated.View>
                );
              })}
            </View>
          </View>
        );
      })}

      <Panel tone="sunken" accent={colors.mistDim}>
        <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
          <Icon name="atlas" size={20} color={colors.mist} />
          <Text variant="subheading" color={colors.mist}>
            Além da névoa
          </Text>
        </View>
        <Text variant="caption" color={colors.mistDim} style={{ marginTop: space.xs }}>
          Você chegou às Ilhas da Medida, a última região do Atlas. O Cume do ENEM — com simulados completos — chegará em uma próxima versão.
        </Text>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  regionProgress: { marginTop: space.md, gap: 6 },
  nodeRow: { alignItems: 'center', minHeight: 84 },
  medalSlot: { alignItems: 'center' },
  medal: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  medalGlow: { shadowColor: colors.verdigris, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
  nodeText: { flex: 1, gap: 2, paddingHorizontal: space.xs },
  connector: { marginVertical: -6 },
  record: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
