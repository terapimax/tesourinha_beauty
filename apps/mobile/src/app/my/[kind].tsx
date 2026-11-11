import { router, useLocalSearchParams } from 'expo-router';

import { CourseRow, JobRow } from '@/components/cards';
import { Screen, ScreenHeader, Sheet } from '@/components/screen';
import { EmptyState } from '@/components/ui';
import { courses, jobs } from '@/data/catalog';
import { useApp } from '@/store/app-store';
import { spacing } from '@/theme';

export default function MyItems() {
  const { kind } = useLocalSearchParams<{ kind: 'courses' | 'jobs' }>();
  const { enrollments, applications } = useApp();
  const isCourses = kind === 'courses';
  const myCourses = courses.filter((c) => enrollments.includes(c.id));
  const myJobs = jobs.filter((j) => applications.includes(j.id));
  const empty = isCourses ? myCourses.length === 0 : myJobs.length === 0;

  return (
    <Screen>
      <ScreenHeader title={isCourses ? 'Meus cursos' : 'Minhas vagas'} subtitle={isCourses ? 'Cursos em que você se inscreveu' : 'Vagas em que você se candidatou'} />
      <Sheet contentStyle={{ gap: spacing.md }}>
        {empty ? (
          isCourses ? (
            <EmptyState icon="school-outline" title="Nenhum curso ainda" text="Os cursos da Associação Tesourinha são gratuitos e com certificado." action="Ver cursos" onAction={() => router.replace('/courses')} />
          ) : (
            <EmptyState icon="briefcase-outline" title="Nenhuma candidatura" text="Encontre oportunidades em salões e parceiros da Tesourinha." action="Ver vagas" onAction={() => router.replace('/jobs')} />
          )
        ) : isCourses ? (
          myCourses.map((c) => <CourseRow key={c.id} course={c} />)
        ) : (
          myJobs.map((j) => <JobRow key={j.id} job={j} />)
        )}
      </Sheet>
    </Screen>
  );
}
