import { Switch } from 'react-native';
import { useState } from 'react';

import { Screen, ScreenHeader, Sheet } from '@/components/screen';
import { ListGroup, ListRow } from '@/components/ui';
import { colors, spacing } from '@/theme';

export default function Settings() {
  const [reminders, setReminders] = useState(true);
  const [news, setNews] = useState(true);
  const [jobs, setJobs] = useState(false);
  const sw = (v: boolean, set: (v: boolean) => void) => <Switch value={v} onValueChange={set} trackColor={{ true: colors.brand, false: colors.border }} thumbColor={colors.white} />;
  return (
    <Screen>
      <ScreenHeader title="Configurações" />
      <Sheet contentStyle={{ gap: spacing.xxl }}>
        <ListGroup title="Notificações" footer="Você pode alterar isso a qualquer momento.">
          <ListRow icon="alarm-outline" title="Lembretes de agendamento" right={sw(reminders, setReminders)} />
          <ListRow icon="school-outline" title="Novas turmas de cursos" right={sw(news, setNews)} />
          <ListRow icon="briefcase-outline" title="Vagas compatíveis comigo" right={sw(jobs, setJobs)} />
        </ListGroup>
        <ListGroup title="Privacidade">
          <ListRow icon="shield-checkmark-outline" title="Política de privacidade" onPress={() => {}} />
          <ListRow icon="document-text-outline" title="Termos de uso" onPress={() => {}} />
          <ListRow icon="trash-outline" title="Excluir minha conta" destructive onPress={() => {}} />
        </ListGroup>
      </Sheet>
    </Screen>
  );
}
