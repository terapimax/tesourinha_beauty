import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { monthLabel, toDayKey, WEEKDAYS_SHORT } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { colors, spacing } from '@/theme';
import { Text } from './ui';

/** Calendário mensal no estilo iOS. Domingos e dias passados ficam desabilitados. */
export function MonthCalendar({ value, onChange }: { value: string | null; onChange: (day: string) => void }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const out: (Date | null)[] = Array(first.getDay()).fill(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (out.length % 7) out.push(null);
    return out;
  }, [cursor]);

  const canPrev = cursor > new Date(today.getFullYear(), today.getMonth(), 1);
  const move = (delta: number) => {
    haptic.selection();
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
        <Text variant="headline">{monthLabel(cursor)}</Text>
        <View style={{ flexDirection: 'row', gap: spacing.lg }}>
          <Pressable onPress={() => canPrev && move(-1)} hitSlop={10} disabled={!canPrev} accessibilityLabel="Mês anterior">
            <Ionicons name="chevron-back" size={22} color={canPrev ? colors.brand : colors.textTertiary} />
          </Pressable>
          <Pressable onPress={() => move(1)} hitSlop={10} accessibilityLabel="Próximo mês">
            <Ionicons name="chevron-forward" size={22} color={colors.brand} />
          </Pressable>
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS_SHORT.map((w, i) => (
          <Text key={i} variant="caption2" color={colors.textTertiary} align="center" style={{ flex: 1 }}>{w}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm }}>
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={{ width: `${100 / 7}%`, height: 44 }} />;
          const key = toDayKey(d);
          const disabled = d < today || d.getDay() === 0;
          const selected = value === key;
          const isToday = d.getTime() === today.getTime();
          return (
            <View key={i} style={{ width: `${100 / 7}%`, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Pressable
                disabled={disabled}
                onPress={() => { haptic.selection(); onChange(key); }}
                style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? colors.brand : isToday ? colors.brandSoft : 'transparent' }}>
                <Text variant="callout" weight={selected || isToday ? '700' : '500'} color={selected ? colors.white : disabled ? colors.textTertiary : isToday ? colors.brand : colors.text}>
                  {d.getDate()}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
