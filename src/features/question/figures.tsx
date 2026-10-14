/** Figuras vetoriais dos enunciados. Cada uma é desenhada em escala e rotulada. */
import type { ReactElement } from 'react';
import Svg, { Circle, G, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import type { FigureId } from '../../content/types';
import { colors, fonts } from '../../ui/theme';

const stroke = colors.parchment;
const label = { fill: colors.brass, fontSize: 13, fontFamily: fonts.bodySemi, textAnchor: 'middle' as const };

function TerrenoL() {
  // Escala: 10 px por metro.
  return (
    <Svg width="100%" height={210} viewBox="0 0 270 210">
      <Rect x={150} y={25} width={80} height={60} fill="none" stroke={colors.mist} strokeOpacity={0.6} strokeDasharray="5 5" />
      <SvgText x={190} y={58} {...label} fill={colors.mist} fontSize={11}>retirado</SvgText>
      <Polygon points="30,25 150,25 150,85 230,85 230,175 30,175" fill={colors.brass} fillOpacity={0.1} stroke={stroke} strokeWidth={2} />
      <SvgText x={90} y={18} {...label}>12</SvgText>
      <SvgText x={16} y={104} {...label}>15</SvgText>
      <SvgText x={130} y={196} {...label}>20</SvgText>
      <SvgText x={246} y={134} {...label}>9</SvgText>
      <SvgText x={140} y={60} {...label}>6</SvgText>
      <SvgText x={190} y={102} {...label}>8</SvgText>
    </Svg>
  );
}

function TrianguloRampa() {
  return (
    <Svg width="100%" height={160} viewBox="0 0 290 160">
      <Polygon points="20,130 260,130 260,30" fill={colors.verdigris} fillOpacity={0.1} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M248 130 L248 118 L260 118" fill="none" stroke={stroke} strokeWidth={1.2} />
      <Line x1={10} y1={130} x2={280} y2={130} stroke={colors.mist} strokeOpacity={0.5} />
      <SvgText x={140} y={150} {...label}>3,6 m</SvgText>
      <SvgText x={266} y={85} {...label} textAnchor="start">1,5</SvgText>
      <SvgText x={266} y={100} {...label} textAnchor="start">m</SvgText>
      <SvgText x={125} y={68} {...label} fill={colors.parchment}>?</SvgText>
    </Svg>
  );
}

function CaixaDagua() {
  return (
    <Svg width="100%" height={180} viewBox="0 0 280 180">
      <G stroke={stroke} strokeWidth={2} strokeLinejoin="round">
        <Polygon points="40,70 180,70 230,40 90,40" fill={colors.verdigris} fillOpacity={0.16} />
        <Polygon points="40,70 180,70 180,140 40,140" fill={colors.verdigris} fillOpacity={0.08} />
        <Polygon points="180,70 230,40 230,110 180,140" fill={colors.verdigris} fillOpacity={0.12} />
      </G>
      <Line x1={40} y1={110} x2={180} y2={110} stroke={colors.verdigris} strokeOpacity={0.5} strokeDasharray="4 4" />
      <SvgText x={110} y={160} {...label}>2 m</SvgText>
      <SvgText x={222} y={140} {...label}>1,5 m</SvgText>
      <SvgText x={22} y={110} {...label}>1 m</SvgText>
    </Svg>
  );
}

function PracaCircular() {
  return (
    <Svg width="100%" height={210} viewBox="0 0 220 210">
      <Circle cx={110} cy={105} r={92} fill={colors.brass} fillOpacity={0.16} stroke={stroke} strokeWidth={2} />
      <Circle cx={110} cy={105} r={74} fill={colors.verdigris} fillOpacity={0.14} stroke={stroke} strokeWidth={2} />
      <Line x1={110} y1={105} x2={184} y2={105} stroke={colors.brass} strokeWidth={1.6} />
      <Circle cx={110} cy={105} r={3} fill={colors.brass} />
      <SvgText x={146} y={98} {...label}>20 m</SvgText>
      <Line x1={110} y1={31} x2={110} y2={13} stroke={colors.brass} strokeWidth={1.6} />
      <SvgText x={134} y={27} {...label}>2 m</SvgText>
      <SvgText x={110} y={140} {...label} fill={colors.verdigris} fontSize={12}>praça</SvgText>
    </Svg>
  );
}

function Roleta8() {
  const sectors = Array.from({ length: 8 }, (_, i) => {
    const a0 = ((i * 45 - 90) * Math.PI) / 180;
    const a1 = (((i + 1) * 45 - 90) * Math.PI) / 180;
    const am = (a0 + a1) / 2;
    const r = 80;
    return {
      d: `M 110 100 L ${110 + r * Math.cos(a0)} ${100 + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${110 + r * Math.cos(a1)} ${100 + r * Math.sin(a1)} Z`,
      lx: 110 + 55 * Math.cos(am),
      ly: 100 + 55 * Math.sin(am) + 5,
      n: i + 1,
    };
  });
  return (
    <Svg width="100%" height={210} viewBox="0 0 220 210">
      {sectors.map((s) => (
        <G key={s.n}>
          <Path d={s.d} fill={s.n % 2 === 0 ? colors.ink600 : colors.ink700} stroke={stroke} strokeWidth={1.4} />
          <SvgText x={s.lx} y={s.ly} {...label} fill={colors.parchment} fontSize={15}>{String(s.n)}</SvgText>
        </G>
      ))}
      <Circle cx={110} cy={100} r={8} fill={colors.brass} />
      <Polygon points="110,6 102,22 118,22" fill={colors.brass} />
    </Svg>
  );
}

const FIGURES: Record<FigureId, () => ReactElement> = {
  'terreno-L': TerrenoL,
  'triangulo-rampa': TrianguloRampa,
  'caixa-dagua': CaixaDagua,
  'praca-circular': PracaCircular,
  'roleta-8': Roleta8,
};

export function Figure({ id }: { id: FigureId }) {
  const F = FIGURES[id];
  return <F />;
}
