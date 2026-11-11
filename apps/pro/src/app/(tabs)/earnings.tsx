import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { formatMoneyShort, Segmented, StatTile } from '@/components/pro';
import { Screen, ScreenHeader, Sheet } from '@/components/screen';
import { Card, IconTile, ListGroup, ListRow, SectionHeader, Text } from '@/components/ui';
import { findService } from '@/data/catalog';
import { formatDayShort, formatPrice, monthLabel } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { done, inRange, nextMonth, startOfMonth, startOfWeek, total } from '@/pro/stats';
import { addDays, todayKey, WEEKDAY_ABBR, weekdayOf } from '@/pro/time';
import type { Appointment } from '@/pro/types';
import { usePro } from '@/store/pro-store';
import { colors, radius, spacing } from '@/theme';

type Period = 'week' | 'month';

/** Intervalo [from, to) do período deslocado em `offset` semanas/meses. */
function range(period: Period, offset: number) {
  const today = todayKey();
  if (period === 'week') {
    const from = addDays(startOfWeek(today), offset * 7);
    return { from, to: addDays(from, 7), label: offset === 0 ? 'Esta semana' : `${formatDayShort(from)} – ${formatDayShort(addDays(from, 6))}` };
  }
  let from = startOfMonth(today);
  for (let i = 0; i < Math.abs(offset); i++) from = offset < 0 ? startOfMonth(addDays(from, -1)) : nextMonth(from);
  const [y, m] = from.split('-').map(Number);
  return { from, to: nextMonth(from), label: offset === 0 ? 'Este mês' : monthLabel(new Date(y, m - 1, 1)) };
}

/** Barras: dias da semana, ou semanas do mês. */
function buckets(period: Period, from: string, to: string, list: Appointment[]) {
  if (period === 'week') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(from, i);
      return { key: d, label: WEEKDAY_ABBR[weekdayOf(d)]!, detail: formatDayShort(d), value: total(list.filter((a) => a.date === d)) };
    });
  }
  const out: { key: string; label: string; detail: string; value: number }[] = [];
  for (let start = from, i = 1; start < to; start = addDays(start, 7), i++) {
    const end = addDays(start, 7) < to ? addDays(start, 7) : to;
    out.push({ key: start, label: `Sem ${i}`, detail: `${formatDayShort(start)} – ${formatDayShort(addDays(end, -1))}`, value: total(inRange(list, start, end)) });
  }
  return out;
}

const CHART_H = 150;

