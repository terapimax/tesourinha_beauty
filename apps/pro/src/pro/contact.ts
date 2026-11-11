import { Linking } from 'react-native';

const digits = (phone: string) => phone.replace(/\D/g, '');

export const openWhatsApp = (phone: string, text: string) =>
  Linking.openURL(`https://wa.me/55${digits(phone)}?text=${encodeURIComponent(text)}`).catch(() => {});

export const callPhone = (phone: string) => Linking.openURL(`tel:${digits(phone)}`).catch(() => {});
