import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BottomBar, Screen, ScreenHeader, Sheet } from '@/components/screen';
import { Avatar, Button, Field } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { spacing } from '@/theme';

export default function Account() {
  const { user, updateUser } = useApp();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  return (
    <Screen>
      <ScreenHeader title="Meus dados" />
      <Sheet contentStyle={{ gap: spacing.lg, paddingBottom: 160 }}>
        <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
          <Avatar name={name || 'T B'} size={88} />
        </View>
        <Field label="Nome" value={name} onChangeText={setName} icon="person-outline" />
        <Field label="E-mail" value={user?.email} editable={false} icon="mail-outline" />
        <Field label="Celular" value={phone} onChangeText={setPhone} keyboardType="phone-pad" icon="call-outline" />
        <Field label="Cidade" value={city} onChangeText={setCity} icon="location-outline" />
      </Sheet>
      <BottomBar>
        <Button title="Salvar alterações" onPress={() => { updateUser({ name, phone, city }); haptic.success(); router.back(); }} />
      </BottomBar>
    </Screen>
  );
}
