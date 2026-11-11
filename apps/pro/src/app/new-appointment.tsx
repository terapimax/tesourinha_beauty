import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MonthCalendar } from '@/components/calendar';
import { Button, Card, Chip, EmptyState, Field, Text } from '@/components/ui';
import { findService } from '@/data/catalog';
import { formatDayLong, formatDuration, formatPrice } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { todayKey } from '@/pro/time';
import { usePro } from '@/store/pro-store';
import { colors, radius, spacing } from '@/theme';

export default function NewAppointment() {
  const params = useLocalSearchParams<{ date?: string }>();
  const insets = useSafeAreaInsets();
  const { services, freeSlots, addAppointment, isDayOff } = usePro();

  const [date, setDate] = useState(params.date && params.date >= todayKey() ? params.date : todayKey());
  const [serviceId, setServiceId] = useState(services[0]?.serviceId ?? '');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const offer = services.find((s) => s.serviceId === serviceId);
  const slots = offer ? freeSlots(date, offer.durationMin) : [];

  const save = () => {
    if (!offer) return;
    if (name.trim().length < 2) {
      haptic.warning();
      return setError('Informe o nome do cliente.');
    }
    if (!time) {
      haptic.warning();
      return setError('Escolha um horário livre.');
    }
    addAppointment({
      clientName: name.trim(),
      clientPhone: phone.trim(),
      serviceId: offer.serviceId,
      date,
      time,
      durationMin: offer.durationMin,
      price: offer.price,
      notes: notes.trim() || undefined,
    });
    haptic.success();
    router.back();
  };

  const header = (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text variant="title1">Novo encaixe</Text>
      <Pressable onPress={() => router.back()} hitSlop={12} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="Fechar">
        <Ionicons name="close" size={18} color={colors.textSecondary} />
      </Pressable>
    </View>
  );

  if (!services.length) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.xxl, paddingTop: Platform.OS === 'ios' ? spacing.xl : insets.top + spacing.xl }}>
        {header}
        <EmptyState icon="cut-outline" title="Cadastre um serviço primeiro" text="Para lançar um atendimento, escolha antes os serviços que você oferece." action="Escolher serviços" onAction={() => { router.back(); router.push('/(tabs)/services'); }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingTop: Platform.OS === 'ios' ? spacing.xl : insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xxl, gap: spacing.xxl }}
        keyboardShouldPersistTaps="handled">
        {header}
        <Text variant="subhead" color={colors.textSecondary} style={{ marginTop: -spacing.lg }}>
          Para clientes que marcaram por WhatsApp, telefone ou chegaram sem horário.
        </Text>

        <View style={{ gap: spacing.lg }}>
          <Field label="Cliente" icon="person-outline" placeholder="Nome do cliente" value={name} onChangeText={setName} autoComplete="name" />
          <Field label="Celular (opcional)" icon="call-outline" placeholder="(11) 90000-0000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="footnote" color={colors.textSecondary} weight="600" style={{ marginLeft: 4 }}>SERVIÇO</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {services.map((s) => (
              <Chip key={s.serviceId} label={findService(s.serviceId)?.name ?? s.serviceId} active={s.serviceId === serviceId} onPress={() => { setServiceId(s.serviceId); setTime(''); }} />
            ))}
          </View>
          {offer && (
            <Text variant="footnote" color={colors.textSecondary} style={{ marginLeft: 4 }}>
              {formatDuration(offer.durationMin)} · {formatPrice(offer.price)}
            </Text>
          )}
        </View>

        <Card>
          <MonthCalendar value={date} onChange={(d) => { setDate(d); setTime(''); }} />
        </Card>

        <View style={{ gap: spacing.sm }}>
          <Text variant="footnote" color={colors.textSecondary} weight="600" style={{ marginLeft: 4 }}>
            HORÁRIOS LIVRES · {formatDayLong(date).toUpperCase()}
          </Text>
          {slots.length === 0 ? (
            <View style={{ padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface }}>
              <Text variant="subhead" color={colors.textSecondary}>
                {isDayOff(date) ? 'Você não atende nesta data.' : 'Sem horários livres para este serviço. Tente outro dia.'}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {slots.map((t) => (
                <Chip key={t} label={t} active={t === time} onPress={() => setTime(t)} />
              ))}
            </View>
          )}
        </View>

        <Field label="Observações (opcional)" placeholder="Ex.: prefere água sem gás, alergia a amônia..." value={notes} onChangeText={setNotes} multiline />

        {!!error && (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.dangerSoft }}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text variant="footnote" color={colors.danger} style={{ flex: 1 }}>{error}</Text>
          </View>
        )}

        <Button title={time ? `Marcar às ${time}` : 'Marcar horário'} icon="checkmark" onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
