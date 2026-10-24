import type { ReactNode } from 'react';
import { Platform } from 'react-native';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import { G, type GProps } from 'react-native-svg';
import { jointMatrix } from './joint';

const AnimatedGroup = Animated.createAnimatedComponent(G);

/** Usa a mesma respiração para as articulações, sem criar novos relógios. */
export function BossJoint({ pulse, degrees, x, y, children }: { pulse?: SharedValue<number>; degrees: number; x: number; y: number; children: ReactNode }) {
  const animatedProps = useAnimatedProps<GProps & { matrix?: number[] }>(() => {
    const matrix = jointMatrix(pulse?.value ?? 0, degrees, x, y);
    return Platform.OS === 'web' ? { transform: `matrix(${matrix.join(' ')})` } : { matrix };
  });
  return <AnimatedGroup animatedProps={animatedProps}>{children}</AnimatedGroup>;
}
