import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { MonthCalendar } from '@/components/calendar';
import { BottomBar, Screen, ScreenHeader, Sheet } from '@/components/screen';
import { Avatar, Button, Card, PressableScale, Rating, Text } from '@/components/ui';
import { findProfessional, services } from '@/data/catalog';
import { formatDayLong, formatDuration, formatPrice } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { colors, radius, shadow, spacing } from '@/theme';

/** Simula horários já ocupados de forma determinística por dia/profissional. */
function isTaken(proId: string, day: string, time: string) {
  let h = 0;
  for (const ch of `${proId}${day}${time}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 4 === 0;
}

export default function Book() {
  const { id, serviceId, reschedule } = useLocalSearchParams<{ id: string; serviceId?: string; reschedule?: string }>();
  const pro = findProfessional(id);
  const { createBooking, cancelBooking, bookings } = useApp();
  const proServices = useMemo(() => services.filter((s) => pro?.serviceIds.includes(s.id)), [pro]);
  const [svc, setSvc] = useState(serviceId ?? proServices[0]?.id);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  if (!pro) return null;
  const service = proServices.find((s) => s.id === svc);
  const myTaken = new Set(bookings.filter((b) => b.professionalId === pro.id && b.date === day && b.status === 'confirmado').map((b) => b.time));
  const now = new Date();
  const isPast = (t: string) => {
    if (!day) return false;
    const [hh, mm] = t.split(':').map(Number);
    const [y, m, d] = day.split('-').map(Number);
    return new Date(y, m - 1, d, hh, mm) <= now;
  };

  const confirmBooking = () => {
    if (!service || !day || !time) return;
    const b = createBooking({ professionalId: pro.id, serviceId: service.id, date: day, time });
    if (reschedule) cancelBooking(reschedule);
    haptic.success();
    router.replace({ pathname: '/booking-success', params: { id: b.id } });
  };

  return (
    <Screen>
      <ScreenHeader title={reschedule ? 'Remarcar horário' : 'Agendar horário'} />
      <Sheet contentStyle={{ gap: spacing.xxl, paddingBottom: 200 }}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Avatar name={pro.name} color={pro.avatarColor} uri={pro.imageUrl} size={60} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="headline">{pro.name}</Text>
            <Text variant="footnote" color={colors.textSecondary}>{pro.role}</Text>
            <Rating value={pro.rating} count={pro.reviewsCount} />
          </View>
        </Card>

        <View>
          <Text variant="headline" style={{ marginBottom: spacing.md }}>Serviço</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.xl }} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: 6 }}>
            {proServices.map((s) => {
              const active = s.id === svc;
              return (
                <PressableScale
                  key={s.id}
                  hapticStyle="selection"
                  onPress={() => setSvc(s.id)}
                  style={{ width: 150, padding: spacing.md, borderRadius: radius.lg, backgroundColor: active ? colors.black : colors.surface, borderWidth: 1, borderColor: active ? colors.black : colors.border, gap: 4 }}>
                  <Ionicons name={s.icon} size={20} color={colors.brand} />
                  <Text variant="subhead" weight="600" color={active ? colors.white : colors.text} numberOfLines={1}>{s.name}</Text>
                  <Text variant="caption" color={active ? colors.textOnDarkSecondary : colors.textSecondary}>{formatDuration(s.durationMin)} · {formatPrice(s.priceFrom)}</Text>
                </PressableScale>
              );
            })}
          </ScrollView>
        </View>

        <Card>
          <MonthCalendar value={day} onChange={(d) => { setDay(d); setTime(null); }} />
        </Card>

        <View>
          <Text variant="headline" style={{ marginBottom: spacing.md }}>Horário</Text>
          {!day ? (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface }}>
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
              <Text variant="subhead" color={colors.textSecondary}>Selecione uma data para ver os horários livres.</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {pro.workingHours.map((t) => {
                const disabled = isTaken(pro.id, day, t) || myTaken.has(t) || isPast(t);
                const active = time === t;
                return (
                  <Pressable
                    key={t}
                    disabled={disabled}
                    onPress={() => { haptic.selection(); setTime(t); }}
                    style={[
                      { width: '31.5%', height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
                      active ? { backgroundColor: colors.brand, borderColor: colors.brand, ...shadow.brand } : disabled ? { backgroundColor: colors.surfaceMuted, borderColor: colors.surfaceMuted } : { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}>
                    <Text variant="callout" weight="600" color={active ? colors.white : disabled ? colors.textTertiary : colors.text} style={disabled ? { textDecorationLine: 'line-through' } : null}>
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </Sheet>

      <BottomBar>
        {day && time && service ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text variant="footnote" color={colors.textSecondary}>{formatDayLong(day)} · {time}</Text>
              <Text variant="headline">{service.name}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="caption" color={colors.textSecondary}>a partir de</Text>
              <Text variant="headline" color={colors.brand}>{formatPrice(service.priceFrom)}</Text>
            </View>
          </View>
        ) : null}
        <Button title="Confirmar agendamento" disabled={!day || !time || !service} onPress={confirmBooking} />
      </BottomBar>
    </Screen>
  );
}
