import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text as RNText,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import type { IconName } from '@/data/types';
import { initials } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { colors, gradients, radius, shadow, spacing, type } from '@/theme';

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

type Variant = keyof typeof type;

export function Text({
  variant = 'body',
  color = colors.text,
  weight,
  align,
  style,
  ...rest
}: TextProps & { variant?: Variant; color?: string; weight?: TextStyle['fontWeight']; align?: TextStyle['textAlign'] }) {
  return (
    <RNText
      {...rest}
      style={[type[variant], { color }, weight ? { fontWeight: weight } : null, align ? { textAlign: align } : null, style]}
    />
  );
}

/* ------------------------------------------------------------------ */
/* PressableScale — toque com leve "afundar", como no iOS              */
/* ------------------------------------------------------------------ */

export function PressableScale({
  children,
  style,
  scaleTo = 0.97,
  onPress,
  hapticStyle = 'light',
  ...rest
}: Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  hapticStyle?: 'light' | 'selection' | 'none';
  children: ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  // Propriedades de layout precisam ficar no Pressable externo para flex/width funcionarem.
  const flat = StyleSheet.flatten(style) ?? {};
  const outer: ViewStyle = { flex: flat.flex, flexGrow: flat.flexGrow, alignSelf: flat.alignSelf, width: flat.width };
  return (
    <Pressable
      {...rest}
      style={outer}
      onPressIn={() => to(scaleTo)}
      onPressOut={() => to(1)}
      onPress={(e) => {
        if (hapticStyle !== 'none') haptic[hapticStyle]();
        onPress?.(e);
      }}>
      <Animated.View style={[style, flat.width !== undefined ? { width: '100%' } : null, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'dark' | 'secondary' | 'outline' | 'outlineLight' | 'ghost';

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconRight,
  disabled,
  loading,
  style,
  full = true,
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  full?: boolean;
}) {
  const height = size === 'lg' ? 54 : size === 'md' ? 44 : 34;
  const fontSize = size === 'lg' ? 17 : size === 'md' ? 15 : 13;
  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.brand, fg: colors.white },
    dark: { bg: colors.black, fg: colors.white },
    secondary: { bg: colors.brandSoft, fg: colors.brandDark },
    outline: { bg: 'transparent', fg: colors.text, border: colors.border },
    outlineLight: { bg: 'rgba(255,255,255,0.06)', fg: colors.white, border: 'rgba(255,255,255,0.55)' },
    ghost: { bg: 'transparent', fg: colors.brand },
  };
  const p = palette[variant];
  const content = (
    <View style={[styles.btnInner, { height, paddingHorizontal: size === 'sm' ? 14 : 20 }]}>
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={fontSize + 3} color={p.fg} />}
          <RNText style={[type.headline, { color: p.fg, fontSize }]}>{title}</RNText>
          {iconRight && <Ionicons name={iconRight} size={fontSize + 3} color={p.fg} />}
        </>
      )}
    </View>
  );

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          borderRadius: size === 'sm' ? radius.pill : radius.lg,
          backgroundColor: p.bg,
          borderWidth: p.border ? 1 : 0,
          borderColor: p.border,
          opacity: disabled ? 0.45 : 1,
          alignSelf: full ? 'stretch' : 'flex-start',
          overflow: 'hidden',
        },
        variant === 'primary' && !disabled ? shadow.brand : null,
        style,
      ]}>
      {variant === 'primary' ? (
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </PressableScale>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  return <View style={[styles.card, padded && { padding: spacing.lg }, style]}>{children}</View>;
}

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

export function Avatar({ name, color = colors.brand, size = 56, uri, ring }: { name: string; color?: string; size?: number; uri?: string; ring?: boolean }) {
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, overflow: 'hidden' },
        ring && { borderWidth: 2, borderColor: colors.white, ...shadow.card },
      ]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      ) : (
        <LinearGradient
          colors={[color, shade(color)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <RNText style={{ color: colors.white, fontSize: size * 0.36, fontWeight: '700', letterSpacing: 0.5 }}>{initials(name)}</RNText>
        </LinearGradient>
      )}
    </View>
  );
}

function shade(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.round(v * 0.72));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/* ------------------------------------------------------------------ */
/* IconTile                                                            */
/* ------------------------------------------------------------------ */

export function IconTile({
  icon,
  size = 44,
  tone = 'soft',
}: {
  icon: IconName;
  size?: number;
  tone?: 'soft' | 'brand' | 'dark' | 'light';
}) {
  const bg = { soft: colors.brandSoft, brand: colors.brand, dark: colors.black, light: colors.surfaceMuted }[tone];
  const fg = { soft: colors.brand, brand: colors.white, dark: colors.white, light: colors.text }[tone];
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={size * 0.5} color={fg} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Chip                                                                */
/* ------------------------------------------------------------------ */

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName }) {
  return (
    <PressableScale
      onPress={onPress}
      hapticStyle="selection"
      style={[styles.chip, active ? { backgroundColor: colors.brand, borderColor: colors.brand } : null]}>
      {icon && <Ionicons name={icon} size={14} color={active ? colors.white : colors.text} />}
      <RNText style={[type.subhead, { fontWeight: '600', color: active ? colors.white : colors.text }]}>{label}</RNText>
    </PressableScale>
  );
}

/* ------------------------------------------------------------------ */
/* Rating                                                              */
/* ------------------------------------------------------------------ */

