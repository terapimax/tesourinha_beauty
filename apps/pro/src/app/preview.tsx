import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/screen';
import { Avatar, Badge, Button, Card, IconTile, ListGroup, ListRow, SectionHeader, Text } from '@/components/ui';
import { findService } from '@/data/catalog';
import { formatDuration, formatPrice } from '@/lib/format';
import { usePro } from '@/store/pro-store';
import { colors, spacing } from '@/theme';

/** Prévia do perfil como aparece para o cliente no app Tesourinha Beauty. */
export default function Preview() {
  const insets = useSafeAreaInsets();
  const { profile, services, rating, reviews } = usePro();
  if (!profile) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + spacing.huge }}>
        <View style={{ height: 210 + insets.top, backgroundColor: colors.black }}>
          <LinearGradient colors={['rgba(255,106,19,0.55)', 'rgba(255,106,19,0.05)']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={{ position: 'absolute', top: insets.top + spacing.sm, left: spacing.xl, right: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <BackButton tone="glass" />
            <Badge label="PRÉVIA · VISÃO DO CLIENTE" tone="dark" icon="eye" />
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.xl, marginTop: -64, gap: spacing.xxl }}>
          <Card style={{ alignItems: 'center', paddingTop: 0 }}>
            <View style={{ marginTop: -48 }}>
              <Avatar name={profile.name} color={profile.avatarColor} size={96} ring />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md }}>
              <Text variant="title2">{profile.name}</Text>
              {profile.tesourinhaAlumni && <Ionicons name="ribbon" size={18} color={colors.brand} />}
            </View>
            <Text variant="subhead" color={colors.textSecondary}>{profile.role} · {profile.neighborhood}</Text>
            {profile.tesourinhaAlumni && (
              <View style={{ marginTop: spacing.sm }}>
                <Badge label="FORMADO(A) PELA TESOURINHA" icon="school" />
              </View>
            )}
            <View style={{ flexDirection: 'row', marginTop: spacing.lg, alignSelf: 'stretch' }}>
              {[
                [rating ? rating.toFixed(1) : 'Novo', 'avaliação', 'star'],
                [String(reviews.length), 'avaliações', 'chatbubble-ellipses'],
                [`${profile.yearsExperience} anos`, 'experiência', 'trophy'],
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
            <SectionHeader title="Sobre" action="Editar" onAction={() => router.push('/edit-profile')} />
            <Text variant="callout" color={profile.bio ? colors.textSecondary : colors.textTertiary}>
              {profile.bio || 'Você ainda não escreveu uma apresentação.'}
            </Text>
          </View>

          <View>
            <SectionHeader title="Serviços" action="Editar" onAction={() => router.push('/(tabs)/services')} />
            {services.length ? (
              <ListGroup>
                {services.map((o) => {
                  const s = findService(o.serviceId);
                  return (
                    <ListRow
                      key={o.serviceId}
                      left={<IconTile icon={s?.icon ?? 'cut-outline'} size={40} />}
                      title={s?.name ?? o.serviceId}
                      subtitle={`${formatDuration(o.durationMin)} · ${formatPrice(o.price)}`}
                    />
                  );
                })}
              </ListGroup>
            ) : (
              <Text variant="callout" color={colors.textTertiary}>Nenhum serviço ativo: clientes ainda não conseguem agendar com você.</Text>
            )}
          </View>

          <Button title="Agendar horário" icon="calendar" disabled />
          <Text variant="caption" color={colors.textSecondary} align="center" style={{ marginTop: -spacing.lg }}>
            O botão funciona apenas no app do cliente.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
