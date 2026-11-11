import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { JobRow } from '@/components/cards';
import { Screen, ScreenHeader, Sheet } from '@/components/screen';
import { Button, Chip, IconTile, Text } from '@/components/ui';
import { jobs } from '@/data/catalog';
import type { JobType } from '@/data/types';
import { useApp } from '@/store/app-store';
import { colors, radius, spacing } from '@/theme';

const TYPES: (JobType | 'Todas')[] = ['Todas', 'Tempo integral', 'Meio período', 'Freelance', 'Comissionado'];

export default function Jobs() {
  const [type, setType] = useState<JobType | 'Todas'>('Todas');
  const { resume } = useApp();
  const list = jobs.filter((j) => type === 'Todas' || j.type === type);
  return (
    <Screen>
      <ScreenHeader title="Vagas de emprego" subtitle="Conectando talentos e oportunidades" />
      <Sheet contentStyle={{ gap: spacing.md, paddingTop: spacing.xl }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.xl }} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.sm }}>
          {TYPES.map((t) => <Chip key={t} label={t} active={type === t} onPress={() => setType(t)} />)}
        </ScrollView>
        {list.map((j) => <JobRow key={j.id} job={j} />)}
        {list.length === 0 && <Text variant="subhead" color={colors.textSecondary} align="center" style={{ padding: spacing.xxl }}>Nenhuma vaga nesse formato no momento.</Text>}

        <View style={{ marginTop: spacing.md, padding: spacing.xl, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.brandSoftBorder, gap: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
            <IconTile icon="document-text-outline" size={48} />
            <View style={{ flex: 1 }}>
              <Text variant="headline">{resume ? 'Seu currículo está ativo' : 'Cadastre seu currículo'}</Text>
              <Text variant="footnote" color={colors.textSecondary}>{resume ? 'Salões e parceiros já podem encontrar você.' : 'E seja encontrado por salões e parceiros.'}</Text>
            </View>
          </View>
          <Button title={resume ? 'Editar currículo' : 'Cadastrar agora'} variant={resume ? 'secondary' : 'primary'} size="md" onPress={() => router.push('/resume')} />
        </View>
      </Sheet>
    </Screen>
  );
}
