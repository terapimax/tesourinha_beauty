import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Button, Card, Text } from '@/components/ui';
import { findProfessional, findService } from '@/data/catalog';
import { formatDayLong, formatDuration, formatPrice } from '@/lib/format';
import { useApp } from '@/store/app-store';
import { colors, spacing } from '@/theme';

export default function BookingSuccess() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bookings } = useApp();
  const insets = useSafeAreaInsets();
  const booking = bookings.find((b) => b.id === id);
  const pro = booking && findProfessional(booking.professionalId);
  const service = booking && findService(booking.serviceId);
  const scale = useRef(new Animated.Value(0.3)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 12 }),
      Animated.timing(fade, { toValue: 1, duration: 450, delay: 150, useNativeDriver: true }),
    ]).start();
  }, [scale, fade]);

  const goHome = () => {
    router.dismissAll();
    router.replace('/(tabs)/bookings');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + spacing.huge, paddingHorizontal: spacing.xxl, paddingBottom: insets.bottom + spacing.xl }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
        <Animated.View style={{ transform: [{ scale }], width: 112, height: 112, borderRadius: 56, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="checkmark" size={64} color={colors.white} />
        </Animated.View>
        <Animated.View style={{ opacity: fade, alignItems: 'center', gap: spacing.sm, alignSelf: 'stretch' }}>
          <Text variant="title1" align="center">Horário confirmado!</Text>
          <Text variant="callout" color={colors.textSecondary} align="center">Enviaremos um lembrete antes do seu atendimento.</Text>
          {booking && pro && service && (
            <Card style={{ alignSelf: 'stretch', marginTop: spacing.xl, gap: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Avatar name={pro.name} color={pro.avatarColor} size={48} />
                <View style={{ flex: 1 }}>
                  <Text variant="headline">{service.name}</Text>
                  <Text variant="footnote" color={colors.textSecondary}>com {pro.name}</Text>
                </View>
              </View>
              <View style={{ height: 1, backgroundColor: colors.separator }} />
              {[
                ['calendar-outline', formatDayLong(booking.date)],
                ['time-outline', `${booking.time} · ${formatDuration(service.durationMin)}`],
                ['location-outline', pro.neighborhood],
                ['cash-outline', `A partir de ${formatPrice(service.priceFrom)} · pague no local`],
              ].map(([icon, label]) => (
                <View key={icon} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Ionicons name={icon as never} size={18} color={colors.brand} />
                  <Text variant="subhead">{label}</Text>
                </View>
              ))}
            </Card>
          )}
        </Animated.View>
      </View>
      <View style={{ gap: spacing.md }}>
        <Button title="Ver meus agendamentos" onPress={goHome} />
        <Button title="Voltar ao início" variant="ghost" onPress={() => { router.dismissAll(); router.replace('/(tabs)'); }} />
      </View>
    </View>
  );
}
