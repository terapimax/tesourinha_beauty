import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, type ScrollViewInstance, Switch, View } from 'react-native';

import { findService } from '@/data/catalog';
import type { IconName } from '@/data/types';
import { formatPrice } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { addDays, endTime, todayKey, WEEKDAY_ABBR, weekdayOf } from '@/pro/time';
import type { Appointment, AppointmentStatus } from '@/pro/types';
import { colors, radius, shadow, spacing } from '@/theme';
import { Badge, IconTile, PressableScale, Text } from './ui';

/** "R$ 1.715" — valor sem centavos para indicadores pequenos. */
export const formatMoneyShort = (value: number) => `R$ ${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

/* ------------------------------------------------------------------ */
/* Toggle (Switch com as cores da marca também na web)                 */
/* ------------------------------------------------------------------ */

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <Switch
      value={value}
      onValueChange={(v) => { haptic.selection(); onChange(v); }}
      trackColor={{ true: colors.brand, false: colors.border }}
      thumbColor={colors.white}
      // react-native-web usa esta prop para a "bolinha" quando ligado
      {...({ activeThumbColor: colors.white } as object)}
      accessibilityLabel={label}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Status                                                              */
/* ------------------------------------------------------------------ */

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmado: 'CONFIRMADO',
  concluido: 'CONCLUÍDO',
  cancelado: 'CANCELADO',
  nao_compareceu: 'NÃO COMPARECEU',
};

export function StatusBadge({ status, overdue }: { status: AppointmentStatus; overdue?: boolean }) {
  if (status === 'confirmado' && overdue) return <Badge label="FINALIZAR" tone="brand" icon="alert-circle" />;
  const tone = ({ confirmado: 'success', concluido: 'neutral', cancelado: 'danger', nao_compareceu: 'danger' } as const)[status];
  return <Badge label={STATUS_LABEL[status]} tone={tone} icon={status === 'confirmado' ? 'checkmark' : undefined} />;
}

/* ------------------------------------------------------------------ */
/* Card de atendimento                                                 */
/* ------------------------------------------------------------------ */

export function AppointmentCard({ appt, overdue, highlight }: { appt: Appointment; overdue?: boolean; highlight?: boolean }) {
  const service = findService(appt.serviceId);
  const dimmed = appt.status === 'cancelado' || appt.status === 'nao_compareceu';
  return (
    <PressableScale
      scaleTo={0.98}
      onPress={() => router.push({ pathname: '/appointment/[id]', params: { id: appt.id } })}
      style={{
        flexDirection: 'row',
        gap: spacing.md,
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.xl,
        backgroundColor: colors.surface,
        borderWidth: highlight ? 1.5 : 0,
        borderColor: colors.brand,
        opacity: dimmed ? 0.55 : 1,
        ...shadow.card,
      }}>
      <View style={{ width: 58, alignItems: 'center', paddingVertical: 8, borderRadius: radius.lg, backgroundColor: highlight ? colors.brand : colors.brandSoft }}>
        <Text variant="headline" color={highlight ? colors.white : colors.brandDark}>{appt.time}</Text>
        <Text variant="caption" color={highlight ? 'rgba(255,255,255,0.85)' : colors.textSecondary}>{endTime(appt.time, appt.durationMin)}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="headline" numberOfLines={1} style={dimmed ? { textDecorationLine: 'line-through' } : null}>
          {appt.clientName}
        </Text>
        <Text variant="footnote" color={colors.textSecondary} numberOfLines={1}>
          {service?.name ?? 'Serviço'} · {formatPrice(appt.price)}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          <StatusBadge status={appt.status} overdue={overdue} />
          {appt.firstVisit && <Badge label="1ª VEZ" tone="dark" />}
          {appt.source === 'encaixe' && <Badge label="ENCAIXE" tone="neutral" />}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </PressableScale>
  );
}

/* ------------------------------------------------------------------ */
/* Controle segmentado                                                 */
/* ------------------------------------------------------------------ */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  tone = 'light',
}: {
  options: readonly (readonly [T, string])[];
  value: T;
  onChange: (v: T) => void;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';
  return (
    <View style={{ flexDirection: 'row', backgroundColor: dark ? 'rgba(255,255,255,0.12)' : colors.border, borderRadius: radius.md, padding: 3 }}>
      {options.map(([k, label]) => {
        const active = value === k;
        return (
          <Pressable
            key={k}
            onPress={() => { haptic.selection(); onChange(k); }}
            style={{ flex: 1, paddingVertical: 8, borderRadius: radius.sm + 1, alignItems: 'center', backgroundColor: active ? colors.white : 'transparent' }}>
            <Text variant="subhead" weight="600" color={active || !dark ? colors.text : colors.white}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Indicador numérico                                                  */
/* ------------------------------------------------------------------ */

export function StatTile({ icon, value, label, tone = 'light' }: { icon: IconName; value: string; label: string; tone?: 'light' | 'glass' }) {
  const glass = tone === 'glass';
  return (
    <View style={{ flex: 1, gap: 6, padding: spacing.md, borderRadius: radius.lg, backgroundColor: glass ? 'rgba(255,255,255,0.16)' : colors.surface, ...(glass ? null : shadow.card) }}>
      {glass ? <Ionicons name={icon} size={18} color={colors.white} /> : <IconTile icon={icon} size={32} />}
      <Text variant="headline" weight="800" color={glass ? colors.white : colors.text} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text variant="caption" color={glass ? 'rgba(255,255,255,0.85)' : colors.textSecondary}>{label}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Faixa de dias (agenda)                                              */
/* ------------------------------------------------------------------ */

const STRIP_BACK = 7;
const STRIP_DAYS = 35;

export function WeekStrip({
  value,
  onChange,
  countFor,
  isDayOff,
}: {
  value: string;
  onChange: (date: string) => void;
  countFor: (date: string) => number;
  isDayOff: (date: string) => boolean;
}) {
  const today = todayKey();
  const days = Array.from({ length: STRIP_DAYS }, (_, i) => addDays(today, i - STRIP_BACK));
  const ref = useRef<ScrollViewInstance>(null);
  const ITEM = 52 + spacing.sm;

  useEffect(() => {
    const idx = days.indexOf(value);
    if (idx >= 0) ref.current?.scrollTo({ x: Math.max(0, (idx - 2) * ITEM), animated: false });
    // posiciona a faixa só na montagem
  }, []);

  return (
    <ScrollView ref={ref} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
      {days.map((d) => {
        const selected = d === value;
        const off = isDayOff(d);
        const count = countFor(d);
        const isToday = d === today;
        return (
          <Pressable
            key={d}
            onPress={() => { haptic.selection(); onChange(d); }}
            style={{
              width: 52,
              paddingVertical: 10,
              borderRadius: radius.lg,
              alignItems: 'center',
              gap: 4,
              backgroundColor: selected ? colors.brand : 'rgba(255,255,255,0.08)',
              borderWidth: isToday && !selected ? 1 : 0,
              borderColor: colors.brand,
            }}>
            <Text variant="caption2" color={selected ? colors.white : colors.textOnDarkSecondary}>{WEEKDAY_ABBR[weekdayOf(d)]!.toUpperCase()}</Text>
            <Text variant="title3" weight="700" color={off && !selected ? 'rgba(255,255,255,0.35)' : colors.white}>{Number(d.slice(8))}</Text>
            <View style={{ height: 6, flexDirection: 'row', gap: 2 }}>
              {off ? (
                <View style={{ width: 10, height: 2, marginTop: 2, borderRadius: 1, backgroundColor: selected ? colors.white : 'rgba(255,255,255,0.35)' }} />
              ) : (
                Array.from({ length: Math.min(count, 4) }, (_, i) => (
                  <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: selected ? colors.white : colors.brand }} />
                ))
              )}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* Stepper (horário, preço, duração)                                   */
/* ------------------------------------------------------------------ */

export function Stepper({ label, value, onMinus, onPlus, disabled }: { label?: string; value: string; onMinus: () => void; onPlus: () => void; disabled?: boolean }) {
  const btn = (icon: IconName, onPress: () => void, a11y: string) => (
    <Pressable
      disabled={disabled}
      onPress={() => { haptic.selection(); onPress(); }}
      hitSlop={6}
      accessibilityLabel={a11y}
      style={({ pressed }) => ({ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? colors.brandSoftBorder : colors.brandSoft })}>
      <Ionicons name={icon} size={18} color={disabled ? colors.textTertiary : colors.brand} />
    </Pressable>
  );
  return (
    <View style={{ alignItems: 'center', gap: 4, opacity: disabled ? 0.4 : 1 }}>
      {label && <Text variant="caption" color={colors.textSecondary}>{label}</Text>}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {btn('remove', onMinus, `Diminuir ${label ?? ''}`)}
        <Text variant="headline" style={{ minWidth: 56, textAlign: 'center' }}>{value}</Text>
        {btn('add', onPlus, `Aumentar ${label ?? ''}`)}
      </View>
    </View>
  );
}
