import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookingCard } from '@/components/cards';
import { ScissorsMark } from '@/components/logo';
import { Avatar, Badge, Button, IconTile, PressableScale, Rating, SectionHeader, Text } from '@/components/ui';
import { association, categories, courses, professionals } from '@/data/catalog';
import type { IconName } from '@/data/types';
import { greeting } from '@/lib/format';
import { useApp } from '@/store/app-store';
import { colors, gradients, radius, shadow, spacing } from '@/theme';

const QUICK: { icon: IconName; title: string; subtitle: string; href: string }[] = [
  { icon: 'calendar-outline', title: 'Agendar', subtitle: 'serviço', href: '/services' },
  { icon: 'people-outline', title: 'Encontrar', subtitle: 'profissionais', href: '/(tabs)/explore' },
  { icon: 'school-outline', title: 'Nossos', subtitle: 'cursos', href: '/courses' },
  { icon: 'briefcase-outline', title: 'Vagas de', subtitle: 'emprego', href: '/jobs' },
];

export default function Home() {
  const insets = useSafeAreaInsets();
  const { user, bookings } = useApp();
  const next = bookings.find((b) => b.status === 'confirmado');
  const firstName = user?.name.split(' ')[0] ?? '';
  const featured = [...professionals].sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount).slice(0, 6);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>
        {/* Cabeçalho laranja */}
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text variant="subhead" color="rgba(255,255,255,0.85)">{greeting()},</Text>
              <Text variant="title1" color={colors.white}>Olá, {firstName}!</Text>
            </View>
            <PressableScale onPress={() => router.push('/(tabs)/profile')}>
              <View style={{ borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)', borderRadius: 24 }}>
                <Avatar name={user?.name ?? 'T B'} color={colors.black} size={44} />
              </View>
            </PressableScale>
          </View>
          <Text variant="subhead" color="rgba(255,255,255,0.9)" style={{ marginTop: 2 }}>Beleza que transforma vidas</Text>

          <PressableScale onPress={() => router.push('/(tabs)/explore')} scaleTo={0.98} style={[styles.search, shadow.card]}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <Text variant="callout" color={colors.textTertiary}>Buscar serviços ou profissionais</Text>
          </PressableScale>
        </LinearGradient>

        {/* Categorias */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.lg, paddingTop: spacing.xl }}>
          {categories.map((c) => (
            <PressableScale key={c.id} onPress={() => router.push({ pathname: '/professionals', params: { category: c.id } })} style={{ alignItems: 'center', gap: 8, width: 64 }}>
              <View style={styles.catCircle}>
                <Ionicons name={c.icon} size={26} color={colors.white} />
              </View>
              <Text variant="caption" weight="600">{c.name}</Text>
            </PressableScale>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: spacing.xl, gap: spacing.xxl, marginTop: spacing.xl }}>
          {/* Banner */}
          <PressableScale onPress={() => router.push('/services')} scaleTo={0.98} style={[styles.banner, shadow.floating]}>
            <LinearGradient colors={['#1C1C1E', '#0B0B0C']} style={StyleSheet.absoluteFill} />
            <LinearGradient colors={['rgba(255,106,19,0.35)', 'transparent']} start={{ x: 1, y: 0 }} end={{ x: 0.3, y: 0.8 }} style={StyleSheet.absoluteFill} />
            <View style={{ position: 'absolute', right: -18, bottom: -10, opacity: 0.95, transform: [{ rotate: '-12deg' }] }}>
              <ScissorsMark size={150} />
            </View>
            <View style={{ padding: spacing.xl, gap: 4, maxWidth: '68%' }}>
              <Badge label="NOVIDADE" tone="brand" />
              <Text variant="title2" color={colors.white} style={{ marginTop: 8 }}>Realce sua beleza,</Text>
              <Text variant="title2" color={colors.brand}>transforme sua história</Text>
              <Button title="Agendar agora" size="sm" full={false} iconRight="arrow-forward" onPress={() => router.push('/services')} style={{ marginTop: spacing.md }} />
            </View>
          </PressableScale>

          {/* Atalhos */}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {QUICK.map((q) => (
              <PressableScale key={q.title} onPress={() => router.push(q.href as never)} style={styles.quick}>
                <IconTile icon={q.icon} size={42} />
                <View style={{ alignItems: 'center' }}>
                  <Text variant="caption" weight="700" align="center">{q.title}</Text>
                  <Text variant="caption" color={colors.textSecondary} align="center">{q.subtitle}</Text>
                </View>
              </PressableScale>
            ))}
          </View>

          {/* Próximo agendamento */}
          {next && (
            <View>
              <SectionHeader title="Seu próximo horário" action="Ver agenda" onAction={() => router.push('/(tabs)/bookings')} />
              <BookingCard booking={next} />
            </View>
          )}

          {/* Profissionais */}
          <View>
            <SectionHeader title="Profissionais em destaque" action="Ver todos" onAction={() => router.push('/(tabs)/explore')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.xl }} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.md }}>
              {featured.map((p) => (
                <PressableScale key={p.id} onPress={() => router.push({ pathname: '/professional/[id]', params: { id: p.id } })} style={styles.proCard}>
                  <Avatar name={p.name} color={p.avatarColor} uri={p.imageUrl} size={72} />
                  <Text variant="headline" numberOfLines={1} style={{ marginTop: spacing.md }}>{p.name}</Text>
                  <Text variant="footnote" color={colors.textSecondary} numberOfLines={1}>{p.role}</Text>
                  <View style={{ marginTop: 6 }}>
                    <Rating value={p.rating} count={p.reviewsCount} />
                  </View>
                </PressableScale>
              ))}
            </ScrollView>
          </View>

          {/* Cursos */}
          <View>
            <SectionHeader title="Cursos gratuitos" action="Ver todos" onAction={() => router.push('/courses')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.xl }} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.md }}>
              {courses.slice(0, 5).map((c) => (
                <PressableScale key={c.id} onPress={() => router.push({ pathname: '/courses/[id]', params: { id: c.id } })} style={styles.courseCard}>
                  <View style={styles.courseArt}>
                    <LinearGradient colors={['#2A2A2D', '#0B0B0C']} style={StyleSheet.absoluteFill} />
                    <Ionicons name={c.icon} size={40} color={colors.brand} />
                    <View style={{ position: 'absolute', top: 10, left: 10 }}>
                      <Badge label="GRATUITO" />
                    </View>
                  </View>
                  <View style={{ padding: spacing.md, gap: 2 }}>
                    <Text variant="headline" numberOfLines={1}>{c.title}</Text>
                    <Text variant="footnote" color={colors.textSecondary} numberOfLines={1}>{c.durationHours}h · {c.modality}</Text>
                  </View>
                </PressableScale>
              ))}
            </ScrollView>
          </View>

          {/* Associação */}
          <PressableScale onPress={() => router.push('/association')} scaleTo={0.98} style={styles.assoc}>
            <View style={styles.assocIcon}>
              <Ionicons name="heart-outline" size={26} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="headline" weight="800">{association.name.toUpperCase()}</Text>
              <Text variant="footnote" color={colors.textSecondary}>{association.tagline}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.brand} />
          </PressableScale>
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
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    marginTop: spacing.lg,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  catCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' },
  banner: { borderRadius: radius.xxl, overflow: 'hidden', minHeight: 190, justifyContent: 'center', backgroundColor: colors.black },
  quick: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: spacing.lg, paddingHorizontal: 4, backgroundColor: colors.surface, borderRadius: radius.xl, ...shadow.card },
  proCard: { width: 150, padding: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.xl, alignItems: 'flex-start', ...shadow.card },
  courseCard: { width: 210, backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...shadow.card },
  courseArt: { height: 110, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  assoc: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.brandSoft, borderWidth: 1, borderColor: colors.brandSoftBorder },
  assocIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
});
