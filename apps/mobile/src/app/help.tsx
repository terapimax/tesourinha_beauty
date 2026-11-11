import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';

import { Screen, ScreenHeader, Sheet } from '@/components/screen';
import { Button, Card, Text } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, spacing } from '@/theme';

const FAQ = [
  ['Como agendar um serviço?', 'Toque em "Agendar" na tela inicial, escolha o serviço, o profissional, a data e o horário. Pronto! Você recebe a confirmação na hora.'],
  ['Posso cancelar ou remarcar?', 'Sim. Em Agenda, toque em "Cancelar" ou "Remarcar" no cartão do agendamento.'],
  ['Os cursos são mesmo gratuitos?', 'Sim! Os cursos são oferecidos pela Associação Tesourinha, sem custo e com certificado.'],
  ['Como me candidato a uma vaga?', 'Cadastre seu currículo no Perfil e toque em "Candidatar-se" na vaga desejada.'],
  ['Como pago pelo serviço?', 'No MVP o pagamento é feito diretamente no local com o profissional.'],
];

export default function Help() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Screen>
      <ScreenHeader title="Ajuda" subtitle="Perguntas frequentes" />
      <Sheet contentStyle={{ gap: spacing.md }}>
        {FAQ.map(([q, a], i) => (
          <Card key={q} padded={false}>
            <Pressable onPress={() => { haptic.selection(); setOpen(open === i ? null : i); }} style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Text variant="headline" style={{ flex: 1 }}>{q}</Text>
              <Ionicons name={open === i ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
            </Pressable>
            {open === i && <Text variant="subhead" color={colors.textSecondary} style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>{a}</Text>}
          </Card>
        ))}
        <View style={{ marginTop: spacing.lg }}>
          <Button title="Falar com a equipe" icon="logo-whatsapp" variant="dark" onPress={() => Linking.openURL('https://wa.me/')} />
        </View>
      </Sheet>
    </Screen>
  );
}
