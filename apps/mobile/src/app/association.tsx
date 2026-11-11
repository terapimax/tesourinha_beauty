import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { Logo } from '@/components/logo';
import { Screen, ScreenHeader, Sheet } from '@/components/screen';
import { Button, Card, IconTile, Text } from '@/components/ui';
import { association } from '@/data/catalog';
import { colors, spacing } from '@/theme';

export default function Association() {
  return (
    <Screen>
      <ScreenHeader title={association.name}>
        <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
          <Logo size="sm" tagline={false} />
        </View>
      </ScreenHeader>
      <Sheet contentStyle={{ gap: spacing.xxl }}>
        <Text variant="title2" align="center">{association.tagline}</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {association.stats.map((s) => (
            <Card key={s.label} style={{ flex: 1, alignItems: 'center', paddingHorizontal: 6 }}>
              <Text variant="title2" color={colors.brand}>{s.value}</Text>
              <Text variant="caption" color={colors.textSecondary} align="center">{s.label}</Text>
            </Card>
          ))}
        </View>
        <View style={{ gap: spacing.md }}>
          {association.pillars.map((p) => (
            <Card key={p.title} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
              <IconTile icon={p.icon} size={48} />
              <View style={{ flex: 1 }}>
                <Text variant="headline">{p.title}</Text>
                <Text variant="footnote" color={colors.textSecondary}>{p.text}</Text>
              </View>
            </Card>
          ))}
        </View>
        <View style={{ gap: spacing.md }}>
          <Button title="Ver cursos gratuitos" icon="school-outline" onPress={() => router.push('/courses')} />
          <Button title="Quero apoiar a Associação" variant="outline" icon="heart-outline" onPress={() => router.push('/help')} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="sparkles" size={14} color={colors.brand} />
          <Text variant="footnote" color={colors.textSecondary}>Qualificação · Oportunidade · Impacto social</Text>
        </View>
      </Sheet>
    </Screen>
  );
}
