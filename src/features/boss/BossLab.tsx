/** Exercita a mesma arena e o mesmo motor do jogo; disponível apenas no laboratório QA. */
import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Platform, ScrollView, View } from 'react-native';
import { BOSSES } from '../../content/bosses';
import { questionsFor } from '../../content/bank';
import { applyBattleAnswer, createBattle, knowledgeSeals } from '../../domain/boss/battle';
import { fullDelta, startBattle } from '../../domain/game/game';
import { REGIONS } from '../../content/regions';
import { requireController } from '../../state/session';
import { Button } from '../../ui/Button';
import { Text } from '../../ui/Text';
import { colors, space } from '../../ui/theme';
import { BossStage } from './BossStage';

export function BossLab() {
  const [index, setIndex] = useState(0);
  const boss = BOSSES[index];
  const [battle, setBattle] = useState(() => createBattle(boss, 'lab', 0, 0));
  const openCombat = async () => {
    if (Platform.OS !== 'web' || process.env.EXPO_PUBLIC_QA !== '1') return;
    try {
      await requireController().dispatch((state, now) => {
        const campaign = { ...state.campaign };
        for (const region of REGIONS) for (const node of region.nodes) if (node.kind === 'mission') {
          campaign[node.id] = { nodeId: node.id, completedAt: now, bestCorrect: 5, runs: 1, bestScore: 1000, bestStars: 3, lastScore: 1000 };
        }
        const next = startBattle({ ...state, campaign, battle: null, session: null }, boss.id, `qa-${now}`, now);
        return { ...next, delta: fullDelta(next.state) };
      });
      router.push({ pathname: '/boss', params: { id: boss.id } });
    } catch (error) { Alert.alert('Falha no teste', String(error)); }
  };
  const hit = (correct: boolean) => {
    const pool = questionsFor({ topics: boss.topics, subtopics: boss.subtopics });
    const seals = knowledgeSeals(battle);
    const q = pool.find(q => !seals.includes(`${q.topic}:${q.subtopic}`)) ?? pool[0];
    setBattle(applyBattleAnswer(boss, { ...battle, currentQuestionId: q.id }, {
      questionId: q.id, difficulty: 2, correct, guessed: false, hints: 0, knowledgeKey: `${q.topic}:${q.subtopic}`,
    }).battle);
  };
  return <ScrollView style={{ flex: 1, backgroundColor: colors.ink900 }} contentContainerStyle={{ padding: space.xl, gap: space.lg }}>
    <Text variant="title">Laboratório de chefes</Text>
    <Text variant="caption" color={colors.mist}>QA · não altera o progresso da conta</Text>
    <Text variant="heading">{boss.name}</Text>
    <BossStage key={boss.id} boss={boss} battle={battle} />
    <Text variant="body">Vida {battle.hp}/{battle.maxHp} · Selos {knowledgeSeals(battle).length}/3 · Determinação {battle.resolve}</Text>
    <Text variant="caption" accessibilityLiveRegion="polite">{battle.turns.at(-1)?.convergence ? 'Convergência liberada!' : battle.armorBroken ? 'Poder revelado' : 'Couraça ativa'}</Text>
    <View style={{ gap: space.sm }}>
      {Platform.OS === 'web' ? <Button label="Abrir combate real de teste" variant="secondary" onPress={openCombat} /> : null}
      <Button label="Simular acerto consciente" onPress={() => hit(true)} disabled={battle.status !== 'active'} />
      <Button label="Simular erro" variant="secondary" onPress={() => hit(false)} disabled={battle.status !== 'active'} />
      <Button label="Reiniciar batalha de teste" variant="ghost" onPress={() => setBattle(createBattle(boss, 'lab', 0, 0))} />
      <Button label="Próximo chefe de teste" variant="secondary" onPress={() => {
        const next = (index + 1) % BOSSES.length;
        setIndex(next); setBattle(createBattle(BOSSES[next], 'lab', 0, 0));
      }} />
    </View>
  </ScrollView>;
}
