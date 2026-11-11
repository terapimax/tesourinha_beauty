import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { BookingCard } from '@/components/cards';
import { Screen, ScreenHeader, Sheet } from '@/components/screen';
import { EmptyState, Text } from '@/components/ui';
import { confirm } from '@/lib/confirm';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { colors, radius, spacing } from '@/theme';

export default function Bookings() {
  const { bookings, cancelBooking } = useApp();
  const [tab, setTab] = useState<'next' | 'history'>('next');
  const upcoming = bookings.filter((b) => b.status === 'confirmado').sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const history = bookings.filter((b) => b.status !== 'confirmado');
  const list = tab === 'next' ? upcoming : history;

  return (
    <Screen>
      <ScreenHeader title="Agendamentos" back={false}>
        <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.md, padding: 3 }}>
          {([['next', `Próximos (${upcoming.length})`], ['history', 'Histórico']] as const).map(([k, label]) => (
            <Pressable
              key={k}
              onPress={() => { haptic.selection(); setTab(k); }}
              style={{ flex: 1, paddingVertical: 8, borderRadius: radius.sm + 1, alignItems: 'center', backgroundColor: tab === k ? colors.white : 'transparent' }}>
              <Text variant="subhead" weight="600" color={tab === k ? colors.text : colors.white}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </ScreenHeader>
      <Sheet contentStyle={{ gap: spacing.md }}>
        {list.length === 0 ? (
          tab === 'next' ? (
            <EmptyState icon="calendar-outline" title="Nenhum horário marcado" text="Escolha um serviço e reserve com os melhores profissionais em poucos toques." action="Agendar serviço" onAction={() => router.push('/services')} />
          ) : (
            <EmptyState icon="time-outline" title="Sem histórico ainda" text="Seus atendimentos concluídos e cancelados aparecem aqui." />
          )
        ) : (
          list.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onCancel={() => confirm('Cancelar agendamento?', 'O horário ficará disponível para outras pessoas.', 'Cancelar horário', () => cancelBooking(b.id))}
            />
          ))
        )}
      </Sheet>
    </Screen>
  );
}
