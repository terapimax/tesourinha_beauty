import { Alert, Platform } from 'react-native';

/** Diálogo de confirmação nativo (Alert no iOS/Android, window.confirm na web). */
export function confirm(title: string, message: string, confirmText: string, onConfirm: () => void, destructive = true) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Voltar', style: 'cancel' },
    { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}

export function notify(title: string, message: string) {
  if (Platform.OS === 'web') {
    globalThis.alert?.(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
