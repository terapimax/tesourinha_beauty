import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CourseRow } from '@/components/cards';
import { ScissorsMark } from '@/components/logo';
import { Screen, ScreenHeader, Sheet } from '@/components/screen';
import { Chip, PressableScale, Text } from '@/components/ui';
import { courseCategories, courses } from '@/data/catalog';
import { colors, radius, spacing } from '@/theme';

export default function Courses() {
  const [cat, setCat] = useState<string>('todos');
  const list = courses.filter((c) => cat === 'todos' || c.categoryId === cat);
  return (
    <Screen>
      <ScreenHeader title="Nossos cursos" subtitle="Qualificação profissional gratuita" />
      <Sheet contentStyle={{ gap: spacing.md, paddingTop: spacing.xl }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.xl }} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.sm }}>
          {courseCategories.map((c) => (
            <Chip key={c.id} label={c.name} active={cat === c.id} onPress={() => setCat(c.id)} />
          ))}
        </ScrollView>
        {list.map((c) => <CourseRow key={c.id} course={c} />)}

        <PressableScale onPress={() => router.push('/association')} scaleTo={0.98} style={styles.banner}>
          <LinearGradient colors={['#1C1C1E', '#0B0B0C']} style={StyleSheet.absoluteFill} />
          <View style={{ flex: 1 }}>
            <Text variant="title3" color={colors.white} weight="700">BELEZA QUE</Text>
            <Text variant="title3" color={colors.white} weight="700">TRANSFORMA VIDAS</Text>
            <Text variant="footnote" color={colors.textOnDarkSecondary} style={{ marginTop: 4 }}>Cursos 100% gratuitos com certificado</Text>
          </View>
          <ScissorsMark size={64} />
        </PressableScale>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', padding: spacing.xl, borderRadius: radius.xl, overflow: 'hidden', marginTop: spacing.md },
});
