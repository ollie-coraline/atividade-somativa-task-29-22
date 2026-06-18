import { Stack, useRouter } from 'expo-router';
import SignupScreen from '../../src/screens/SignupScreen';
import { saveSessionToken } from '../../src/utils/storage';

export default function SignupPage() {
  const router = useRouter();

  const handleSignupSuccess = async (token: string) => {
    await saveSessionToken(token);
    router.replace('/tasks');
  };

  const handleNavigateToLogin = () => {
    router.push('/login');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Criar conta' }} />
      <SignupScreen onNavigateToLogin={handleNavigateToLogin} onSignupSuccess={handleSignupSuccess} />
    </>
  );
}
