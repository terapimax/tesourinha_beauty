import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Redirect, Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import type { IconName } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { needsAction } from '@/pro/time';
import { usePro } from '@/store/pro-store';
import { colors } from '@/theme';

const TABS: { name: string; title: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'index', title: 'Hoje', icon: 'today-outline', iconActive: 'today' },
  { name: 'agenda', title: 'Agenda', icon: 'calendar-outline', iconActive: 'calendar' },
  { name: 'services', title: 'Serviços', icon: 'cut-outline', iconActive: 'cut' },
  { name: 'earnings', title: 'Ganhos', icon: 'wallet-outline', iconActive: 'wallet' },
  { name: 'profile', title: 'Perfil', icon: 'person-outline', iconActive: 'person' },
];

export default function TabsLayout() {
  const { profile, approval, appointments } = usePro();
  if (!profile) return <Redirect href="/welcome" />;
  if (approval !== 'aprovado') return <Redirect href="/pending" />;
  const pending = appointments.filter(needsAction).length;

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
            tabBarBadge: t.name === 'index' && pending > 0 ? pending : undefined,
            tabBarBadgeStyle: { backgroundColor: colors.brand, fontSize: 10 },
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? t.iconActive : t.icon} size={24} color={color as string} />,
          }}
        />
      ))}
    </Tabs>
  );
}
