import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Redirect, Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import type { IconName } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app-store';
import { colors } from '@/theme';

const TABS: { name: string; title: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'index', title: 'Início', icon: 'home-outline', iconActive: 'home' },
  { name: 'explore', title: 'Buscar', icon: 'search-outline', iconActive: 'search' },
  { name: 'bookings', title: 'Agenda', icon: 'calendar-outline', iconActive: 'calendar' },
  { name: 'favorites', title: 'Favoritos', icon: 'heart-outline', iconActive: 'heart' },
  { name: 'profile', title: 'Perfil', icon: 'person-outline', iconActive: 'person' },
];

export default function TabsLayout() {
  const { user, bookings } = useApp();
  if (!user) return <Redirect href="/welcome" />;
  const upcoming = bookings.filter((b) => b.status === 'confirmado').length;

  return (
    <Tabs
      screenListeners={{ tabPress: () => haptic.selection() }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.separator,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255,255,255,0.98)',
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView tint="systemChromeMaterialLight" intensity={100} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.96)' }]} />
          ),
      }}>
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarBadge: t.name === 'bookings' && upcoming > 0 ? upcoming : undefined,
            tabBarBadgeStyle: { backgroundColor: colors.brand, fontSize: 10 },
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? t.iconActive : t.icon} size={24} color={color as string} />,
          }}
        />
      ))}
    </Tabs>
  );
}
