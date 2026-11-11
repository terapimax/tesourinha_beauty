import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScissorsMark } from '@/components/logo';
import { Button, Field, Text } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { colors, radius, spacing } from '@/theme';

export default function Auth() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<'login' | 'signup'>(params.mode === 'login' ? 'login' : 'signup');
  const { signIn } = useApp();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';

  const submit = () => {
    if (!email.includes('@') || password.length < 6 || (isSignup && name.trim().length < 2)) {
      haptic.warning();
      setError(isSignup ? 'Preencha nome, e-mail válido e senha com 6+ caracteres.' : 'Informe e-mail válido e senha com 6+ caracteres.');
      return;
    }
    setError('');
    setLoading(true);
    // MVP: autenticação local. Substituir por supabase.auth.signUp / signInWithPassword.
    setTimeout(() => {
      signIn({
        name: isSignup ? name.trim() : email.split('@')[0]!.replace(/^\w/, (c) => c.toUpperCase()),
        email: email.trim().toLowerCase(),
        phone,
        city: 'São Paulo, SP',
      });
      haptic.success();
      router.dismissAll();
      router.replace('/(tabs)');
    }, 600);
  };

  // MVP: login social simulado. Em produção: Sign in with Apple / Google via Supabase Auth.
  const social = () => {
    signIn({ name: 'Cliente Tesourinha', email: 'cliente@tesourinha.app', phone: '', city: 'São Paulo, SP' });
    haptic.success();
    router.dismissAll();
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: spacing.xxl, paddingTop: Platform.OS === 'ios' ? spacing.xl : insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xxl }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ScissorsMark size={44} />
          <Pressable onPress={() => router.back()} hitSlop={12} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <Text variant="largeTitle" style={{ marginTop: spacing.xxl }}>{isSignup ? 'Crie sua conta' : 'Bem-vindo de volta'}</Text>
        <Text variant="body" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
          {isSignup ? 'Agende serviços, faça cursos gratuitos e encontre oportunidades.' : 'Entre para ver seus agendamentos, cursos e vagas.'}
        </Text>

        {/* Segmented control */}
        <View style={{ flexDirection: 'row', backgroundColor: colors.border, borderRadius: radius.md, padding: 3, marginTop: spacing.xxl }}>
          {(['signup', 'login'] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => { haptic.selection(); setMode(m); setError(''); }}
              style={{ flex: 1, paddingVertical: 8, borderRadius: radius.sm + 1, alignItems: 'center', backgroundColor: mode === m ? colors.surface : 'transparent' }}>
              <Text variant="subhead" weight="600">{m === 'signup' ? 'Criar conta' : 'Entrar'}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: spacing.lg, marginTop: spacing.xxl }}>
          {isSignup && <Field label="Nome completo" icon="person-outline" placeholder="Como podemos te chamar?" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />}
          <Field label="E-mail" icon="mail-outline" placeholder="voce@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
          {isSignup && <Field label="Celular" icon="call-outline" placeholder="(11) 90000-0000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" textContentType="telephoneNumber" />}
          <Field label="Senha" icon="lock-closed-outline" placeholder="Mínimo de 6 caracteres" value={password} onChangeText={setPassword} secureTextEntry textContentType={isSignup ? 'newPassword' : 'password'} />
        </View>

        {!!error && (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.dangerSoft }}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text variant="footnote" color={colors.danger} style={{ flex: 1 }}>{error}</Text>
          </View>
        )}

        <Button title={isSignup ? 'Criar conta' : 'Entrar'} onPress={submit} loading={loading} style={{ marginTop: spacing.xxl }} />

        {!isSignup && (
          <Pressable style={{ alignSelf: 'center', marginTop: spacing.lg }}>
            <Text variant="subhead" color={colors.brand} weight="600">Esqueci minha senha</Text>
          </Pressable>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.xxl }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text variant="footnote" color={colors.textSecondary}>ou continue com</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>
        <View style={{ gap: spacing.md }}>
          <Button title="Continuar com Apple" variant="dark" icon="logo-apple" onPress={social} />
          <Button title="Continuar com Google" variant="outline" icon="logo-google" onPress={social} />
        </View>

        <Text variant="caption" color={colors.textSecondary} align="center" style={{ marginTop: spacing.xxl }}>
          Ao continuar você concorda com os Termos de Uso e a Política de Privacidade.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
