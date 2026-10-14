import { Redirect } from 'expo-router';
import { useGame } from '../state/store';

export default function Index() {
  const onboarded = useGame((g) => g.profile.onboarded);
  return <Redirect href={onboarded ? '/camp' : '/onboarding'} />;
}
