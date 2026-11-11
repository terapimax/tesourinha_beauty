import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { BottomBar, Screen, ScreenHeader, Sheet } from '@/components/screen';
import { Button, Chip, Field, Text } from '@/components/ui';
import type { Resume } from '@/data/types';
import { notify } from '@/lib/confirm';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { colors, spacing } from '@/theme';

const ROLES = ['Cabeleireiro(a)', 'Barbeiro(a)', 'Manicure', 'Esteticista', 'Maquiador(a)', 'Recepcionista'];
const EXPERIENCE = ['Sem experiência', 'Até 1 ano', '1 a 3 anos', '3 a 5 anos', '5+ anos'];

export default function ResumeScreen() {
  const { resume, user, saveResume } = useApp();
  const [form, setForm] = useState<Resume>(
    resume ?? { fullName: user?.name ?? '', phone: user?.phone ?? '', email: user?.email ?? '', city: user?.city ?? '', role: '', experience: '', about: '' },
  );
  const set = (k: keyof Resume) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.fullName.trim() && form.phone.trim() && form.role && form.experience;

  return (
    <Screen>
      <ScreenHeader title="Meu currículo" subtitle="Seja encontrado por salões e parceiros" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Sheet contentStyle={{ gap: spacing.lg, paddingBottom: 160 }}>
          <Field label="Nome completo" value={form.fullName} onChangeText={set('fullName')} icon="person-outline" />
          <Field label="Celular / WhatsApp" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" icon="logo-whatsapp" placeholder="(11) 90000-0000" />
          <Field label="E-mail" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" icon="mail-outline" />
          <Field label="Cidade / bairro" value={form.city} onChangeText={set('city')} icon="location-outline" />

          <View style={{ gap: spacing.sm }}>
            <Text variant="footnote" color={colors.textSecondary} weight="600" style={{ marginLeft: 4 }}>ÁREA DE ATUAÇÃO</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {ROLES.map((r) => <Chip key={r} label={r} active={form.role === r} onPress={() => set('role')(r)} />)}
            </View>
          </View>
          <View style={{ gap: spacing.sm }}>
            <Text variant="footnote" color={colors.textSecondary} weight="600" style={{ marginLeft: 4 }}>EXPERIÊNCIA</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {EXPERIENCE.map((r) => <Chip key={r} label={r} active={form.experience === r} onPress={() => set('experience')(r)} />)}
            </View>
          </View>
          <Field label="Sobre você" value={form.about} onChangeText={set('about')} multiline placeholder="Conte suas especialidades, cursos e onde já trabalhou." />
        </Sheet>
      </KeyboardAvoidingView>
      <BottomBar>
        <Button
          title="Salvar currículo"
          disabled={!valid}
          onPress={() => {
            saveResume(form);
            haptic.success();
            notify('Currículo salvo!', 'Agora você já pode se candidatar às vagas.');
            router.back();
          }}
        />
      </BottomBar>
    </Screen>
  );
}
