import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/logo';
import { Avatar, Badge, ListGroup, ListRow, PressableScale, Text } from '@/components/ui';
import { association } from '@/data/catalog';
import { confirm, notify } from '@/lib/confirm';
import { WEEKDAY_ABBR } from '@/pro/time';
import { usePro } from '@/store/pro-store';
import { colors, radius, spacing } from '@/theme';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { profile, rating, reviews, services, week, timeOff, signOut } = usePro();
  if (!profile) return null;
  const days = week.filter((d) => d.enabled).map((d) => WEEKDAY_ABBR[d.weekday]).join(', ');
  const missingBio = !profile.bio.trim();

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>
        <View style={{ backgroundColor: colors.black, paddingTop: insets.top + spacing.xl, paddingHorizontal: spacing.xl, paddingBottom: spacing.huge + spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size="sm" layout="inline" tagline={false} />
          <Badge label="PRO" tone="brand" />
        </View>

        <View style={{ marginTop: -spacing.huge, paddingHorizontal: spacing.xl, gap: spacing.xxl }}>
          <PressableScale onPress={() => router.push('/edit-profile')} scaleTo={0.98} style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Avatar name={profile.name} color={profile.avatarColor} size={60} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text variant="title3" weight="700" numberOfLines={1} style={{ flexShrink: 1 }}>{profile.name}</Text>
                {profile.tesourinhaAlumni && <Ionicons name="ribbon" size={16} color={colors.brand} />}
              </View>
              <Text variant="footnote" color={colors.textSecondary}>{profile.role} · {profile.neighborhood}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </PressableScale>

          <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.xl, paddingVertical: spacing.lg }}>
            {[
              [rating ? rating.toFixed(1) : '—', 'Avaliação'],
              [String(reviews.length), 'Avaliações'],
              [String(services.length), 'Serviços'],
            ].map(([n, label], i) => (
              <View key={label} style={{ flex: 1, alignItems: 'center', borderLeftWidth: i ? 1 : 0, borderLeftColor: colors.separator }}>
                <Text variant="title2" color={colors.brand}>{n}</Text>
                <Text variant="caption" color={colors.textSecondary}>{label}</Text>
              </View>
            ))}
          </View>

          {missingBio && (
            <PressableScale onPress={() => router.push('/edit-profile')} scaleTo={0.98} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center', padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.brandSoft, borderWidth: 1, borderColor: colors.brandSoftBorder }}>
              <Ionicons name="create-outline" size={22} color={colors.brand} />
              <Text variant="subhead" style={{ flex: 1 }}>Escreva uma apresentação: perfis com bio recebem mais agendamentos.</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.brand} />
            </PressableScale>
          )}

          <ListGroup title="Meu negócio">
            <ListRow icon="eye-outline" title="Ver meu perfil público" subtitle="Como os clientes te veem no app" onPress={() => router.push('/preview')} />
            <ListRow icon="time-outline" title="Horários e folgas" subtitle={days || 'Nenhum dia de atendimento'} value={timeOff.length ? `${timeOff.length} bloqueio${timeOff.length > 1 ? 's' : ''}` : undefined} onPress={() => router.push('/hours')} />
            <ListRow icon="cut-outline" title="Serviços e preços" value={String(services.length)} onPress={() => router.push('/(tabs)/services')} />
            <ListRow icon="star-outline" title="Avaliações" value={String(reviews.length)} onPress={() => router.push('/reviews')} />
          </ListGroup>

          <ListGroup title="Conta">
            <ListRow icon="person-outline" title="Meus dados" onPress={() => router.push('/edit-profile')} />
            <ListRow icon="notifications-outline" title="Notificações" subtitle="Novo agendamento, cancelamento e lembretes" onPress={() => notify('Em breve', 'As notificações chegam quando o app for ligado ao servidor.')} />
            <ListRow icon="help-circle-outline" title="Ajuda" onPress={() => notify('Ajuda', `Fale com a ${association.name} pelo WhatsApp ou e-mail informados no app do cliente.`)} />
          </ListGroup>

          <PressableScale scaleTo={0.98} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center', padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.brandSoft, borderWidth: 1, borderColor: colors.brandSoftBorder }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="school-outline" size={26} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="headline" weight="800">{association.name.toUpperCase()}</Text>
              <Text variant="footnote" color={colors.textSecondary}>Cursos gratuitos de aperfeiçoamento estão no app Tesourinha Beauty.</Text>
            </View>
          </PressableScale>

          <ListGroup>
            <ListRow icon="log-out-outline" title="Sair" destructive onPress={() => confirm('Sair da conta?', 'Você precisará entrar novamente para ver sua agenda.', 'Sair', () => { signOut(); router.replace('/welcome'); })} />
          </ListGroup>

          <Text variant="caption" color={colors.textTertiary} align="center">Tesourinha Pro · versão 1.0 (MVP)</Text>
        </View>
      </ScrollView>
    </View>
  );
}
