import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme';
import { Text } from './ui';

/** Marca "tesourinha": tesoura aberta com lâminas em V. */
export function ScissorsMark({ size = 64, color = colors.brand }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* lâminas cruzadas */}
      <Path d="M39.7 68.3 L32.3 61.7 L85.3 8.3 L86.7 9.7 Z" fill={color} />
      <Path d="M60.3 68.3 L67.7 61.7 L14.7 8.3 L13.3 9.7 Z" fill={color} />
      {/* argolas */}
      <Circle cx={30} cy={78} r={12} stroke={color} strokeWidth={7.5} fill="none" />
      <Circle cx={70} cy={78} r={12} stroke={color} strokeWidth={7.5} fill="none" />
      {/* pino central */}
      <Circle cx={50} cy={49.3} r={3} fill={color === colors.white ? colors.brand : colors.black} />
    </Svg>
  );
}

export function Logo({
  size = 'lg',
  tone = 'light',
  tagline = true,
  layout = 'stacked',
}: {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'light' | 'dark';
  tagline?: boolean;
  layout?: 'stacked' | 'inline';
}) {
  const s = { sm: 0.55, md: 0.75, lg: 1 }[size];
  const main = tone === 'light' ? colors.white : colors.black;
  const sub = tone === 'light' ? colors.textOnDarkSecondary : colors.textSecondary;

  if (layout === 'inline') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 * s }}>
        <ScissorsMark size={64 * s} />
        <View>
          <Text style={{ fontSize: 26 * s, lineHeight: 30 * s, fontWeight: '800', letterSpacing: 0.5, color: main }}>TESOURINHA</Text>
          <Text style={{ fontSize: 15 * s, lineHeight: 19 * s, fontWeight: '700', letterSpacing: 6 * s, color: colors.brand }}>BEAUTY</Text>
          {tagline && <Text style={{ fontSize: 12 * s, marginTop: 2, color: sub }}>Beleza que transforma</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center' }}>
      <ScissorsMark size={120 * s} />
      <Text style={{ marginTop: 8 * s, fontSize: 40 * s, lineHeight: 46 * s, fontWeight: '800', letterSpacing: 1, color: main }}>
        TESOURINHA
      </Text>
      <Text style={{ fontSize: 20 * s, lineHeight: 26 * s, fontWeight: '700', letterSpacing: 12 * s, color: colors.brand, marginRight: -12 * s }}>
        BEAUTY
      </Text>
      {tagline && (
        <Text style={{ marginTop: 10 * s, fontSize: 12 * s, letterSpacing: 3 * s, fontWeight: '600', color: sub }}>
          BELEZA QUE TRANSFORMA
        </Text>
      )}
    </View>
  );
}
