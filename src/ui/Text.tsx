import { Text as RNText, type TextProps } from 'react-native';
import { colors, type TypeVariant, type as typeScale } from './theme';

interface Props extends TextProps {
  variant?: TypeVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function Text({ variant = 'body', color = colors.parchment, align, style, ...rest }: Props) {
  return (
    <RNText
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={[typeScale[variant], { color }, align ? { textAlign: align } : null, style]}
    />
  );
}
