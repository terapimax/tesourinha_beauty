import { router } from 'expo-router';

import { ProfessionalRow } from '@/components/cards';
import { Screen, ScreenHeader, Sheet } from '@/components/screen';
import { EmptyState } from '@/components/ui';
import { professionals } from '@/data/catalog';
import { useApp } from '@/store/app-store';
import { spacing } from '@/theme';

export default function Favorites() {
  const { favorites } = useApp();
  const list = professionals.filter((p) => favorites.includes(p.id));
  return (
    <Screen>
      <ScreenHeader title="Favoritos" subtitle="Seus profissionais preferidos" back={false} />
      <Sheet contentStyle={{ gap: spacing.md }}>
        {list.length === 0 ? (
          <EmptyState icon="heart-outline" title="Nenhum favorito ainda" text="Toque no coração de um profissional para salvá-lo aqui e agendar mais rápido." action="Explorar profissionais" onAction={() => router.push('/(tabs)/explore')} />
        ) : (
          list.map((p) => <ProfessionalRow key={p.id} pro={p} />)
        )}
      </Sheet>
    </Screen>
  );
}
