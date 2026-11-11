import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/logo';
import { Button, Text } from '@/components/ui';
import { colors, spacing } from '@/theme';

const PILLARS = ['Beleza', 'Educação', 'Oportunidade', 'Impacto Social'];

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(rise, { toValue: 0, useNativeDriver: true, speed: 6, bounciness: 4 }),
    ]).start();
  }, [fade, rise]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <StatusBar style="light" />
      {/* brilho laranja de fundo */}
      <LinearGradient
        colors={['rgba(255,106,19,0.42)', 'rgba(255,106,19,0.08)', 'transparent']}
        start={{ x: 0.9, y: 0 }}
        end={{ x: 0.2, y: 0.75 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} start={{ x: 0, y: 0.45 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

      <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: rise }], paddingTop: insets.top + spacing.huge, paddingHorizontal: spacing.xxl }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Logo />
          <View style={{ marginTop: spacing.huge, alignItems: 'center', gap: 4 }}>
            {PILLARS.map((p, i) => (
              <Text key={p} variant="title3" weight="500" color={i % 2 ? colors.textOnDarkSecondary : colors.white}>
                {p}
              </Text>
            ))}
          </View>
        </View>

        <View style={{ gap: spacing.md, paddingBottom: insets.bottom + spacing.xl }}>
          <Button title="Criar conta" onPress={() => router.push({ pathname: '/auth', params: { mode: 'signup' } })} />
          <Button title="Entrar" variant="outlineLight" onPress={() => router.push({ pathname: '/auth', params: { mode: 'login' } })} />
          <Text variant="caption" color={colors.textOnDarkSecondary} align="center" style={{ marginTop: spacing.sm }}>
            Uma iniciativa da Associação Tesourinha
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
