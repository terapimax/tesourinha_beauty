import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { categories, professionals, services } from '@/data/catalog';
import type { CategoryId } from '@/data/types';
import { colors, spacing } from '@/theme';
import { ProfessionalRow } from './cards';
import { Screen, ScreenHeader } from './screen';
import { Chip, EmptyState, SearchBar, Text } from './ui';

type Sort = 'distance' | 'rating';

export function ProfessionalsScreen({ back, initialCategory }: { back: boolean; initialCategory?: CategoryId }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<CategoryId | 'todos'>(initialCategory ?? 'todos');
  const [sort, setSort] = useState<Sort>('distance');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return professionals
      .filter((p) => cat === 'todos' || p.categoryIds.includes(cat))
      .filter((p) => {
        if (!q) return true;
        const svc = p.serviceIds.map((id) => services.find((s) => s.id === id)?.name ?? '').join(' ');
        return `${p.name} ${p.role} ${p.neighborhood} ${svc}`.toLowerCase().includes(q);
      })
      .sort((a, b) => (sort === 'distance' ? a.distanceKm - b.distanceKm : b.rating - a.rating || b.reviewsCount - a.reviewsCount));
  }, [query, cat, sort]);

  return (
    <Screen>
      <ScreenHeader title="Profissionais" subtitle="Encontre os melhores perto de você" back={back}>
        <SearchBar placeholder="Nome, serviço ou bairro" value={query} onChangeText={setQuery} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md }}>
          <Ionicons name="location" size={14} color={colors.brand} />
          <Text variant="footnote" color={colors.textOnDarkSecondary}>São Paulo, SP · Próximo a você</Text>
        </View>
      </ScreenHeader>
      <View style={{ flex: 1, marginTop: -28, backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' }}>
        <FlatList
          data={list}
          keyExtractor={(p) => p.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + 110, gap: spacing.md }}
          ListHeaderComponent={
            <View style={{ marginHorizontal: -spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xs }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.sm }}>
                <Chip label="Todos" active={cat === 'todos'} onPress={() => setCat('todos')} />
                {categories.map((c) => (
                  <Chip key={c.id} label={c.name} active={cat === c.id} onPress={() => setCat(c.id)} />
                ))}
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, marginTop: spacing.md }}>
                <Chip label="Mais perto" icon="navigate-outline" active={sort === 'distance'} onPress={() => setSort('distance')} />
                <Chip label="Melhor avaliados" icon="star-outline" active={sort === 'rating'} onPress={() => setSort('rating')} />
              </View>
              <Text variant="footnote" color={colors.textSecondary} style={{ paddingHorizontal: spacing.xl, marginTop: spacing.lg }}>
                {list.length} {list.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
              </Text>
            </View>
          }
          renderItem={({ item }) => <ProfessionalRow pro={item} />}
          ListEmptyComponent={<EmptyState icon="search-outline" title="Nenhum resultado" text="Tente buscar por outro nome, serviço ou categoria." />}
        />
      </View>
    </Screen>
  );
}
