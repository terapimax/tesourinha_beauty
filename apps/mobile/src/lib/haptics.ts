import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

export const haptic = {
  light: () => enabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  medium: () => enabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
  selection: () => enabled && Haptics.selectionAsync().catch(() => {}),
  success: () => enabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  warning: () => enabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}),
};
