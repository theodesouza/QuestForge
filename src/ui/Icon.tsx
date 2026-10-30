/**
 * Ícones próprios do QuestForge: traço único de 1,75 px, pontas arredondadas,
 * grade 24×24. Desenhados para a linguagem "instrumento de cartógrafo".
 */
import { memo } from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { colors } from './theme';

export type IconName =
  | 'camp'
  | 'atlas'
  | 'hero'
  | 'settings'
  | 'close'
  | 'check'
  | 'cross'
  | 'chevronRight'
  | 'chevronLeft'
  | 'lantern'
  | 'dice'
  | 'skip'
  | 'star'
  | 'flag'
  | 'bolt'
  | 'ink'
  | 'flame'
  | 'sword'
  | 'shield'
  | 'lock'
  | 'clock'
  | 'echo'
  | 'sparkle'
  | 'play'
  | 'book'
  | 'target'
  | 'scroll'
  | 'flask'
  | 'bulb'
  | 'alert'
  | 'seal'
  | 'eye'
  | 'list'
  | 'route'
  | 'refresh';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
}

function Glyph({ name, color, fill }: { name: IconName; color: string; fill: string }) {
  switch (name) {
    case 'camp':
      return (
        <>
          <Path d="M3 20 L12 4 L21 20 Z" />
          <Path d="M12 20 L9.5 14.5 L14.5 14.5 Z" fill={fill} />
          <Line x1="2" y1="20" x2="22" y2="20" />
        </>
      );
    case 'atlas':
      return (
        <>
          <Path d="M3 6 L9 4 L15 6 L21 4 L21 18 L15 20 L9 18 L3 20 Z" />
          <Line x1="9" y1="4" x2="9" y2="18" />
          <Line x1="15" y1="6" x2="15" y2="20" />
        </>
      );
    case 'hero':
      return (
        <>
          <Circle cx="12" cy="12" r="8.5" />
          <Circle cx="12" cy="12" r="4.5" />
          <Circle cx="12" cy="12" r="1.4" fill={color} />
          <Line x1="12" y1="1.5" x2="12" y2="3.5" />
          <Line x1="12" y1="20.5" x2="12" y2="22.5" />
          <Line x1="1.5" y1="12" x2="3.5" y2="12" />
          <Line x1="20.5" y1="12" x2="22.5" y2="12" />
        </>
      );
    case 'settings':
      return (
        <>
          <Circle cx="12" cy="12" r="3" />
          <Path d="M12 2.5 L13.6 5.2 L16.7 4.4 L17.3 7.5 L20.3 8.5 L19.2 11.5 L21.3 14 L18.6 15.6 L18.8 18.8 L15.6 18.7 L14 21.4 L12 19.2 L10 21.4 L8.4 18.7 L5.2 18.8 L5.4 15.6 L2.7 14 L4.8 11.5 L3.7 8.5 L6.7 7.5 L7.3 4.4 L10.4 5.2 Z" />
        </>
      );
    case 'close':
    case 'cross':
      return (
        <>
          <Line x1="6" y1="6" x2="18" y2="18" />
          <Line x1="18" y1="6" x2="6" y2="18" />
        </>
      );
    case 'check':
      return <Polyline points="4.5,12.5 9.5,17.5 19.5,6.5" />;
    case 'chevronRight':
      return <Polyline points="9,5 16,12 9,19" />;
    case 'chevronLeft':
      return <Polyline points="15,5 8,12 15,19" />;
    case 'lantern':
      return (
        <>
          <Path d="M9 4 L15 4" />
          <Path d="M12 2 L12 4" />
          <Path d="M8 7 L16 7 L17 17 L7 17 Z" />
          <Path d="M12 10 C10.8 11.5 10.8 13 12 14 C13.2 13 13.2 11.5 12 10 Z" fill={fill} />
          <Path d="M9 20 L15 20" />
          <Path d="M10 17 L10 20 M14 17 L14 20" />
        </>
      );
    case 'dice':
      return (
        <>
          <Rect x="4" y="4" width="16" height="16" rx="3.5" />
          <Circle cx="8.5" cy="8.5" r="1.1" fill={color} />
          <Circle cx="15.5" cy="15.5" r="1.1" fill={color} />
          <Circle cx="12" cy="12" r="1.1" fill={color} />
        </>
      );
    case 'skip':
      return (
        <>
          <Polyline points="5,6 11,12 5,18" />
          <Polyline points="12,6 18,12 12,18" />
        </>
      );
    case 'star':
      return <Path d="M12 3 L14.6 9 L21 9.6 L16.1 13.8 L17.6 20.2 L12 16.8 L6.4 20.2 L7.9 13.8 L3 9.6 L9.4 9 Z" fill={fill} />;
    case 'flag':
      return (
        <>
          <Line x1="5" y1="3" x2="5" y2="21" />
          <Path d="M5 4 L18 4 L15 8.5 L18 13 L5 13" fill={fill} />
        </>
      );
    case 'bolt':
      return <Path d="M13 2.5 L5 13.5 L11 13.5 L10 21.5 L19 9.5 L13 9.5 Z" fill={fill} />;
    case 'ink':
      return (
        <>
          <Path d="M12 3 C12 3 5.5 10.5 5.5 14.5 A6.5 6.5 0 0 0 18.5 14.5 C18.5 10.5 12 3 12 3 Z" fill={fill} />
          <Path d="M9 15 A3 3 0 0 0 12 18" />
        </>
      );
    case 'flame':
      return <Path d="M12 2.5 C13 7 18 9 18 14.5 A6 6 0 0 1 6 14.5 C6 11.5 8 10 9 8 C9.5 10 10.5 11 11.5 11 C11 8 11.5 5 12 2.5 Z" fill={fill} />;
    case 'sword':
      return (
        <>
          <Path d="M19.5 3 L20.5 4 L10 14.5 L9 13.5 Z" fill={fill} />
          <Line x1="7" y1="12" x2="12" y2="17" />
          <Line x1="9.5" y1="14.5" x2="4" y2="20" />
        </>
      );
    case 'shield':
      return <Path d="M12 2.5 L19.5 5.5 L19.5 11.5 C19.5 16 16 19.5 12 21.5 C8 19.5 4.5 16 4.5 11.5 L4.5 5.5 Z" fill={fill} />;
    case 'lock':
      return (
        <>
          <Rect x="5" y="10.5" width="14" height="10" rx="2.5" />
          <Path d="M8 10.5 L8 7.5 A4 4 0 0 1 16 7.5 L16 10.5" />
        </>
      );
    case 'clock':
      return (
        <>
          <Circle cx="12" cy="12" r="8.5" />
          <Polyline points="12,7 12,12 15.5,14" />
        </>
      );
    case 'echo':
      return (
        <>
          <Circle cx="12" cy="12" r="2" fill={color} />
          <Path d="M7.8 7.8 A6 6 0 0 0 7.8 16.2" />
          <Path d="M16.2 7.8 A6 6 0 0 1 16.2 16.2" />
          <Path d="M4.9 4.9 A10 10 0 0 0 4.9 19.1" />
          <Path d="M19.1 4.9 A10 10 0 0 1 19.1 19.1" />
        </>
      );
    case 'sparkle':
      return (
        <>
          <Path d="M12 3 L13.6 10.4 L21 12 L13.6 13.6 L12 21 L10.4 13.6 L3 12 L10.4 10.4 Z" fill={fill} />
        </>
      );
    case 'play':
      return <Path d="M7 4.5 L19 12 L7 19.5 Z" fill={fill} />;
    case 'book':
      return (
        <>
          <Path d="M3 5 C6 4 9 4 12 6 C15 4 18 4 21 5 L21 19 C18 18 15 18 12 20 C9 18 6 18 3 19 Z" />
          <Line x1="12" y1="6" x2="12" y2="20" />
        </>
      );
    case 'target':
      return (
        <>
          <Circle cx="12" cy="12" r="8.5" />
          <Circle cx="12" cy="12" r="4.5" />
          <Circle cx="12" cy="12" r="1.2" fill={color} />
        </>
      );
    case 'scroll':
      return (
        <>
          <Path d="M7 4 L18 4 A2 2 0 0 1 20 6 L20 7 L17 7" />
          <Path d="M7 4 A2 2 0 0 0 5 6 L5 18 A2 2 0 0 0 7 20 L16 20 A2 2 0 0 0 18 18 L18 7" />
          <Line x1="8.5" y1="9" x2="14.5" y2="9" />
          <Line x1="8.5" y1="12.5" x2="14.5" y2="12.5" />
          <Line x1="8.5" y1="16" x2="12" y2="16" />
        </>
      );
    case 'flask':
      return (
        <>
          <Path d="M9.5 3 L14.5 3" />
          <Path d="M10.5 3 L10.5 9 L5 19 A1.5 1.5 0 0 0 6.3 21 L17.7 21 A1.5 1.5 0 0 0 19 19 L13.5 9 L13.5 3" />
          <Path d="M7.6 15 L16.4 15" fill={fill} />
        </>
      );
    case 'bulb':
      return (
        <>
          <Path d="M9 17 C9 14.5 6 13.5 6 9.5 A6 6 0 0 1 18 9.5 C18 13.5 15 14.5 15 17 Z" fill={fill} />
          <Line x1="9.5" y1="20" x2="14.5" y2="20" />
          <Line x1="10.5" y1="22.5" x2="13.5" y2="22.5" />
        </>
      );
    case 'alert':
      return (
        <>
          <Path d="M12 3.5 L21.5 20 L2.5 20 Z" fill={fill} />
          <Line x1="12" y1="9.5" x2="12" y2="14" />
          <Circle cx="12" cy="17" r="0.9" fill={color} />
        </>
      );
    case 'seal':
      return (
        <>
          <Path d="M12 2.5 L14.2 4.6 L17.2 4.2 L17.8 7.2 L20.4 8.7 L19.2 11.5 L20.4 14.3 L17.8 15.8 L17.2 18.8 L14.2 18.4 L12 20.5 L9.8 18.4 L6.8 18.8 L6.2 15.8 L3.6 14.3 L4.8 11.5 L3.6 8.7 L6.2 7.2 L6.8 4.2 L9.8 4.6 Z" fill={fill} />
          <Polyline points="8.8,11.6 11,13.8 15.2,9.4" />
        </>
      );
    case 'eye':
      return (
        <>
          <Path d="M2.5 12 C5 7 8.5 5 12 5 C15.5 5 19 7 21.5 12 C19 17 15.5 19 12 19 C8.5 19 5 17 2.5 12 Z" />
          <Circle cx="12" cy="12" r="3" fill={fill} />
        </>
      );
    case 'list':
      return (
        <>
          <Line x1="9" y1="6.5" x2="20" y2="6.5" />
          <Line x1="9" y1="12" x2="20" y2="12" />
          <Line x1="9" y1="17.5" x2="20" y2="17.5" />
          <Circle cx="5" cy="6.5" r="1.1" fill={color} />
          <Circle cx="5" cy="12" r="1.1" fill={color} />
          <Circle cx="5" cy="17.5" r="1.1" fill={color} />
        </>
      );
    case 'route':
      return (
        <>
          <Circle cx="6" cy="18" r="2.2" />
          <Circle cx="18" cy="6" r="2.2" fill={fill} />
          <Path d="M8 17 C14 16 9 10 15 8" strokeDasharray="2 3" />
        </>
      );
    case 'refresh':
      return (
        <>
          <Path d="M19.5 12 A7.5 7.5 0 1 1 16.8 6.2" />
          <Polyline points="17.5,2.5 17.5,6.8 13.2,6.8" />
        </>
      );
  }
}

export const Icon = memo(function Icon({ name, size = 22, color = colors.parchment, fill = 'none', strokeWidth = 1.75 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Glyph name={name} color={color} fill={fill} />
    </Svg>
  );
});
