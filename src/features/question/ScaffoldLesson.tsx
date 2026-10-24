import { StyleSheet, View } from 'react-native';
import { subtopicLabel } from '../../content/topics';
import type { Question } from '../../content/types';
import { inlineLabel } from '../../domain/quests/quests';
import { Icon } from '../../ui/Icon';
import { Panel } from '../../ui/Panel';
import { Text } from '../../ui/Text';
import { colors, space } from '../../ui/theme';
import { StemBlocks } from './StemBlocks';
import { SolutionSheet } from './SolutionSheet';

export function ScaffoldLesson({ example, practice }: { example: Question; practice: Question }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <Icon name="lantern" size={26} color={colors.brass} />
        <Text variant="heading" accessibilityRole="header">Vamos por partes</Text>
      </View>
      <Text color={colors.mist}>Antes de tentar de novo, acompanhe um exemplo de {inlineLabel(subtopicLabel(example.topic, example.subtopic))}.</Text>
      <Panel accent={colors.iris}>
        <Text variant="label" color={colors.iris}>A ideia principal</Text>
        <Text>{example.concept}</Text>
      </Panel>
      <Text variant="heading" accessibilityRole="header">Exemplo resolvido</Text>
      <StemBlocks blocks={example.stem} />
      <Text variant="ask">{example.ask}</Text>
      <SolutionSheet question={example} />
      <Text variant="caption" color={colors.mist}>Este exemplo é só para leitura: não conta como resposta, domínio ou XP.</Text>
      <Panel>
        <Text variant="label" color={colors.brass}>Agora é sua vez</Text>
        <Text>A próxima questão trabalha {inlineLabel(subtopicLabel(practice.topic, practice.subtopic))} com uma base mais acessível. Depois, seguimos a expedição.</Text>
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm },
});
