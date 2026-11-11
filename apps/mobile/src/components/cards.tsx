import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { findProfessional, findService } from '@/data/catalog';
import type { Booking, Course, Job, Professional } from '@/data/types';
import { dayParts, formatDuration, timeAgo } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { colors, radius, shadow, spacing } from '@/theme';
import { Avatar, Badge, Button, IconTile, PressableScale, Rating, Text } from './ui';

export function ProfessionalRow({ pro, compact }: { pro: Professional; compact?: boolean }) {
  const { isFavorite, toggleFavorite } = useApp();
  const fav = isFavorite(pro.id);
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/professional/[id]', params: { id: pro.id } })}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.xl, ...shadow.card }}>
      <Avatar name={pro.name} color={pro.avatarColor} uri={pro.imageUrl} size={compact ? 52 : 60} />
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="headline" numberOfLines={1} style={{ flexShrink: 1 }}>{pro.name}</Text>
          {pro.tesourinhaAlumni && <Ionicons name="ribbon" size={14} color={colors.brand} />}
        </View>
        <Text variant="footnote" color={colors.textSecondary}>{pro.role}</Text>
        <Rating value={pro.rating} count={pro.reviewsCount} distanceKm={pro.distanceKm} />
      </View>
      <View style={{ alignItems: 'flex-end', gap: 8 }}>
        <PressableScale
          hapticStyle="selection"
          onPress={() => toggleFavorite(pro.id)}
          style={{ padding: 2 }}
          accessibilityLabel={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? colors.brand : colors.textTertiary} />
        </PressableScale>
        <Button title="Agendar" size="sm" full={false} onPress={() => router.push({ pathname: '/book/[id]', params: { id: pro.id } })} />
      </View>
    </PressableScale>
  );
}

export function CourseRow({ course }: { course: Course }) {
  const { enrollments } = useApp();
  const enrolled = enrollments.includes(course.id);
  const full = course.seatsTaken >= course.seats;
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/courses/[id]', params: { id: course.id } })}
      style={{ flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.xl, alignItems: 'center', ...shadow.card }}>
      <View style={{ width: 76, height: 76, borderRadius: radius.lg, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={course.icon} size={32} color={colors.brand} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text variant="headline" numberOfLines={1}>{course.title}</Text>
        <Text variant="footnote" color={colors.textSecondary} numberOfLines={1}>{course.subtitle}</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          {enrolled ? <Badge label="INSCRITO" tone="success" icon="checkmark" /> : full ? <Badge label="LISTA DE ESPERA" tone="neutral" /> : <Badge label="GRATUITO" />}
          <Badge label={`${course.durationHours}H · ${course.modality.toUpperCase()}`} tone="neutral" />
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </PressableScale>
  );
}

export function JobRow({ job }: { job: Job }) {
  const { applications } = useApp();
  const applied = applications.includes(job.id);
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/jobs/[id]', params: { id: job.id } })}
      style={{ flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.xl, alignItems: 'center', ...shadow.card }}>
      <IconTile icon={job.icon} size={50} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="headline" numberOfLines={1}>{job.title}</Text>
        <Text variant="footnote" color={colors.textSecondary} numberOfLines={1}>{job.company} · {job.location}</Text>
        <Text variant="caption" color={colors.textTertiary}>{job.type} · {timeAgo(job.postedAt)}</Text>
      </View>
      {applied ? (
        <Badge label="ENVIADO" tone="success" icon="checkmark" />
      ) : (
        <Button title="Ver vaga" size="sm" full={false} onPress={() => router.push({ pathname: '/jobs/[id]', params: { id: job.id } })} />
      )}
    </PressableScale>
  );
}

export function BookingCard({ booking, onCancel }: { booking: Booking; onCancel?: () => void }) {
  const pro = findProfessional(booking.professionalId);
  const service = findService(booking.serviceId);
  if (!pro || !service) return null;
  const { day, month, weekday } = dayParts(booking.date);
  const cancelled = booking.status === 'cancelado';
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...shadow.card, opacity: cancelled ? 0.6 : 1 }}>
      <View style={{ flexDirection: 'row', padding: spacing.lg, gap: spacing.lg, alignItems: 'center' }}>
        <View style={{ width: 62, alignItems: 'center', paddingVertical: 8, borderRadius: radius.lg, backgroundColor: cancelled ? colors.surfaceMuted : colors.brandSoft }}>
          <Text variant="caption2" color={cancelled ? colors.textSecondary : colors.brand}>{month}</Text>
          <Text variant="title1" color={cancelled ? colors.textSecondary : colors.brandDark} style={{ lineHeight: 32 }}>{day}</Text>
          <Text variant="caption" color={colors.textSecondary}>{booking.time}</Text>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text variant="headline">{service.name}</Text>
          <Text variant="footnote" color={colors.textSecondary}>com {pro.name} · {formatDuration(service.durationMin)}</Text>
          <Text variant="footnote" color={colors.textSecondary} style={{ textTransform: 'capitalize' }}>{weekday} · {pro.neighborhood}</Text>
          <View style={{ marginTop: 4 }}>
            {cancelled ? <Badge label="CANCELADO" tone="danger" /> : booking.status === 'concluido' ? <Badge label="CONCLUÍDO" tone="neutral" /> : <Badge label="CONFIRMADO" tone="success" icon="checkmark" />}
          </View>
        </View>
        <Avatar name={pro.name} color={pro.avatarColor} size={40} />
      </View>
      {booking.status === 'confirmado' && onCancel && (
        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.separator }}>
          <PressableScale
            style={{ flex: 1, paddingVertical: 12, alignItems: 'center' }}
            onPress={() => router.push({ pathname: '/book/[id]', params: { id: pro.id, serviceId: service.id, reschedule: booking.id } })}>
            <Text variant="subhead" weight="600" color={colors.text}>Remarcar</Text>
          </PressableScale>
          <View style={{ width: 1, backgroundColor: colors.separator }} />
          <PressableScale
            style={{ flex: 1, paddingVertical: 12, alignItems: 'center' }}
            onPress={() => {
              haptic.warning();
              onCancel();
            }}>
            <Text variant="subhead" weight="600" color={colors.danger}>Cancelar</Text>
          </PressableScale>
        </View>
      )}
    </View>
  );
}
