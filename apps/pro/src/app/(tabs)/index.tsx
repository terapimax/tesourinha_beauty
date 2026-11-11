import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppointmentCard, formatMoneyShort, StatTile } from '@/components/pro';
import { Avatar, Badge, Button, Card, IconTile, PressableScale, SectionHeader, Text } from '@/components/ui';
import { findService } from '@/data/catalog';
import type { IconName } from '@/data/types';
import { formatDayLong, formatPrice, greeting } from '@/lib/format';
import { openWhatsApp } from '@/pro/contact';
import { addDays, endTime, needsAction, nowMin, todayKey, toMin } from '@/pro/time';
import { done, inRange, startOfWeek, total } from '@/pro/stats';
import { dayAppointments, usePro } from '@/store/pro-store';
import { colors, gradients, radius, shadow, spacing } from '@/theme';

const QUICK: { icon: IconName; title: string; href: string }[] = [
  { icon: 'add-circle-outline', title: 'Novo encaixe', href: '/new-appointment' },
  { icon: 'moon-outline', title: 'Folgas e horários', href: '/hours' },
  { icon: 'cut-outline', title: 'Meus serviços', href: '/(tabs)/services' },
  { icon: 'eye-outline', title: 'Meu perfil público', href: '/preview' },
];

export default function Today() {
  const insets = useSafeAreaInsets();
  const { profile, appointments, services, isDayOff } = usePro();
  const today = todayKey();
  const list = dayAppointments(appointments, today);
  const active = list.filter((a) => a.status !== 'cancelado');
  const firstName = profile?.name.split(' ')[0] ?? '';
  const now = nowMin();

  // Em andamento ou o próximo a começar
  const current = active.find((a) => a.status === 'confirmado' && toMin(a.time) <= now && toMin(a.time) + a.durationMin > now);
  const next = current ?? active.find((a) => a.status === 'confirmado' && toMin(a.time) > now);
  const overdue = appointments.filter(needsAction).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const expectedToday = total(active.filter((a) => a.status !== 'nao_compareceu'));
  const week = startOfWeek(today);
  const weekEarned = total(done(inRange(appointments, week, addDays(week, 7))));
  const remaining = active.filter((a) => a.status === 'confirmado').length;
  const dayOff = isDayOff(today);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text variant="subhead" color="rgba(255,255,255,0.85)">{greeting()},</Text>
              <Text variant="title1" color={colors.white}>{firstName}!</Text>
            </View>
            <PressableScale onPress={() => router.push('/(tabs)/profile')}>
              <View style={{ borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)', borderRadius: 24 }}>
                <Avatar name={profile?.name ?? 'T P'} color={colors.black} size={44} />
              </View>
            </PressableScale>
          </View>
          <Text variant="subhead" color="rgba(255,255,255,0.9)" style={{ marginTop: 2 }}>{formatDayLong(today)}</Text>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
            <StatTile tone="glass" icon="people" value={`${remaining}/${active.length}`} label="a atender hoje" />
            <StatTile tone="glass" icon="cash" value={formatMoneyShort(expectedToday)} label="previsto hoje" />
            <StatTile tone="glass" icon="trending-up" value={formatMoneyShort(weekEarned)} label="recebido na semana" />
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: spacing.xl, gap: spacing.xxl, marginTop: spacing.xl }}>
          {services.length === 0 && (
            <PressableScale onPress={() => router.push('/(tabs)/services')} scaleTo={0.98} style={styles.setup}>
              <IconTile icon="sparkles" tone="brand" size={46} />
              <View style={{ flex: 1 }}>
                <Text variant="headline">Cadastre seus serviços</Text>
                <Text variant="footnote" color={colors.textSecondary}>Escolha o que você atende e seus preços para começar a receber clientes.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.brand} />
            </PressableScale>
          )}

          {/* Atendimento atual / próximo */}
          {next ? (
            <View>
              <SectionHeader title={current ? 'Atendendo agora' : 'Próximo cliente'} />
              <View style={[styles.nextCard, shadow.floating]}>
                <LinearGradient colors={['#1C1C1E', '#0B0B0C']} style={StyleSheet.absoluteFill} />
                <LinearGradient colors={['rgba(255,106,19,0.35)', 'transparent']} start={{ x: 1, y: 0 }} end={{ x: 0.3, y: 0.8 }} style={StyleSheet.absoluteFill} />
                <View style={{ padding: spacing.xl, gap: spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <Avatar name={next.clientName} size={52} color={colors.brand} />
                    <View style={{ flex: 1 }}>
                      <Text variant="title3" weight="700" color={colors.white} numberOfLines={1}>{next.clientName}</Text>
                      <Text variant="subhead" color={colors.textOnDarkSecondary} numberOfLines={1}>
                        {findService(next.serviceId)?.name} · {formatPrice(next.price)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text variant="title2" color={colors.brand}>{next.time}</Text>
                      <Text variant="caption" color={colors.textOnDarkSecondary}>até {endTime(next.time, next.durationMin)}</Text>
                    </View>
                  </View>
                  {(next.notes || next.firstVisit) && (
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', padding: spacing.md, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                      <Ionicons name={next.firstVisit ? 'sparkles' : 'document-text-outline'} size={16} color={colors.brand} style={{ marginTop: 1 }} />
                      <Text variant="footnote" color={colors.white} style={{ flex: 1 }}>
                        {next.firstVisit ? 'Primeira vez com você. ' : ''}{next.notes ?? ''}
                      </Text>
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <Button
                      title="WhatsApp"
                      icon="logo-whatsapp"
                      size="md"
                      variant="outlineLight"
                      style={{ flex: 1 }}
                      onPress={() => openWhatsApp(next.clientPhone, `Olá, ${next.clientName.split(' ')[0]}! Aqui é ${firstName}, do Tesourinha Beauty. Confirmando seu horário hoje às ${next.time}.`)}
                    />
                    <Button title="Abrir" iconRight="arrow-forward" size="md" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/appointment/[id]', params: { id: next.id } })} />
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <IconTile icon={dayOff ? 'moon' : 'cafe'} size={46} />
              <View style={{ flex: 1 }}>
                <Text variant="headline">{dayOff ? 'Hoje é dia de folga' : active.length ? 'Atendimentos de hoje encerrados' : 'Nenhum cliente marcado hoje'}</Text>
                <Text variant="footnote" color={colors.textSecondary}>
                  {dayOff ? 'Aproveite para descansar. Sua agenda volta amanhã.' : 'Lance um encaixe se aparecer alguém sem horário.'}
                </Text>
              </View>
            </Card>
          )}

          {/* Atalhos */}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {QUICK.map((q) => (
              <PressableScale key={q.title} onPress={() => router.push(q.href as never)} style={styles.quick}>
                <IconTile icon={q.icon} size={42} />
                <Text variant="caption" weight="700" align="center">{q.title}</Text>
              </PressableScale>
            ))}
          </View>

          {/* Pendências */}
          {overdue.length > 0 && (
            <View>
              <SectionHeader title="Finalize estes atendimentos" />
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: spacing.md }}>
                <Badge label={`${overdue.length} PENDENTE${overdue.length > 1 ? 'S' : ''}`} tone="brand" icon="alert-circle" />
                <Text variant="footnote" color={colors.textSecondary} style={{ flex: 1 }}>Marque se o cliente veio, para seus ganhos ficarem certos.</Text>
              </View>
              <View style={{ gap: spacing.md }}>
                {overdue.map((a) => <AppointmentCard key={a.id} appt={a} overdue />)}
              </View>
            </View>
          )}

          {/* Agenda do dia */}
          <View>
            <SectionHeader title="Agenda de hoje" action="Ver semana" onAction={() => router.push('/(tabs)/agenda')} />
            {list.length === 0 ? (
              <Text variant="subhead" color={colors.textSecondary}>Sem atendimentos para hoje.</Text>
            ) : (
              <View style={{ gap: spacing.md }}>
                {list.map((a) => <AppointmentCard key={a.id} appt={a} highlight={a.id === next?.id} overdue={needsAction(a)} />)}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  nextCard: { borderRadius: radius.xxl, overflow: 'hidden', backgroundColor: colors.black },
  quick: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: spacing.lg, paddingHorizontal: 4, backgroundColor: colors.surface, borderRadius: radius.xl, ...shadow.card },
  setup: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.brandSoft, borderWidth: 1, borderColor: colors.brandSoftBorder },
});
