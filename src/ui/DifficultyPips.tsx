import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { DIFFICULTY_LABEL, type Difficulty } from '../content/types';
import { colors } from './theme';

const TINT: Record<Difficulty, string> = { 1: colors.verdigris, 2: colors.brass, 3: colors.ember, 4: colors.iris };

/** Quatro losangos: a dificuldade lida de relance (e anunciada por leitores de tela). */
export function DifficultyPips({ value }: { value: Difficulty }) {
  return (
    <View accessible accessibilityLabel={`Dificuldade: ${DIFFICULTY_LABEL[value]}`} style={{ flexDirection: 'row', gap: 3 }}>
      {[1, 2, 3, 4].map((i) => (
        <Svg key={i} width={9} height={12} viewBox="0 0 9 12">
          <Path
            d="M4.5 0.5 L8.5 6 L4.5 11.5 L0.5 6 Z"
            fill={i <= value ? TINT[value] : 'none'}
            stroke={i <= value ? TINT[value] : colors.ink500}
            strokeWidth={1}
          />
        </Svg>
      ))}
    </View>
  );
}
