import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useApp } from '@/store/app-store';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack() {
  const { ready } = useApp();
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);
  if (!ready) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'default' }}>
        <Stack.Screen name="welcome" options={{ animation: 'fade', contentStyle: { backgroundColor: colors.black } }} />
        <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="booking-success" options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.black }}>
      <SafeAreaProvider>
        <AppProvider>
          {/* Na web (demo no navegador) o app fica centralizado com largura de celular. */}
          <View style={Platform.OS === 'web' ? { flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center', overflow: 'hidden' } : { flex: 1 }}>
            <RootStack />
          </View>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
