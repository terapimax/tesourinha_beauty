import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';
import { Pressable, ScrollView, ScrollViewProps, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptic } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';
import { Text } from './ui';

/**
 * Cabeçalho escuro com título + "folha" clara arredondada por baixo,
 * assinatura visual do Tesourinha Beauty (inspirada no mock).
 */
export function ScreenHeader({
  title,
  subtitle,
  back = true,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  children?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ backgroundColor: colors.black, paddingTop: insets.top + spacing.sm, paddingBottom: spacing.xxl + radius.xxl, paddingHorizontal: spacing.xl }}>
      <StatusBar style="light" />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 44 }}>
        {back && <BackButton />}
        <View style={{ flex: 1 }}>
          <Text variant={back ? 'title2' : 'largeTitle'} color={colors.white}>
            {title}
          </Text>
        </View>
        {right}
      </View>
      {subtitle && (
        <Text variant="subhead" color={colors.textOnDarkSecondary} style={{ marginTop: 2, marginLeft: back ? 48 : 0 }}>
          {subtitle}
        </Text>
      )}
      {children && <View style={{ marginTop: spacing.lg }}>{children}</View>}
    </View>
  );
}

export function BackButton({ tone = 'dark' }: { tone?: 'dark' | 'light' | 'glass' }) {
  const bg = tone === 'dark' ? 'rgba(255,255,255,0.12)' : tone === 'glass' ? 'rgba(0,0,0,0.35)' : colors.surfaceMuted;
  const fg = tone === 'light' ? colors.text : colors.white;
  return (
    <Pressable
      hitSlop={12}
      onPress={() => {
        haptic.light();
        if (router.canGoBack()) router.back();
        else router.replace('/');
      }}
      style={({ pressed }) => [styles.back, { backgroundColor: bg, opacity: pressed ? 0.6 : 1 }]}
      accessibilityLabel="Voltar">
      <Ionicons name="chevron-back" size={22} color={fg} style={{ marginLeft: -2 }} />
    </Pressable>
  );
}

/** Corpo da tela: folha arredondada que sobe sobre o cabeçalho. */
export function Sheet({ children, scroll = true, contentStyle, ...rest }: { children: ReactNode; scroll?: boolean; contentStyle?: ScrollViewProps['contentContainerStyle'] } & ScrollViewProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.sheet}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{ padding: spacing.xl, paddingBottom: insets.bottom + 120 }, contentStyle]}
          keyboardShouldPersistTaps="handled"
          {...rest}>
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </View>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: colors.black }}>{children}</View>;
}

/** Barra de ação fixa no rodapé (CTA principal). */
export function BottomBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>{children}</View>;
}

const styles = StyleSheet.create({
  back: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sheet: {
    flex: 1,
    marginTop: -radius.xxl,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    overflow: 'hidden',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
});
