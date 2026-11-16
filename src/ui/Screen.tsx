import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tabSlide } from '../features/tabs/slide';
import { CONTENT_MAX, RAIL_W, column, useWide } from './layout';
import { MapBackdrop } from './MapBackdrop';
import { space } from './theme';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  /** Conteúdo fixo no rodapé (ex.: botão principal). */
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  glow?: string;
  /** Espaço extra no fim do scroll (ex.: barra de abas). */
  bottomInset?: number;
  /** Tela de aba: acompanha o deslize de troca de abas. */
  tab?: boolean;
}

export function Screen({ children, scroll = true, footer, contentStyle, glow, bottomInset = 0, tab = false }: Props) {
  const insets = useSafeAreaInsets();
  // A largura entra como número: o estilo animado roda no thread de UI, onde não dá para chamar funções comuns do app.
  const { width } = useWindowDimensions();
  const slide = useAnimatedStyle(() => {
    const x = tab ? tabSlide.get() : 0;
    return { transform: [{ translateX: x }], opacity: 1 - Math.min(0.4, (Math.abs(x) / width) * 0.4) };
  });
  // Janela larga: as abas viram um trilho à esquerda (sem barra embaixo) e o conteúdo fica numa coluna centrada.
  const wide = useWide();
  const rail = wide && tab ? RAIL_W : 0;
  const padding = {
    paddingTop: insets.top + (wide ? space.xxl : space.md),
    paddingBottom: (footer ? space.lg : insets.bottom + space.xxl) + (rail ? 0 : bottomInset),
  };
  const Root = tab ? Animated.View : View;
  return (
    <Root style={[styles.root, rail ? { paddingLeft: rail } : null, tab ? slide : null]}>
      <MapBackdrop glow={glow} />
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, COLUMN, padding, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, COLUMN, styles.fill, padding, contentStyle]}>{children}</View>
      )}
      {footer ? <View style={[styles.footer, COLUMN, { paddingBottom: insets.bottom + space.md }]}>{footer}</View> : null}
    </Root>
  );
}

const COLUMN = column(CONTENT_MAX);

const styles = StyleSheet.create({
  root: { flex: 1 },
  fill: { flex: 1 },
  content: { paddingHorizontal: space.xl, gap: space.lg },
  footer: { paddingHorizontal: space.xl, paddingTop: space.md, gap: space.sm },
});
