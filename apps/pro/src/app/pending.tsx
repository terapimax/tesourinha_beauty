import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/logo';
import { Button, Card, Text } from '@/components/ui';
import { confirm } from '@/lib/confirm';
import { haptic } from '@/lib/haptics';
import { usePro } from '@/store/pro-store';
import { colors, radius, spacing } from '@/theme';

export default function Pending() {
  const insets = useSafeAreaInsets();
  const { profile, approval, approve, signOut } = usePro();
  if (!profile) return <Redirect href="/welcome" />;
  if (approval === 'aprovado') return <Redirect href="/(tabs)" />;

  const steps = [
    { done: true, title: 'Cadastro enviado', text: 'Recebemos seus dados.' },
    { done: false, title: 'Análise da Associação', text: 'Conferimos suas informações em até 2 dias úteis.' },
    { done: false, title: 'Perfil publicado', text: 'Você aparece para os clientes e começa a receber agendamentos.' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.xxl, paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.xxl, gap: spacing.xxl }}>
        <Logo size="sm" layout="inline" tagline={false} />

        <View style={{ alignItems: 'center', gap: spacing.md, marginTop: spacing.lg }}>
          <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(255,106,19,0.16)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="hourglass-outline" size={40} color={colors.brand} />
          </View>
          <Text variant="title1" color={colors.white} align="center">Cadastro em análise</Text>
          <Text variant="callout" color={colors.textOnDarkSecondary} align="center">
            Obrigado, {profile.name.split(' ')[0]}! Avisaremos por e-mail e WhatsApp assim que seu perfil for aprovado.
          </Text>
        </View>

        <Card style={{ gap: spacing.lg }}>
          {steps.map((s, i) => (
            <View key={s.title} style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: s.done ? colors.success : i === 1 ? colors.brandSoft : colors.surfaceMuted }}>
                  {s.done ? <Ionicons name="checkmark" size={16} color={colors.white} /> : <Text variant="footnote" weight="700" color={i === 1 ? colors.brand : colors.textTertiary}>{i + 1}</Text>}
                </View>
                {i < steps.length - 1 && <View style={{ width: 2, flex: 1, minHeight: 18, marginTop: 4, backgroundColor: colors.border }} />}
              </View>
              <View style={{ flex: 1, paddingBottom: 4 }}>
                <Text variant="headline">{s.title}</Text>
                <Text variant="footnote" color={colors.textSecondary}>{s.text}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={{ padding: spacing.lg, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.06)', gap: 4 }}>
          <Text variant="subhead" weight="600" color={colors.white}>Enquanto isso</Text>
          <Text variant="footnote" color={colors.textOnDarkSecondary}>
            Separe fotos dos seus trabalhos e pense nos preços dos seus serviços. Depois da aprovação você configura tudo em poucos minutos.
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <Button
            title="Simular aprovação (demo)"
            icon="checkmark-circle"
            onPress={() => {
              approve();
              haptic.success();
              router.replace('/(tabs)');
            }}
          />
          <Button
            title="Sair"
            variant="outlineLight"
            onPress={() => confirm('Sair?', 'Seu cadastro continua em análise.', 'Sair', () => { signOut(); router.replace('/welcome'); })}
          />
        </View>
      </ScrollView>
    </View>
  );
}
