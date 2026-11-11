import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { BottomBar, Screen, ScreenHeader, Sheet } from '@/components/screen';
import { Avatar, Button, Chip, Field, Text } from '@/components/ui';
import { categories } from '@/data/catalog';
import type { CategoryId } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { usePro } from '@/store/pro-store';
import { colors, spacing } from '@/theme';

export default function EditProfile() {
  const { profile, updateProfile } = usePro();
  const [name, setName] = useState(profile?.name ?? '');
  const [role, setRole] = useState(profile?.role ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [neighborhood, setNeighborhood] = useState(profile?.neighborhood ?? '');
  const [years, setYears] = useState(String(profile?.yearsExperience ?? ''));
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [cats, setCats] = useState<CategoryId[]>(profile?.categoryIds ?? []);
  if (!profile) return null;

  const valid = name.trim().length >= 2 && role.trim().length >= 3 && cats.length > 0;

  const save = () => {
    updateProfile({
      name: name.trim(),
      role: role.trim(),
      phone,
      neighborhood: neighborhood.trim(),
      yearsExperience: Number(years.replace(/\D/g, '')) || 0,
      bio: bio.trim(),
      categoryIds: cats,
    });
    haptic.success();
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader title="Meus dados" subtitle={profile.email} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Sheet contentStyle={{ gap: spacing.lg, paddingBottom: 200 }}>
          <View style={{ alignItems: 'center', marginBottom: spacing.sm }}>
            <Avatar name={name || profile.name} color={profile.avatarColor} size={88} ring />
            <Text variant="footnote" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>Foto de perfil: em breve pelo app</Text>
          </View>
          <Field label="Nome" icon="person-outline" value={name} onChangeText={setName} />
          <Field label="Especialidade" icon="cut-outline" value={role} onChangeText={setRole} />
          <Field label="Celular (WhatsApp)" icon="logo-whatsapp" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 2 }}>
              <Field label="Bairro" icon="location-outline" value={neighborhood} onChangeText={setNeighborhood} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Anos de exp." value={years} onChangeText={setYears} keyboardType="number-pad" maxLength={2} />
            </View>
          </View>
          <Field
            label="Apresentação"
            placeholder="Conte sua experiência, técnicas preferidas e o que torna seu atendimento especial."
            value={bio}
            onChangeText={setBio}
            multiline
            maxLength={400}
          />
          <Text variant="caption" color={colors.textTertiary} align="right" style={{ marginTop: -spacing.sm }}>{bio.length}/400</Text>
          <View style={{ gap: 6 }}>
            <Text variant="footnote" color={colors.textSecondary} weight="600" style={{ marginLeft: 4 }}>ÁREAS DE ATENDIMENTO</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {categories.map((c) => (
                <Chip key={c.id} label={c.name} icon={c.icon} active={cats.includes(c.id)} onPress={() => setCats((s) => (s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id]))} />
              ))}
            </View>
          </View>
        </Sheet>
      </KeyboardAvoidingView>
      <BottomBar>
        <Button title="Salvar" icon="checkmark" onPress={save} disabled={!valid} />
      </BottomBar>
    </Screen>
  );
}
