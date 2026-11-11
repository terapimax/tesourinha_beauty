import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, BottomBar } from '@/components/screen';
import { Avatar, Badge, Button, Card, IconTile, ListGroup, ListRow, PressableScale, Rating, SectionHeader, Text } from '@/components/ui';
import { findProfessional, services } from '@/data/catalog';
import { formatDayShort, formatDuration, formatPrice } from '@/lib/format';
import { useApp } from '@/store/app-store';
import { colors, radius, spacing } from '@/theme';

export default function ProfessionalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pro = findProfessional(id);
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useApp();
  if (!pro) return null;
  const fav = isFavorite(pro.id);
  const proServices = services.filter((s) => pro.serviceIds.includes(s.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {/* Capa */}
        <View style={{ height: 230 + insets.top, backgroundColor: colors.black }}>
          <LinearGradient colors={['rgba(255,106,19,0.55)', 'rgba(255,106,19,0.05)']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={{ position: 'absolute', top: insets.top + spacing.sm, left: spacing.xl, right: spacing.xl, flexDirection: 'row', justifyContent: 'space-between' }}>
            <BackButton tone="glass" />
            <PressableScale hapticStyle="selection" onPress={() => toggleFavorite(pro.id)} style={styles.roundBtn} accessibilityLabel="Favoritar">
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? colors.brand : colors.white} />
            </PressableScale>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.xl, marginTop: -64, gap: spacing.xxl }}>
          <Card style={{ alignItems: 'center', paddingTop: 0 }}>
            <View style={{ marginTop: -48 }}>
              <Avatar name={pro.name} color={pro.avatarColor} uri={pro.imageUrl} size={96} ring />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md }}>
              <Text variant="title2">{pro.name}</Text>
              {pro.tesourinhaAlumni && <Ionicons name="ribbon" size={18} color={colors.brand} />}
            </View>
            <Text variant="subhead" color={colors.textSecondary}>{pro.role} · {pro.neighborhood}</Text>
            {pro.tesourinhaAlumni && (
              <View style={{ marginTop: spacing.sm }}>
                <Badge label="FORMADO(A) PELA TESOURINHA" icon="school" />
              </View>
            )}
            <View style={{ flexDirection: 'row', marginTop: spacing.lg, alignSelf: 'stretch' }}>
              {[
                [pro.rating.toFixed(1), 'avaliação', 'star'],
                [String(pro.reviewsCount), 'avaliações', 'chatbubble-ellipses'],
                [`${pro.yearsExperience} anos`, 'experiência', 'trophy'],
              ].map(([v, l, icon], i) => (
                <View key={l} style={{ flex: 1, alignItems: 'center', gap: 2, borderLeftWidth: i ? 1 : 0, borderLeftColor: colors.separator }}>
                  <Ionicons name={icon as never} size={16} color={colors.brand} />
                  <Text variant="headline">{v}</Text>
                  <Text variant="caption" color={colors.textSecondary}>{l}</Text>
                </View>
              ))}
            </View>
          </Card>

          <View>
            <SectionHeader title="Sobre" />
            <Text variant="callout" color={colors.textSecondary}>{pro.bio}</Text>
          </View>

          <View>
            <SectionHeader title="Serviços" />
            <ListGroup>
              {proServices.map((s) => (
                <ListRow
                  key={s.id}
                  left={<IconTile icon={s.icon} size={40} />}
                  title={s.name}
                  subtitle={`${formatDuration(s.durationMin)} · a partir de ${formatPrice(s.priceFrom)}`}
                  onPress={() => router.push({ pathname: '/book/[id]', params: { id: pro.id, serviceId: s.id } })}
                />
              ))}
            </ListGroup>
          </View>

          <View>
            <SectionHeader title="Avaliações" />
            <View style={{ gap: spacing.md }}>
              {pro.reviews.map((r) => (
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
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomBar>
        <Button title="Agendar horário" icon="calendar" onPress={() => router.push({ pathname: '/book/[id]', params: { id: pro.id } })} />
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  roundBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
});