export default function Earnings() {
  const { appointments } = usePro();
  const [period, setPeriod] = useState<Period>('week');
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const { from, to, label } = range(period, offset);
  const inPeriod = inRange(appointments, from, to);
  const completed = done(inPeriod);
  const earned = total(completed);
  const today = todayKey();
  const expected = total(inPeriod.filter((a) => a.status === 'confirmado' && a.date >= today));
  const noShows = inPeriod.filter((a) => a.status === 'nao_compareceu').length;
  const ticket = completed.length ? earned / completed.length : 0;

  const bars = buckets(period, from, to, completed);
  const max = Math.max(...bars.map((b) => b.value), 1);
  const best = bars.reduce((a, b) => (b.value > a.value ? b : a), bars[0]!);
  const focus = bars.find((b) => b.key === selected) ?? (best.value > 0 ? best : null);

  const byService = Object.entries(
    completed.reduce<Record<string, { count: number; sum: number }>>((acc, a) => {
      const cur = acc[a.serviceId] ?? { count: 0, sum: 0 };
      acc[a.serviceId] = { count: cur.count + 1, sum: cur.sum + a.price };
      return acc;
    }, {}),
  ).sort((a, b) => b[1].sum - a[1].sum);

  const changePeriod = (p: Period) => {
    setPeriod(p);
    setOffset(0);
    setSelected(null);
  };
  const move = (delta: number) => {
    haptic.selection();
    setOffset((o) => o + delta);
    setSelected(null);
  };

  return (
    <Screen>
      <ScreenHeader title="Ganhos" back={false}>
        <Segmented tone="dark" options={[['week', 'Semana'], ['month', 'Mês']] as const} value={period} onChange={changePeriod} />
      </ScreenHeader>
      <Sheet contentStyle={{ gap: spacing.xxl }}>
        {/* Navegação de período */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={() => move(-1)} hitSlop={12} accessibilityLabel="Período anterior">
            <Ionicons name="chevron-back" size={22} color={colors.brand} />
          </Pressable>
          <Text variant="headline">{label}</Text>
          <Pressable onPress={() => offset < 0 && move(1)} disabled={offset >= 0} hitSlop={12} accessibilityLabel="Próximo período">
            <Ionicons name="chevron-forward" size={22} color={offset < 0 ? colors.brand : colors.textTertiary} />
          </Pressable>
        </View>

        {/* Total + gráfico */}
        <Card style={{ gap: spacing.lg }}>
          <View>
            <Text variant="footnote" color={colors.textSecondary}>Recebido em atendimentos concluídos</Text>
            <Text variant="largeTitle">{formatPrice(earned)}</Text>
            {expected > 0 && (
              <Text variant="footnote" color={colors.textSecondary}>+ {formatPrice(expected)} previstos em horários confirmados</Text>
            )}
          </View>

          <View>
            <View style={{ height: 22, justifyContent: 'center' }}>
              {focus && (
                <Text variant="footnote" weight="600">
                  {focus.detail}: {formatPrice(focus.value)}
                </Text>
              )}
            </View>
            <View style={{ height: CHART_H, flexDirection: 'row', alignItems: 'flex-end', gap: 2, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              {bars.map((b) => {
                const active = focus?.key === b.key;
                return (
                  <Pressable
                    key={b.key}
                    onPress={() => { haptic.selection(); setSelected(b.key); }}
                    accessibilityLabel={`${b.detail}: ${formatPrice(b.value)}`}
                    style={{ flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <View
                      style={{
                        width: period === 'week' ? 18 : 28,
                        height: b.value ? Math.max(4, (b.value / max) * (CHART_H - 8)) : 2,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                        backgroundColor: b.value ? (active ? colors.brand : colors.brandLight) : colors.border,
                        opacity: focus && !active && b.value ? 0.55 : 1,
                      }}
                    />
                  </Pressable>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', gap: 2, marginTop: 6 }}>
              {bars.map((b) => (
                <Text key={b.key} variant="caption" color={focus?.key === b.key ? colors.text : colors.textSecondary} align="center" style={{ flex: 1 }}>
                  {b.label}
                </Text>
              ))}
            </View>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <StatTile icon="checkmark-done" value={String(completed.length)} label="atendimentos" />
          <StatTile icon="pricetag" value={formatMoneyShort(ticket)} label="ticket médio" />
          <StatTile icon="person-remove" value={String(noShows)} label="faltas" />
        </View>

        <View>
          <SectionHeader title="Por serviço" />
          {byService.length === 0 ? (
            <Text variant="subhead" color={colors.textSecondary}>Nenhum atendimento concluído neste período.</Text>
          ) : (
            <ListGroup>
              {byService.map(([id, v]) => {
                const s = findService(id);
                return (
                  <ListRow
                    key={id}
                    left={<IconTile icon={s?.icon ?? 'cut-outline'} size={40} />}
                    title={s?.name ?? id}
                    subtitle={`${v.count} atendimento${v.count > 1 ? 's' : ''} · ${Math.round((v.sum / earned) * 100)}% do total`}
                    value={formatPrice(v.sum)}
                  />
                );
              })}
            </ListGroup>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface }}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
          <Text variant="footnote" color={colors.textSecondary} style={{ flex: 1 }}>
            Por enquanto o pagamento é feito direto a você no atendimento. Pix e cartão pelo app estão no roadmap.
          </Text>
        </View>
      </Sheet>
    </Screen>
  );
}