export function Rating({ value, count, distanceKm, color = colors.textSecondary }: { value: number; count?: number; distanceKm?: number; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name="star" size={13} color={colors.star} />
      <RNText style={[type.footnote, { color: colors.text, fontWeight: '600' }]}>{value.toFixed(1)}</RNText>
      {count !== undefined && <RNText style={[type.footnote, { color }]}>({count})</RNText>}
      {distanceKm !== undefined && (
        <>
          <Ionicons name="location-outline" size={13} color={color} style={{ marginLeft: 6 }} />
          <RNText style={[type.footnote, { color }]}>{distanceKm.toFixed(1).replace('.', ',')} km</RNText>
        </>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */

export function Badge({ label, tone = 'brand', icon }: { label: string; tone?: 'brand' | 'success' | 'danger' | 'neutral' | 'dark'; icon?: IconName }) {
  const map = {
    brand: [colors.brandSoft, colors.brandDark],
    success: [colors.successSoft, '#1F8A3B'],
    danger: [colors.dangerSoft, colors.danger],
    neutral: [colors.surfaceMuted, colors.textSecondary],
    dark: ['rgba(0,0,0,0.75)', colors.white],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' }}>
      {icon && <Ionicons name={icon} size={11} color={fg} />}
      <RNText style={[type.caption2, { color: fg }]}>{label}</RNText>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* SearchBar                                                           */
/* ------------------------------------------------------------------ */

export function SearchBar({ style, ...props }: TextInputProps & { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.search, style]}>
      <Ionicons name="search" size={18} color={colors.textSecondary} />
      <TextInput
        placeholderTextColor={colors.textTertiary}
        style={[type.body, { flex: 1, color: colors.text, paddingVertical: 0, outlineStyle: 'none' } as unknown as TextStyle]}
        returnKeyType="search"
        clearButtonMode="while-editing"
        {...props}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Field                                                               */
/* ------------------------------------------------------------------ */

export function Field({ label, icon, ...props }: TextInputProps & { label: string; icon?: IconName }) {
  return (
    <View style={{ gap: 6 }}>
      <Text variant="footnote" color={colors.textSecondary} weight="600" style={{ marginLeft: 4 }}>
        {label.toUpperCase()}
      </Text>
      <View style={styles.field}>
        {icon && <Ionicons name={icon} size={18} color={colors.textSecondary} />}
        <TextInput
          placeholderTextColor={colors.textTertiary}
          style={[type.body, { flex: 1, color: colors.text, paddingVertical: 0, outlineStyle: 'none' } as unknown as TextStyle, props.multiline && { minHeight: 88, textAlignVertical: 'top' }]}
          {...props}
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Grouped list (estilo Ajustes do iOS)                                */
/* ------------------------------------------------------------------ */

export function ListGroup({ children, title, footer, style }: { children: ReactNode; title?: string; footer?: string; style?: StyleProp<ViewStyle> }) {
  const items = (Array.isArray(children) ? children : [children]).flat().filter(Boolean);
  return (
    <View style={style}>
      {title && (
        <Text variant="footnote" color={colors.textSecondary} weight="600" style={{ marginLeft: spacing.lg, marginBottom: 8 }}>
          {title.toUpperCase()}
        </Text>
      )}
      <View style={styles.group}>
        {items.map((child, i) => (
          <View key={i}>
            {child}
            {i < items.length - 1 && <View style={styles.groupSeparator} />}
          </View>
        ))}
      </View>
      {footer && (
        <Text variant="footnote" color={colors.textSecondary} style={{ marginHorizontal: spacing.lg, marginTop: 8 }}>
          {footer}
        </Text>
      )}
    </View>
  );
}

export function ListRow({
  icon,
  title,
  subtitle,
  value,
  onPress,
  destructive,
  right,
  left,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  right?: ReactNode;
  left?: ReactNode;
}) {
  return (
    <Pressable onPress={onPress && (() => { haptic.selection(); onPress(); })} style={({ pressed }) => [styles.row, pressed && onPress ? { backgroundColor: colors.surfaceMuted } : null]}>
      {left ?? (icon && (
        <View style={[styles.rowIcon, destructive && { backgroundColor: colors.dangerSoft }]}>
          <Ionicons name={icon} size={18} color={destructive ? colors.danger : colors.brand} />
        </View>
      ))}
      <View style={{ flex: 1 }}>
        <Text variant="body" color={destructive ? colors.danger : colors.text}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="footnote" color={colors.textSecondary} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {value && <Text variant="subhead" color={colors.textSecondary}>{value}</Text>}
      {right ?? (onPress && !destructive && <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />)}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Section header                                                      */
/* ------------------------------------------------------------------ */

export function SectionHeader({ title, action, onAction, style }: { title: string; action?: string; onAction?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: spacing.md }, style]}>
      <Text variant="title3" weight="700">{title}</Text>
      {action && (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text variant="subhead" color={colors.brand} weight="600">{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

export function EmptyState({ icon, title, text, action, onAction }: { icon: IconName; title: string; text: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.huge, paddingHorizontal: spacing.xxl, gap: spacing.md }}>
      <IconTile icon={icon} size={72} />
      <Text variant="title3" weight="700" align="center" style={{ marginTop: spacing.sm }}>{title}</Text>
      <Text variant="subhead" color={colors.textSecondary} align="center">{text}</Text>
      {action && <Button title={action} onPress={onAction} full={false} size="md" style={{ marginTop: spacing.sm }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, ...shadow.card },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  group: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden' },
  groupSeparator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: 60 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: spacing.lg, paddingVertical: 13, minHeight: 52 },
  rowIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' },
});
