import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { MonthCalendar } from '@/components/calendar';
import { Stepper, Toggle } from '@/components/pro';
import { Screen, ScreenHeader, Sheet } from '@/components/screen';
import { Button, Card, Chip, Field, SectionHeader, Text } from '@/components/ui';
import { formatDayLong } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { fromMin, todayKey, toMin, WEEKDAY_NAMES } from '@/pro/time';
import { usePro } from '@/store/pro-store';
import { colors, radius, spacing } from '@/theme';

const STEP = 30;
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // segunda primeiro

export default function Hours() {
  const { week, setWorkDay, slotMinutes, setSlotMinutes, timeOff, addTimeOff, removeTimeOff } = usePro();
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const upcomingOff = timeOff.filter((t) => t.date >= todayKey());

  const shift = (weekday: number, field: 'start' | 'end', delta: number) => {
    const d = week.find((w) => w.weekday === weekday)!;
    const next = toMin(d[field]) + delta;
    const start = field === 'start' ? next : toMin(d.start);
    const end = field === 'end' ? next : toMin(d.end);
    if (start < 6 * 60 || end > 23 * 60 || end - start < 60) return;
    setWorkDay(weekday, { [field]: fromMin(next) });
  };

  return (
    <Screen>
      <ScreenHeader title="Horários e folgas" subtitle="Clientes só conseguem agendar dentro do seu expediente." />
      <Sheet contentStyle={{ gap: spacing.xxl }}>
        <View>
          <SectionHeader title="Expediente semanal" />
          <View style={{ gap: spacing.sm }}>
            {DAY_ORDER.map((wd) => {
              const d = week.find((w) => w.weekday === wd)!;
              return (
                <Card key={wd} style={{ gap: d.enabled ? spacing.md : 0, paddingVertical: spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                      <Text variant="headline">{WEEKDAY_NAMES[wd]}</Text>
                      <Text variant="footnote" color={colors.textSecondary}>{d.enabled ? `${d.start} às ${d.end}` : 'Folga'}</Text>
                    </View>
                    <Toggle value={d.enabled} onChange={(v) => setWorkDay(wd, { enabled: v })} label={`Atender ${WEEKDAY_NAMES[wd]}`} />
                  </View>
                  {d.enabled && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                      <Stepper label="Início" value={d.start} onMinus={() => shift(wd, 'start', -STEP)} onPlus={() => shift(wd, 'start', STEP)} />
                      <Stepper label="Fim" value={d.end} onMinus={() => shift(wd, 'end', -STEP)} onPlus={() => shift(wd, 'end', STEP)} />
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        </View>

        <View>
          <SectionHeader title="Intervalo entre horários" />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {[15, 30, 60].map((m) => (
              <Chip key={m} label={m === 60 ? '1 hora' : `${m} min`} active={slotMinutes === m} onPress={() => setSlotMinutes(m)} />
            ))}
          </View>
          <Text variant="footnote" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
            De quanto em quanto tempo os horários aparecem para o cliente (ex.: 9:00, 9:30, 10:00).
          </Text>
        </View>

        <View>
          <SectionHeader title="Folgas e bloqueios" action={adding ? undefined : 'Adicionar'} onAction={() => setAdding(true)} />
          {adding && (
            <Card style={{ gap: spacing.lg, marginBottom: spacing.md }}>
              <MonthCalendar value={date} onChange={setDate} />
              <Field label="Motivo (só você vê)" placeholder="Ex.: férias, curso, consulta médica" value={reason} onChangeText={setReason} />
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Button title="Cancelar" variant="outline" size="md" style={{ flex: 1 }} onPress={() => { setAdding(false); setDate(null); setReason(''); }} />
                <Button
                  title="Bloquear dia"
                  size="md"
                  style={{ flex: 1 }}
                  disabled={!date}
                  onPress={() => {
                    if (!date) return;
                    addTimeOff(date, reason.trim() || 'Folga');
                    haptic.success();
                    setAdding(false);
                    setDate(null);
                    setReason('');
                  }}
                />
              </View>
            </Card>
          )}
          {upcomingOff.length === 0 ? (
            !adding && <Text variant="subhead" color={colors.textSecondary}>Nenhuma folga marcada. Bloqueie dias de férias, cursos ou compromissos.</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {upcomingOff.map((t) => (
                <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface }}>
                  <Ionicons name="moon" size={20} color={colors.brand} />
                  <View style={{ flex: 1 }}>
                    <Text variant="subhead" weight="600">{formatDayLong(t.date)}</Text>
                    <Text variant="footnote" color={colors.textSecondary}>{t.reason}</Text>
                  </View>
                  <Pressable onPress={() => { haptic.light(); removeTimeOff(t.id); }} hitSlop={10} accessibilityLabel="Remover bloqueio">
                    <Ionicons name="close-circle" size={22} color={colors.textTertiary} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </Sheet>
    </Screen>
  );
}
