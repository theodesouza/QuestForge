/**
 * Palco do herói: o Cenário equipado fica atrás do astrolábio (hero, acampamento, prévias).
 * A paisagem é desenhada num quadrado de 300 × 300 unidades, centrado no palco e do tamanho
 * do maior lado — assim o recorte é o mesmo em qualquer largura de tela e as camadas animadas
 * (que usam as mesmas unidades) casam com a arte.
 *
 * Sem cenário equipado o palco some: o astrolábio aparece como sempre, sem moldura extra.
 */
import { useId, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg from 'react-native-svg';
import { getItem } from '../content/items';
import type { EffectsLevel } from '../domain/game/types';
import { useGameStore } from '../state/store';
import { DENSITY } from './Astrolabe';
import { colors, radius } from './theme';
import { FxProvider } from './vfx/engine';
import { SceneArt, SceneLive } from './vfx/scenes';

interface Props {
  scene: string | null;
  /** Altura do palco (o astrolábio fica centralizado nele). */
  height: number;
  animate?: boolean;
  paused?: boolean;
  /** Força uma intensidade (prévia); senão usa a dos Ajustes. */
  effects?: EffectsLevel;
  /** Sem cenário, mantém a mesma altura (sem moldura), para a tela não "pular" ao equipar um. */
  reserve?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export function SceneStage({ scene, height, animate = true, paused = false, effects, reserve = false, style, children }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const setting = useGameStore((s) => s.game?.profile.settings.effects ?? 'alto');
  const [width, setWidth] = useState(0);
  if (!scene) return reserve ? <View style={[styles.empty, { height }, style]}>{children}</View> : <>{children}</>;

  const item = getItem(scene);
  const side = Math.max(width, height);
  return (
    <View
      style={[styles.stage, { height }, style]}
      onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}
      accessibilityLabel={`Cenário: ${item.name}`}
    >
      {width > 0 ? (
        <View pointerEvents="none" style={{ position: 'absolute', width: side, height: side, left: (width - side) / 2, top: (height - side) / 2 }}>
          <Svg width={side} height={side} viewBox="0 0 300 300">
            <SceneArt v={item.visual} uid={uid} />
          </Svg>
          <FxProvider value={{ animate, density: DENSITY[effects ?? setting], px: side, paused }}>
            <SceneLive v={item.visual} />
          </FxProvider>
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  stage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ink850,
  },
});
