import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Stepper } from '@/components/pro';
import { BottomBar, Screen, ScreenHeader, Sheet } from '@/components/screen';
import { Button, Card, EmptyState, Field, IconTile, Text } from '@/components/ui';
import { findService } from '@/data/catalog';
import { confirm } from '@/lib/confirm';
import { formatDuration, formatPrice } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { usePro } from '@/store/pro-store';
import { colors, spacing } from '@/theme';

export default function ServiceEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const service = findService(id);
  const { offers, updateService, toggleService } = usePro();
  const offer = offers(id);
  const [price, setPrice] = useState(offer ? String(offer.price) : '');
  const [duration, setDuration] = useState(offer?.durationMin ?? service?.durationMin ?? 60);

  if (!service || !offer) {
    return (
      <Screen>
        <ScreenHeader title="Serviço" />
        <Sheet>
          <EmptyState icon="cut-outline" title="Serviço fora do seu perfil" text="Ative o serviço na aba Serviços para definir preço e duração." />
        </Sheet>
      </Screen>
    );
  }

  const priceNum = Number(price.replace(',', '.')) || 0;
  const bump = (delta: number) => setPrice(String(Math.max(0, Math.round(priceNum + delta))));

  const save = () => {
    updateService(id, { price: priceNum, durationMin: duration });
    haptic.success();
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader title={service.name} subtitle={service.description} />
      <Sheet contentStyle={{ gap: spacing.xxl, paddingBottom: 200 }}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <IconTile icon={service.icon} size={48} />
          <View style={{ flex: 1 }}>
            <Text variant="footnote" color={colors.textSecondary}>Como aparece para o cliente</Text>
            <Text variant="title3" weight="700">{formatPrice(priceNum)}</Text>
            <Text variant="footnote" color={colors.textSecondary}>{formatDuration(duration)} de atendimento</Text>
          </View>
        </Card>

        <View style={{ gap: spacing.md }}>
          <Field label="Seu preço (R$)" icon="cash-outline" value={price} onChangeText={(t) => setPrice(t.replace(/[^\d,.]/g, ''))} keyboardType="decimal-pad" />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {[-10, -5, 5, 10].map((d) => (
              <Button key={d} title={`${d > 0 ? '+' : '−'} R$ ${Math.abs(d)}`} size="sm" variant="outline" style={{ flex: 1 }} onPress={() => bump(d)} />
            ))}
          </View>
          <Text variant="footnote" color={colors.textSecondary} style={{ marginLeft: 4 }}>
            Referência no app: a partir de {formatPrice(service.priceFrom)}.
          </Text>
        </View>

        <Card style={{ alignItems: 'center', gap: spacing.sm }}>
          <Stepper
            label="Duração"
            value={formatDuration(duration)}
            onMinus={() => setDuration((d) => Math.max(15, d - 15))}
            onPlus={() => setDuration((d) => Math.min(480, d + 15))}
          />
          <Text variant="caption" color={colors.textSecondary} align="center">A agenda reserva esse tempo a cada atendimento.</Text>
        </Card>

        <Button
          title="Deixar de oferecer"
          variant="ghost"
          icon="trash-outline"
          onPress={() =>
            confirm('Remover serviço?', 'Ele deixa de aparecer no seu perfil. Atendimentos já marcados continuam valendo.', 'Remover', () => {
              toggleService(id, offer);
              router.back();
            })
          }
        />
      </Sheet>
      <BottomBar>
        <Button title="Salvar" icon="checkmark" onPress={save} disabled={priceNum <= 0} />
      </BottomBar>
    </Screen>
  );
}
