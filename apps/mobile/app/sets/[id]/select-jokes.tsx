import { SelectJokesScreen } from '@/components/sets';
import { useLocalSearchParams } from 'expo-router';

export default function SelectJokesForEditRoute() {
  const { id } = useLocalSearchParams();

  return (
    <SelectJokesScreen
      mode="edit"
      setId={id as string}
    />
  );
}
