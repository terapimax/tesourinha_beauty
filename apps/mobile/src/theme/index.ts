import { Platform, TextStyle, ViewStyle } from 'react-native';

/**
 * Tesourinha Beauty design tokens.
 * Paleta oficial: laranja Tesourinha, preto e branco, com cinzas no estilo iOS.
 */
export const colors = {
  brand: '#FF6A13',
  brandDark: '#E5560A',
  brandLight: '#FF8A3D',
  brandSoft: '#FFF1E8',
  brandSoftBorder: '#FFE0CC',

  black: '#0B0B0C',
  ink: '#1C1C1E',
  white: '#FFFFFF',

  background: '#F2F2F7', // iOS systemGroupedBackground
  surface: '#FFFFFF',
  surfaceMuted: '#F7F7F9',
  separator: 'rgba(60,60,67,0.12)',
  border: '#E5E5EA',

  text: '#1C1C1E',
  textSecondary: '#6E6E73',
  textTertiary: '#AEAEB2',
  textOnDark: '#FFFFFF',
  textOnDarkSecondary: 'rgba(255,255,255,0.68)',

  star: '#FFB800',
  success: '#34C759',
  successSoft: '#E8F8EC',
  danger: '#FF3B30',
  dangerSoft: '#FFECEB',
  info: '#0A84FF',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 28,
  pill: 999,
} as const;

const family = Platform.select({ ios: 'System', android: 'sans-serif', default: undefined });
const familyMedium = Platform.select({ ios: 'System', android: 'sans-serif-medium', default: undefined });

/** Escala tipográfica inspirada no Human Interface Guidelines. */
export const type = {
  largeTitle: { fontFamily: family, fontSize: 34, lineHeight: 41, fontWeight: '800', letterSpacing: 0.2 },
  title1: { fontFamily: family, fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: 0.2 },
  title2: { fontFamily: family, fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: 0.1 },
  title3: { fontFamily: familyMedium, fontSize: 20, lineHeight: 25, fontWeight: '600' },
  headline: { fontFamily: familyMedium, fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontFamily: family, fontSize: 17, lineHeight: 22, fontWeight: '400', letterSpacing: -0.2 },
  callout: { fontFamily: family, fontSize: 16, lineHeight: 21, fontWeight: '400', letterSpacing: -0.2 },
  subhead: { fontFamily: family, fontSize: 15, lineHeight: 20, fontWeight: '400', letterSpacing: -0.1 },
  footnote: { fontFamily: family, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption: { fontFamily: family, fontSize: 12, lineHeight: 16, fontWeight: '400' },
  caption2: { fontFamily: familyMedium, fontSize: 11, lineHeight: 13, fontWeight: '600', letterSpacing: 0.2 },
} satisfies Record<string, TextStyle>;

export const shadow = {
  card: Platform.select<ViewStyle>({
    ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
    android: { elevation: 2 },
    default: { boxShadow: '0 6px 20px rgba(0,0,0,0.06)' } as ViewStyle,
  }),
  floating: Platform.select<ViewStyle>({
    ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 10 } },
    android: { elevation: 8 },
    default: { boxShadow: '0 10px 30px rgba(0,0,0,0.12)' } as ViewStyle,
  }),
  brand: Platform.select<ViewStyle>({
    ios: { shadowColor: '#FF6A13', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
    android: { elevation: 4 },
    default: { boxShadow: '0 8px 20px rgba(255,106,19,0.35)' } as ViewStyle,
  }),
};

export const gradients = {
  brand: ['#FF8A3D', '#FF6A13', '#F2540A'] as const,
  dark: ['#2A2A2D', '#0B0B0C'] as const,
  hero: ['#1C1C1E', '#0B0B0C'] as const,
};
