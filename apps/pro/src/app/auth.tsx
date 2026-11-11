import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Segmented, Toggle } from '@/components/pro';
import { ScissorsMark } from '@/components/logo';
import { Button, Chip, Field, Text } from '@/components/ui';
import { categories } from '@/data/catalog';
import type { CategoryId } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { usePro } from '@/store/pro-store';
import { colors, radius, spacing } from '@/theme';

const AVATAR_COLORS = ['#FF8A3D', '#E5560A', '#3A3A3C', '#1C1C1E', '#C2410C'];

export default function Auth() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<'login' | 'signup'>(params.mode === 'login' ? 'login' : 'signup');
  const { signInDemo, signUp } = usePro();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [years, setYears] = useState('');
  const [alumni, setAlumni] = useState(false);
  const [cats, setCats] = useState<CategoryId[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';
  const toggleCat = (id: CategoryId) => setCats((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const fail = (msg: string) => {
    haptic.warning();
    setError(msg);
  };

  const submit = () => {
    if (!email.includes('@') || password.length < 6) return fail('Informe e-mail válido e senha com 6+ caracteres.');
    if (isSignup) {
      if (name.trim().length < 2) return fail('Informe seu nome completo.');
      if (phone.replace(/\D/g, '').length < 10) return fail('Informe um celular com DDD para os clientes falarem com você.');
      if (role.trim().length < 3) return fail('Conte qual é a sua especialidade (ex.: Cabeleireira).');
      if (!cats.length) return fail('Escolha ao menos uma área de atendimento.');
    }
    setError('');
    setLoading(true);
    // MVP: autenticação local. Substituir por supabase.auth.signUp / signInWithPassword.
    setTimeout(() => {
      if (isSignup) {
        signUp({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone,
          role: role.trim(),
          bio: '',
          neighborhood: neighborhood.trim() || 'São Paulo, SP',
          yearsExperience: Number(years.replace(/\D/g, '')) || 0,
          tesourinhaAlumni: alumni,
          categoryIds: cats,
          avatarColor: AVATAR_COLORS[name.length % AVATAR_COLORS.length]!,
        });
        haptic.success();
        router.dismissAll();
        router.replace('/pending');
      } else {
        signInDemo(email.trim().toLowerCase());
        haptic.success();
        router.dismissAll();
        router.replace('/(tabs)');
      }
    }, 600);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.xxl, paddingTop: Platform.OS === 'ios' ? spacing.xl : insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xxl }}
        keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ScissorsMark size={44} />
          <Pressable onPress={() => router.back()} hitSlop={12} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <Text variant="largeTitle" style={{ marginTop: spacing.xxl }}>{isSignup ? 'Atenda pelo Tesourinha' : 'Bem-vindo de volta'}</Text>
        <Text variant="body" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
          {isSignup ? 'Cadastre-se como profissional. A Associação analisa seu perfil antes de ele aparecer para os clientes.' : 'Entre para ver sua agenda e seus atendimentos.'}
        </Text>

        <View style={{ marginTop: spacing.xxl }}>
          <Segmented options={[['signup', 'Cadastrar'], ['login', 'Entrar']] as const} value={mode} onChange={(m) => { setMode(m); setError(''); }} />
        </View>

        <View style={{ gap: spacing.lg, marginTop: spacing.xxl }}>
          {isSignup && <Field label="Nome completo" icon="person-outline" placeholder="Como aparece para os clientes" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />}
          <Field label="E-mail" icon="mail-outline" placeholder="voce@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
          {isSignup && <Field label="Celular (WhatsApp)" icon="logo-whatsapp" placeholder="(11) 90000-0000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" textContentType="telephoneNumber" />}
          <Field label="Senha" icon="lock-closed-outline" placeholder="Mínimo de 6 caracteres" value={password} onChangeText={setPassword} secureTextEntry textContentType={isSignup ? 'newPassword' : 'password'} />

          {isSignup && (
            <>
              <Field label="Especialidade" icon="cut-outline" placeholder="Ex.: Cabeleireira, Barbeiro, Manicure" value={role} onChangeText={setRole} />
              <View style={{ gap: 6 }}>
                <Text variant="footnote" color={colors.textSecondary} weight="600" style={{ marginLeft: 4 }}>ÁREAS DE ATENDIMENTO</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {categories.map((c) => (
                    <Chip key={c.id} label={c.name} icon={c.icon} active={cats.includes(c.id)} onPress={() => toggleCat(c.id)} />
                  ))}
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <View style={{ flex: 2 }}>
                  <Field label="Bairro" icon="location-outline" placeholder="Ex.: Santo Amaro" value={neighborhood} onChangeText={setNeighborhood} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Anos de exp." placeholder="0" value={years} onChangeText={setYears} keyboardType="number-pad" maxLength={2} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.brandSoft, borderWidth: 1, borderColor: colors.brandSoftBorder }}>
                <Ionicons name="school" size={22} color={colors.brand} />
                <View style={{ flex: 1 }}>
                  <Text variant="subhead" weight="600">Fiz curso na Associação Tesourinha</Text>
                  <Text variant="caption" color={colors.textSecondary}>Seu perfil ganha o selo de formado(a).</Text>
                </View>
                <Toggle value={alumni} onChange={setAlumni} label="Fiz curso na Associação Tesourinha" />
              </View>
            </>
          )}
        </View>

        {!!error && (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.dangerSoft }}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text variant="footnote" color={colors.danger} style={{ flex: 1 }}>{error}</Text>
          </View>
        )}

        <Button title={isSignup ? 'Enviar cadastro' : 'Entrar'} onPress={submit} loading={loading} style={{ marginTop: spacing.xxl }} />

        {!isSignup && (
          <View style={{ marginTop: spacing.xl, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, flexDirection: 'row', gap: spacing.sm }}>
            <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
            <Text variant="footnote" color={colors.textSecondary} style={{ flex: 1 }}>
              Versão de demonstração: qualquer e-mail e senha entram na conta da profissional Ana Paula, com agenda de exemplo.
            </Text>
          </View>
        )}

        <Text variant="caption" color={colors.textSecondary} align="center" style={{ marginTop: spacing.xxl }}>
          Ao continuar você concorda com os Termos de Uso e a Política de Privacidade.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
