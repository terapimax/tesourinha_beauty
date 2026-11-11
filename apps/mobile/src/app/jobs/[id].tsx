import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { BottomBar, Screen, ScreenHeader, Sheet } from '@/components/screen';
import { Badge, Button, Card, IconTile, SectionHeader, Text } from '@/components/ui';
import { findJob } from '@/data/catalog';
import { confirm, notify } from '@/lib/confirm';
import { timeAgo } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { colors, spacing } from '@/theme';

function Bullets({ items, icon }: { items: string[]; icon: 'checkmark-circle' | 'gift' }) {
  return (
    <Card style={{ gap: spacing.md }}>
      {items.map((t) => (
        <View key={t} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
          <Ionicons name={icon} size={18} color={colors.brand} />
          <Text variant="callout" style={{ flex: 1 }}>{t}</Text>
        </View>
      ))}
    </Card>
  );
}

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = findJob(id);
  const { applications, apply, resume } = useApp();
  if (!job) return null;
  const applied = applications.includes(job.id);

  const onApply = () => {
    if (!resume) {
      confirm('Cadastre seu currículo', 'Para se candidatar precisamos do seu currículo. Leva menos de 2 minutos.', 'Cadastrar', () => router.push('/resume'), false);
      return;
    }
    apply(job.id);
    haptic.success();
    notify('Candidatura enviada!', `Seu currículo foi enviado para ${job.company}. Boa sorte!`);
  };

  return (
    <Screen>
      <ScreenHeader title={job.title} subtitle={`${job.company} · ${job.location}`} />
      <Sheet contentStyle={{ gap: spacing.xxl, paddingBottom: 160 }}>
        <Card style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
          <IconTile icon={job.icon} size={56} />
          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              <Badge label={job.type.toUpperCase()} />
              {applied && <Badge label="CANDIDATURA ENVIADA" tone="success" icon="checkmark" />}
            </View>
            {job.salary && <Text variant="headline">{job.salary}</Text>}
            <Text variant="caption" color={colors.textSecondary}>Publicada {timeAgo(job.postedAt)}</Text>
          </View>
        </Card>
        <View>
          <SectionHeader title="Sobre a vaga" />
          <Text variant="callout" color={colors.textSecondary}>{job.description}</Text>
        </View>
        <View>
          <SectionHeader title="Requisitos" />
          <Bullets items={job.requirements} icon="checkmark-circle" />
        </View>
        <View>
          <SectionHeader title="Benefícios" />
          <Bullets items={job.benefits} icon="gift" />
        </View>
      </Sheet>
      <BottomBar>
        <Button title={applied ? 'Candidatura enviada' : 'Candidatar-se'} variant={applied ? 'secondary' : 'primary'} icon={applied ? 'checkmark-circle' : 'paper-plane'} disabled={applied} onPress={onApply} />
      </BottomBar>
    </Screen>
  );
}
