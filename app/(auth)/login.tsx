import { Stack, useRouter } from 'expo-router';
import LoginScreen from '../../src/screens/LoginScreen';
import { saveSessionToken } from '../../src/utils/storage';

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = async (token: string) => {
    await saveSessionToken(token);
    router.replace('/tasks');
  };

  const handleNavigateToSignup = () => {
    router.push('/signup');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Entrar' }} />
      <LoginScreen onNavigateToSignup={handleNavigateToSignup} onLoginSuccess={handleLoginSuccess} />
    </>
  );
}
