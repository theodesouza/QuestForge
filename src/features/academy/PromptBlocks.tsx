/** Enunciado de exercícios e exemplos: os blocos das questões, com fórmulas empilhadas. */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Block } from '../../content/types';
import { MathText, RichText } from '../../ui/RichText';
import { colors, radius, space } from '../../ui/theme';
import { StemBlocks } from '../question/StemBlocks';

export const PromptBlocks = memo(function PromptBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <View style={styles.wrap}>
      {blocks.map((b, i) => {
        if (b.kind === 'p') return <RichText key={i} text={b.text} variant="question" />;
        if (b.kind === 'math') {
          return (
            <View key={i} style={styles.math}>
              {b.lines.map((l, j) => (
                <MathText key={j} text={l} />
              ))}
            </View>
          );
        }
        return <StemBlocks key={i} blocks={[b]} />;
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  math: {
    gap: space.xs,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.ink850,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
});
