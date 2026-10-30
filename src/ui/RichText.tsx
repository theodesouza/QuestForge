/**
 * Texto das aulas: **negrito** no meio da frase e fórmulas com frações empilhadas
 * (`[[numerador|denominador]]`). Linhas de resolução que começam com `$` são fórmulas.
 */
import { memo } from 'react';
import { StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';
import { Text } from './Text';
import { colors, fonts, type TypeVariant } from './theme';

interface RichProps {
  text: string;
  variant?: TypeVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: StyleProp<TextStyle>;
  /** Cor do **negrito** (padrão: a mesma do texto). */
  strongColor?: string;
}

/** Remove a marcação para leitores de tela e rótulos. */
export function plain(text: string): string {
  return text
    .replace(/^\$\s?/, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[\[(.+?)\|(.+?)\]\]/g, (_, a, b) => `${a} sobre ${b}`);
}

export const RichText = memo(function RichText({ text, variant = 'body', color = colors.parchment, align, style, strongColor }: RichProps) {
  if (text.includes('[[')) return <MathText text={text} variant={variant} color={color} align={align === 'center' ? 'center' : 'left'} />;
  const parts = text.split(/(\*\*.+?\*\*)/g).filter(Boolean);
  return (
    <Text variant={variant} color={color} align={align} style={style}>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <Text key={i} variant={variant} color={strongColor ?? color} style={styles.strong}>
            {part.slice(2, -2)}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
});

interface MathProps {
  text: string;
  variant?: TypeVariant;
  color?: string;
  align?: 'left' | 'center';
  size?: number;
}

/** Linha matemática: segmentos de texto e frações empilhadas, quebrando linha quando precisa. */
export const MathText = memo(function MathText({ text, variant = 'ask', color = colors.parchment, align = 'center', size }: MathProps) {
  const tokens = text.split(/(\[\[.+?\|.+?\]\])/g).filter((t) => t !== '');
  const fontSize = size ?? (variant === 'ask' ? 18 : 15.5);
  const segment = (t: string, k: string) =>
    t
      .split(/(\s+)/)
      .filter((w) => w !== '')
      .map((w, j) => (
        <Text key={`${k}-${j}`} variant={variant} color={color} style={[styles.mathText, { fontSize, lineHeight: fontSize * 1.5 }]}>
          {w.replace(/\*\*/g, '')}
        </Text>
      ));
  return (
    <View
      style={[styles.mathRow, { justifyContent: align === 'center' ? 'center' : 'flex-start' }]}
      accessible
      accessibilityLabel={plain(text)}
    >
      {tokens.map((t, i) => {
        const m = t.match(/^\[\[(.+?)\|(.+?)\]\]$/);
        if (!m) return segment(t, `s${i}`);
        return (
          <View key={`f${i}`} style={styles.frac}>
            <Text variant={variant} color={color} style={[styles.fracPart, { fontSize: fontSize * 0.86, lineHeight: fontSize * 1.1 }]}>
              {m[1]}
            </Text>
            <View style={[styles.bar, { backgroundColor: color }]} />
            <Text variant={variant} color={color} style={[styles.fracPart, { fontSize: fontSize * 0.86, lineHeight: fontSize * 1.1 }]}>
              {m[2]}
            </Text>
          </View>
        );
      })}
    </View>
  );
});

/** Linha de resolução ou passo: `$` no início = fórmula; senão, texto rico. */
export function SolutionLine({ text, color = colors.parchment }: { text: string; color?: string }) {
  if (text.startsWith('$')) return <MathText text={text.slice(1).trim()} variant="ask" color={colors.brass} align="left" size={16.5} />;
  return <RichText text={text} color={color} />;
}

const styles = StyleSheet.create({
  strong: { fontFamily: fonts.bodySemi },
  mathRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 0, rowGap: 4 },
  mathText: { letterSpacing: 0.3 },
  frac: { alignItems: 'center', marginHorizontal: 3, paddingVertical: 2 },
  fracPart: { textAlign: 'center', paddingHorizontal: 2 },
  bar: { height: 1.4, alignSelf: 'stretch', marginVertical: 1, opacity: 0.9 },
});
