import { useLocalSearchParams } from 'expo-router';

import { ProfessionalsScreen } from '@/components/professionals-screen';
import type { CategoryId } from '@/data/types';

export default function Professionals() {
  const { category } = useLocalSearchParams<{ category?: CategoryId }>();
  return <ProfessionalsScreen back initialCategory={category} />;
}
