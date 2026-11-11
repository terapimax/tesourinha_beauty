import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/logo';
import { Badge, Button, Text } from '@/components/ui';
import type { IconName } from '@/data/types';
import { colors, radius, spacing } from '@/theme';

const BENEFITS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'calendar', title: 'Agenda organizada', text: 'Clientes do app e encaixes num lugar só.' },
  { icon: 'people', title: 'Novos clientes', text: 'Seu perfil aparece no Tesourinha Beauty.' },
  { icon: 'wallet', title: 'Ganhos na palma da mão', text: 'Acompanhe quanto você fez na semana e no mês.' },
];

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
      <LinearGradient
        colors={['rgba(255,106,19,0.42)', 'rgba(255,106,19,0.08)', 'transparent']}
        start={{ x: 0.9, y: 0 }}
        end={{ x: 0.2, y: 0.75 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: rise }], paddingTop: insets.top + spacing.xxxl, paddingHorizontal: spacing.xxl }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={{ alignItems: 'center' }}>
            <Logo size="md" tagline={false} />
            <View style={{ marginTop: spacing.md }}>
              <Badge label="PARA PROFISSIONAIS" tone="brand" icon="cut" />
            </View>
          </View>

          <View style={{ marginTop: spacing.huge, gap: spacing.md }}>
            {BENEFITS.map((b) => (
              <View key={b.title} style={styles.benefit}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={b.icon} size={20} color={colors.brand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="headline" color={colors.white}>{b.title}</Text>
                  <Text variant="footnote" color={colors.textOnDarkSecondary}>{b.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: spacing.md, paddingBottom: insets.bottom + spacing.xl }}>
          <Button title="Quero atender pelo app" onPress={() => router.push({ pathname: '/auth', params: { mode: 'signup' } })} />
          <Button title="Já sou profissional" variant="outlineLight" onPress={() => router.push({ pathname: '/auth', params: { mode: 'login' } })} />
          <Text variant="caption" color={colors.textOnDarkSecondary} align="center" style={{ marginTop: spacing.sm }}>
            Tesourinha Pro · uma iniciativa da Associação Tesourinha
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  benefit: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.06)' },
  benefitIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,106,19,0.16)', alignItems: 'center', justifyContent: 'center' },
});
