import { router } from 'expo-router';

import { Toggle } from '@/components/pro';
import { Screen, ScreenHeader, Sheet } from '@/components/screen';
import { IconTile, ListGroup, ListRow } from '@/components/ui';
import { categories, services as catalog } from '@/data/catalog';
import { formatDuration, formatPrice } from '@/lib/format';
import { usePro } from '@/store/pro-store';
import { spacing } from '@/theme';

export default function Services() {
  const { services, offers, toggleService, profile } = usePro();
  // Áreas do profissional primeiro, depois as demais
  const mine = profile?.categoryIds ?? [];
  const ordered = [...categories].sort((a, b) => Number(mine.includes(b.id)) - Number(mine.includes(a.id)));

  return (
    <Screen>
      <ScreenHeader
        title="Serviços"
        back={false}
        subtitle={services.length ? `${services.length} serviço${services.length > 1 ? 's' : ''} no seu perfil · toque para ajustar preço` : 'Ative os serviços que você atende'}
      />
      <Sheet contentStyle={{ gap: spacing.xxl }}>
        {ordered.map((c) => {
          const items = catalog.filter((s) => s.categoryId === c.id);
          if (!items.length) return null;
          return (
            <ListGroup key={c.id} title={c.name}>
              {items.map((s) => {
                const o = offers(s.id);
                return (
                  <ListRow
                    key={s.id}
                    left={<IconTile icon={s.icon} size={40} tone={o ? 'soft' : 'light'} />}
                    title={s.name}
                    subtitle={o ? `${formatPrice(o.price)} · ${formatDuration(o.durationMin)}` : `Média no app: a partir de ${formatPrice(s.priceFrom)}`}
                    onPress={o ? () => router.push({ pathname: '/service/[id]', params: { id: s.id } }) : undefined}
                    right={
                      <Toggle
                        value={!!o}
                        label={`Oferecer ${s.name}`}
                        onChange={() => toggleService(s.id, { serviceId: s.id, price: s.priceFrom, durationMin: s.durationMin })}
                      />
                    }
                  />
                );
              })}
            </ListGroup>
          );
        })}
      </Sheet>
    </Screen>
  );
}
