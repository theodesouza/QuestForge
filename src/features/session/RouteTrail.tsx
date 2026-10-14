/** Progresso da sessão como uma rota pontilhada num mapa: cada parada é uma questão. */
import { memo } from 'react';
import { View } from 'react-native';
import type { SessionAnswer } from '../../domain/game/types';
import { colors } from '../../ui/theme';

interface Props {
  total: number;
  answers: SessionAnswer[];
  currentIndex: number;
}

export const RouteTrail = memo(function RouteTrail({ total, answers, currentIndex }: Props) {
  const done = answers.filter((a) => a.kind !== 'skipped').length;
  return (
    <View
      style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Questão ${Math.min(currentIndex + 1, total)} de ${total}. ${done} respondidas.`}
    >
      {Array.from({ length: total }, (_, i) => {
        const a = answers[i];
        const isCurrent = i === currentIndex;
        const color = a
          ? a.kind === 'skipped'
            ? colors.mistDim
            : a.correct
              ? colors.verdigris
              : colors.ember
          : isCurrent
            ? colors.brass
            : colors.ink500;
        const size = isCurrent ? 12 : 8;
        return (
          <View key={i} style={{ flex: i === total - 1 ? 0 : 1, flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: a || isCurrent ? color : 'transparent',
                borderWidth: a ? 0 : 1.5,
                borderColor: color,
                transform: [{ rotate: '45deg' }],
              }}
            />
            {i < total - 1 ? (
              <View style={{ flex: 1, height: 1.5, marginHorizontal: 2, backgroundColor: i < currentIndex ? colors.line : colors.ink600 }} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
});
