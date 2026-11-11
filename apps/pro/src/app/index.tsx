import { Redirect } from 'expo-router';

import { usePro } from '@/store/pro-store';

export default function Index() {
  const { profile, approval } = usePro();
  if (!profile) return <Redirect href="/welcome" />;
  return <Redirect href={approval === 'aprovado' ? '/(tabs)' : '/pending'} />;
}
