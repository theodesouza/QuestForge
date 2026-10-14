/**
 * Superfície com "cantoneiras" de cartógrafo — marcas de registro nos cantos,
 * como num mapa impresso. Evita o aspecto de card genérico.
 */
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, space } from './theme';

interface Props {
  children: ReactNode;
  accent?: string;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  corners?: boolean;
  tone?: 'default' | 'raised' | 'sunken';
}

export function Panel({ children, accent = colors.brass, style, padded = true, corners = true, tone = 'default' }: Props) {
  return (
    <View
      style={[
        styles.panel,
        tone === 'raised' && styles.raised,
        tone === 'sunken' && styles.sunken,
        padded && styles.padded,
        style,
      ]}
    >
      {corners ? (
        <>
          <View style={[styles.corner, styles.tl, { borderColor: accent }]} />
          <View style={[styles.corner, styles.tr, { borderColor: accent }]} />
          <View style={[styles.corner, styles.bl, { borderColor: accent }]} />
          <View style={[styles.corner, styles.br, { borderColor: accent }]} />
        </>
      ) : null}
      {children}
    </View>
  );
}

const C = 10;
const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.ink800,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  raised: { backgroundColor: colors.ink700 },
  sunken: { backgroundColor: colors.ink850 },
  padded: { padding: space.lg },
  corner: { position: 'absolute', width: C, height: C, opacity: 0.8 },
  tl: { top: 6, left: 6, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderTopLeftRadius: 4 },
  tr: { top: 6, right: 6, borderTopWidth: 1.5, borderRightWidth: 1.5, borderTopRightRadius: 4 },
  bl: { bottom: 6, left: 6, borderBottomWidth: 1.5, borderLeftWidth: 1.5, borderBottomLeftRadius: 4 },
  br: { bottom: 6, right: 6, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderBottomRightRadius: 4 },
});
