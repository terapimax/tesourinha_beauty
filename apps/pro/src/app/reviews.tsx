import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Screen, ScreenHeader, Sheet } from '@/components/screen';
import { Avatar, Card, EmptyState, Rating, Text } from '@/components/ui';
import { formatDayShort } from '@/lib/format';
import { usePro } from '@/store/pro-store';
import { colors, radius, spacing } from '@/theme';

export default function Reviews() {
  const { reviews, rating } = usePro();
  const dist = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => Math.round(r.rating) === star).length }));
  const maxCount = Math.max(...dist.map((d) => d.count), 1);

  return (
    <Screen>
      <ScreenHeader title="Avaliações" subtitle="O que seus clientes dizem depois do atendimento" />
      <Sheet contentStyle={{ gap: spacing.md }}>
        {reviews.length === 0 ? (
          <EmptyState icon="star-outline" title="Sem avaliações ainda" text="Depois de cada atendimento concluído, o cliente recebe um convite para avaliar você." />
        ) : (
          <>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xl }}>
              <View style={{ alignItems: 'center' }}>
                <Text variant="largeTitle">{rating.toFixed(1)}</Text>
                <View style={{ flexDirection: 'row' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons key={i} name={i <= Math.round(rating) ? 'star' : 'star-outline'} size={14} color={colors.star} />
                  ))}
                </View>
                <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>{reviews.length} recentes</Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                {dist.map((d) => (
                  <View key={d.star} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text variant="caption" color={colors.textSecondary} style={{ width: 10 }}>{d.star}</Text>
                    <View style={{ flex: 1, height: 6, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, overflow: 'hidden' }}>
                      <View style={{ width: `${(d.count / maxCount) * 100}%`, height: '100%', borderRadius: radius.pill, backgroundColor: colors.star }} />
                    </View>
                    <Text variant="caption" color={colors.textSecondary} style={{ width: 16, textAlign: 'right' }}>{d.count}</Text>
                  </View>
                ))}
              </View>
            </Card>
            {reviews.map((r) => (
              <Card key={r.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Avatar name={r.author} size={36} color="#8E8E93" />
                  <View style={{ flex: 1 }}>
                    <Text variant="subhead" weight="600">{r.author}</Text>
                    <Rating value={r.rating} />
                  </View>
                  <Text variant="caption" color={colors.textTertiary}>{formatDayShort(r.date)}</Text>
                </View>
                <Text variant="subhead" color={colors.textSecondary} style={{ marginTop: spacing.md }}>“{r.comment}”</Text>
              </Card>
            ))}
          </>
        )}
      </Sheet>
    </Screen>
  );
}
