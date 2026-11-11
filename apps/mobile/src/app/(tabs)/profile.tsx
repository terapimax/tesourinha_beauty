import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/logo';
import { Avatar, ListGroup, ListRow, PressableScale, Text } from '@/components/ui';
import { association } from '@/data/catalog';
import { confirm } from '@/lib/confirm';
import { useApp } from '@/store/app-store';
import { colors, radius, spacing } from '@/theme';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { user, bookings, favorites, enrollments, applications, resume, signOut } = useApp();
  const upcoming = bookings.filter((b) => b.status === 'confirmado').length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>
        <View style={{ backgroundColor: colors.black, paddingTop: insets.top + spacing.xl, paddingHorizontal: spacing.xl, paddingBottom: spacing.huge + spacing.xl }}>
          <Logo size="sm" layout="inline" />
        </View>

        <View style={{ marginTop: -spacing.huge, paddingHorizontal: spacing.xl, gap: spacing.xxl }}>
          {/* Cartão do usuário */}
          <PressableScale onPress={() => router.push('/account')} scaleTo={0.98} style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Avatar name={user?.name ?? ''} size={60} />
            <View style={{ flex: 1 }}>
              <Text variant="title3" weight="700">{user?.name}</Text>
              <Text variant="footnote" color={colors.textSecondary}>{user?.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </PressableScale>

          {/* Números */}
          <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.xl, paddingVertical: spacing.lg }}>
            {[
              [upcoming, 'Agendados'],
              [enrollments.length, 'Cursos'],
              [applications.length, 'Candidaturas'],
            ].map(([n, label], i) => (
              <View key={label} style={{ flex: 1, alignItems: 'center', borderLeftWidth: i ? 1 : 0, borderLeftColor: colors.separator }}>
                <Text variant="title2" color={colors.brand}>{n}</Text>
                <Text variant="caption" color={colors.textSecondary}>{label}</Text>
              </View>
            ))}
          </View>

          <ListGroup>
            <ListRow icon="calendar-outline" title="Meus agendamentos" value={upcoming ? String(upcoming) : undefined} onPress={() => router.push('/(tabs)/bookings')} />
            <ListRow icon="heart-outline" title="Meus favoritos" value={favorites.length ? String(favorites.length) : undefined} onPress={() => router.push('/(tabs)/favorites')} />
            <ListRow icon="person-outline" title="Meus dados" onPress={() => router.push('/account')} />
          </ListGroup>

          <ListGroup title="Carreira">
            <ListRow icon="school-outline" title="Meus cursos" value={enrollments.length ? String(enrollments.length) : undefined} onPress={() => router.push({ pathname: '/my/[kind]', params: { kind: 'courses' } })} />
            <ListRow icon="briefcase-outline" title="Minhas vagas" value={applications.length ? String(applications.length) : undefined} onPress={() => router.push({ pathname: '/my/[kind]', params: { kind: 'jobs' } })} />
            <ListRow icon="document-text-outline" title="Meu currículo" value={resume ? 'Completo' : 'Cadastrar'} onPress={() => router.push('/resume')} />
          </ListGroup>

          <ListGroup title="App">
            <ListRow icon="notifications-outline" title="Notificações" onPress={() => router.push('/settings')} />
            <ListRow icon="settings-outline" title="Configurações" onPress={() => router.push('/settings')} />
            <ListRow icon="help-circle-outline" title="Ajuda" onPress={() => router.push('/help')} />
          </ListGroup>

          {/* Associação */}
          <PressableScale onPress={() => router.push('/association')} scaleTo={0.98} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center', padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.brandSoft, borderWidth: 1, borderColor: colors.brandSoftBorder }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="heart-outline" size={26} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="headline" weight="800">{association.name.toUpperCase()}</Text>
              <Text variant="footnote" color={colors.textSecondary}>{association.tagline}</Text>
            </View>
          </PressableScale>

          <ListGroup>
            <ListRow icon="log-out-outline" title="Sair" destructive onPress={() => confirm('Sair da conta?', 'Você precisará entrar novamente para ver seus agendamentos.', 'Sair', () => { signOut(); router.replace('/welcome'); })} />
          </ListGroup>

          <Text variant="caption" color={colors.textTertiary} align="center">Tesourinha Beauty · versão 1.0 (MVP)</Text>
        </View>
      </ScrollView>
    </View>
  );
}
