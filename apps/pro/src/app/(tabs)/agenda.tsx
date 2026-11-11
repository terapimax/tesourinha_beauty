import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppointmentCard, WeekStrip } from '@/components/pro';
import { Screen, ScreenHeader, Sheet } from '@/components/screen';
import { Badge, Button, Card, EmptyState, IconTile, Text } from '@/components/ui';
import { confirm } from '@/lib/confirm';
import { formatDayLong, formatPrice } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { total } from '@/pro/stats';
import { needsAction, todayKey, weekdayOf } from '@/pro/time';
import { dayAppointments, usePro } from '@/store/pro-store';
import { colors, spacing } from '@/theme';

export default function Agenda() {
  const { appointments, isDayOff, timeOff, week, freeSlots, slotMinutes, addTimeOff, removeTimeOff } = usePro();
  const [date, setDate] = useState(todayKey());
  const list = dayAppointments(appointments, date);
  const active = list.filter((a) => a.status !== 'cancelado');
  const off = isDayOff(date);
  const block = timeOff.find((t) => t.date === date);
  const weeklyOff = !week[weekdayOf(date)]?.enabled;
  const free = freeSlots(date, slotMinutes).length;
  const isPastDay = date < todayKey();

  return (
    <Screen>
      <ScreenHeader
        title="Agenda"
        back={false}
        right={
          <Pressable
            onPress={() => { haptic.light(); router.push({ pathname: '/new-appointment', params: { date } }); }}
            hitSlop={10}
            accessibilityLabel="Novo encaixe"
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="add" size={24} color={colors.white} />
          </Pressable>
        }>
        <WeekStrip
          value={date}
          onChange={setDate}
          isDayOff={isDayOff}
          countFor={(d) => appointments.filter((a) => a.date === d && a.status !== 'cancelado').length}
        />
      </ScreenHeader>

      <Sheet contentStyle={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <View style={{ flex: 1 }}>
            <Text variant="title3" weight="700">{formatDayLong(date)}</Text>
            <Text variant="footnote" color={colors.textSecondary}>
              {active.length} atendimento{active.length === 1 ? '' : 's'} · {formatPrice(total(active.filter((a) => a.status !== 'nao_compareceu')))}
              {!off && !isPastDay ? ` · ${free} horário${free === 1 ? '' : 's'} livre${free === 1 ? '' : 's'}` : ''}
            </Text>
          </View>
          {date === todayKey() && <Badge label="HOJE" />}
        </View>

        {off && (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <IconTile icon="moon" size={42} tone="dark" />
            <View style={{ flex: 1 }}>
              <Text variant="headline">{block ? 'Dia bloqueado' : 'Você não atende neste dia'}</Text>
              <Text variant="footnote" color={colors.textSecondary}>
                {block ? block.reason : weeklyOff ? 'Altere em Folgas e horários.' : ''}
              </Text>
            </View>
            {block && (
              <Button title="Liberar" size="sm" variant="secondary" full={false} onPress={() => { removeTimeOff(block.id); haptic.success(); }} />
            )}
          </Card>
        )}

        {list.length === 0 ? (
          !off && (
            <EmptyState
              icon="calendar-clear-outline"
              title="Agenda livre"
              text={isPastDay ? 'Nenhum atendimento neste dia.' : 'Ninguém marcou ainda. Os horários livres aparecem para os clientes no app.'}
              action={isPastDay ? undefined : 'Lançar encaixe'}
              onAction={() => router.push({ pathname: '/new-appointment', params: { date } })}
            />
          )
        ) : (
          list.map((a) => <AppointmentCard key={a.id} appt={a} overdue={needsAction(a)} />)
        )}

        {!off && !isPastDay && (
          <Button
            title="Bloquear este dia"
            icon="moon-outline"
            variant="outline"
            size="md"
            style={{ marginTop: spacing.lg }}
            onPress={() =>
              confirm(
                'Bloquear este dia?',
                active.length
                  ? `Você tem ${active.length} atendimento(s) marcado(s). Eles continuam na agenda; avise os clientes para remarcar.`
                  : 'Clientes não poderão agendar nesta data.',
                'Bloquear',
                () => { addTimeOff(date, 'Folga'); haptic.success(); },
                false,
              )
            }
          />
        )}
      </Sheet>
    </Screen>
  );
}
