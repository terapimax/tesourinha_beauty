import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { StatusBadge } from '@/components/pro';
import { BottomBar, Screen, ScreenHeader, Sheet } from '@/components/screen';
import { Avatar, Badge, Button, Card, EmptyState, IconTile, ListGroup, ListRow, Text } from '@/components/ui';
import { findService } from '@/data/catalog';
import { confirm } from '@/lib/confirm';
import { formatDayLong, formatDuration, formatPrice } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { callPhone, openWhatsApp } from '@/pro/contact';
import { endTime, isPast } from '@/pro/time';
import type { AppointmentStatus } from '@/pro/types';
import { usePro } from '@/store/pro-store';
import { colors, spacing } from '@/theme';

export default function AppointmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, setStatus, profile } = usePro();
  const appt = appointments.find((a) => a.id === id);

  if (!appt) {
    return (
      <Screen>
        <ScreenHeader title="Atendimento" />
        <Sheet>
          <EmptyState icon="calendar-outline" title="Atendimento não encontrado" text="Ele pode ter sido removido." />
        </Sheet>
      </Screen>
    );
  }

  const service = findService(appt.serviceId);
  const started = isPast(appt.date, appt.time);
  const open = appt.status === 'confirmado';
  const first = appt.clientName.split(' ')[0];
  const history = appointments.filter((a) => a.clientName === appt.clientName && a.id !== appt.id && a.status === 'concluido');

  const change = (status: AppointmentStatus) => {
    setStatus(appt.id, status);
    if (status === 'concluido') haptic.success();
    else haptic.warning();
  };

  return (
    <Screen>
      <ScreenHeader title="Atendimento" subtitle={`${formatDayLong(appt.date)} · ${appt.time}`} />
      <Sheet contentStyle={{ gap: spacing.xxl, paddingBottom: 200 }}>
        <Card style={{ alignItems: 'center', gap: spacing.sm }}>
          <Avatar name={appt.clientName} size={72} color={colors.brand} />
          <Text variant="title2" align="center">{appt.clientName}</Text>
          <Text variant="subhead" color={colors.textSecondary}>{appt.clientPhone}</Text>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <StatusBadge status={appt.status} overdue={open && started} />
            {appt.firstVisit && <Badge label="1ª VEZ" tone="dark" />}
            <Badge label={appt.source === 'app' ? 'PELO APP' : 'ENCAIXE'} tone="neutral" icon={appt.source === 'app' ? 'phone-portrait' : 'create'} />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, alignSelf: 'stretch', marginTop: spacing.sm }}>
            <Button
              title="WhatsApp"
              icon="logo-whatsapp"
              size="md"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => openWhatsApp(appt.clientPhone, `Olá, ${first}! Aqui é ${profile?.name.split(' ')[0]}, do Tesourinha Beauty.`)}
            />
            <Button title="Ligar" icon="call" size="md" variant="outline" style={{ flex: 1 }} onPress={() => callPhone(appt.clientPhone)} />
          </View>
        </Card>

        <ListGroup title="Serviço">
          <ListRow left={<IconTile icon={service?.icon ?? 'cut-outline'} size={40} />} title={service?.name ?? 'Serviço'} subtitle={`${appt.time} – ${endTime(appt.time, appt.durationMin)} · ${formatDuration(appt.durationMin)}`} value={formatPrice(appt.price)} />
          {appt.notes ? <ListRow icon="document-text-outline" title="Observações" subtitle={appt.notes} /> : null}
        </ListGroup>

        <ListGroup title="Histórico com você" footer={history.length ? undefined : 'Primeiro atendimento registrado com esta cliente.'}>
          <ListRow icon="repeat-outline" title="Atendimentos concluídos" value={String(history.length)} />
          {history.length > 0 && <ListRow icon="cash-outline" title="Total já gasto" value={formatPrice(history.reduce((s, a) => s + a.price, 0))} />}
        </ListGroup>

        {open && !started && (
          <Button
            title="Cancelar atendimento"
            variant="ghost"
            icon="close-circle-outline"
            onPress={() =>
              confirm('Cancelar atendimento?', `Avise ${first} pelo WhatsApp para remarcar. O horário volta a ficar livre.`, 'Cancelar atendimento', () => {
                change('cancelado');
                router.back();
              })
            }
            style={{ marginTop: -spacing.md }}
          />
        )}
        {!open && appt.status !== 'cancelado' && (
          <Button title="Desfazer e voltar para confirmado" variant="ghost" icon="arrow-undo-outline" onPress={() => change('confirmado')} style={{ marginTop: -spacing.md }} />
        )}
      </Sheet>

      {open && (
        <BottomBar>
          {started ? (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button title="Não veio" variant="outline" icon="close" style={{ flex: 1 }} onPress={() => change('nao_compareceu')} />
              <Button title="Concluir" icon="checkmark" style={{ flex: 2 }} onPress={() => change('concluido')} />
            </View>
          ) : (
            <Text variant="footnote" color={colors.textSecondary} align="center" style={{ paddingVertical: spacing.sm }}>
              Os botões para concluir aparecem quando chegar o horário.
            </Text>
          )}
        </BottomBar>
      )}
    </Screen>
  );
}
