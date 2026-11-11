import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { BottomBar, Screen, ScreenHeader, Sheet } from '@/components/screen';
import { Badge, Button, Card, SectionHeader, Text } from '@/components/ui';
import { findCourse } from '@/data/catalog';
import { notify } from '@/lib/confirm';
import { formatDayLong } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { colors, radius, spacing } from '@/theme';

export default function CourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const course = findCourse(id);
  const { enrollments, enroll } = useApp();
  if (!course) return null;
  const enrolled = enrollments.includes(course.id);
  const full = course.seatsTaken >= course.seats;
  const left = Math.max(0, course.seats - course.seatsTaken);
  const pct = Math.min(1, course.seatsTaken / course.seats);

  return (
    <Screen>
      <ScreenHeader title={course.title} subtitle={course.subtitle}>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          <Badge label="GRATUITO" />
          {course.certificate && <Badge label="COM CERTIFICADO" tone="dark" icon="ribbon" />}
          <Badge label={course.level.toUpperCase()} tone="dark" />
        </View>
      </ScreenHeader>
      <Sheet contentStyle={{ gap: spacing.xxl, paddingBottom: 160 }}>
        <Card style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg }}>
          {[
            ['time-outline', 'Carga horária', `${course.durationHours} horas`],
            ['location-outline', 'Modalidade', course.modality],
            ['calendar-outline', 'Início', formatDayLong(course.startDate)],
            ['people-outline', 'Vagas', full ? 'Turma completa' : `${left} restantes`],
          ].map(([icon, label, value]) => (
            <View key={label} style={{ width: '50%', flexDirection: 'row', gap: 10, paddingRight: 8 }}>
              <Ionicons name={icon as never} size={20} color={colors.brand} />
              <View style={{ flex: 1 }}>
                <Text variant="caption" color={colors.textSecondary}>{label}</Text>
                <Text variant="subhead" weight="600">{value}</Text>
              </View>
            </View>
          ))}
          <View style={{ width: '100%' }}>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surfaceMuted, overflow: 'hidden' }}>
              <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: full ? colors.textTertiary : colors.brand }} />
            </View>
            <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 6 }}>{course.seatsTaken} de {course.seats} vagas preenchidas</Text>
          </View>
        </Card>

        <View>
          <SectionHeader title="Sobre o curso" />
          <Text variant="callout" color={colors.textSecondary}>{course.description}</Text>
        </View>

        <View>
          <SectionHeader title="O que você vai aprender" />
          <Card style={{ gap: spacing.lg }}>
            {course.modules.map((m, i) => (
              <View key={m} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Text variant="footnote" weight="700" color={colors.brand}>{i + 1}</Text>
                </View>
                <Text variant="callout" style={{ flex: 1 }}>{m}</Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.brandSoft }}>
          <Ionicons name="heart" size={20} color={colors.brand} />
          <Text variant="footnote" color={colors.text} style={{ flex: 1 }}>
            Curso oferecido gratuitamente pela Associação Tesourinha. Alunos formados ganham destaque no app e acesso prioritário às vagas.
          </Text>
        </View>
      </Sheet>
      <BottomBar>
        <Button
          title={enrolled ? 'Inscrição confirmada' : full ? 'Entrar na lista de espera' : 'Quero me inscrever'}
          icon={enrolled ? 'checkmark-circle' : undefined}
          variant={enrolled ? 'secondary' : 'primary'}
          disabled={enrolled}
          onPress={() => {
            enroll(course.id);
            haptic.success();
            notify(full ? 'Você está na lista de espera' : 'Inscrição realizada!', full ? 'Avisaremos assim que abrir uma vaga.' : 'Enviaremos os detalhes da turma por e-mail e WhatsApp.');
          }}
        />
      </BottomBar>
    </Screen>
  );
}
