import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { getSessionToken } from '../src/utils/storage';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const protectRoute = async () => {
      try {
        const token = await getSessionToken();
        const currentSegment = segments?.[0] ?? '';
        const isAuthRoute = Array.isArray(segments) && (segments.includes('login') || segments.includes('signup'));

        console.log('[protectRoute] segments:', segments, 'currentSegment:', currentSegment, 'isAuthRoute:', isAuthRoute, 'hasToken:', !!token);

        if (!token && !isAuthRoute) {
          router.replace('/login');
          return;
        }

        if (token && isAuthRoute) {
          router.replace('/tasks');
          return;
        }

        if (token && (!segments || segments.length === 0)) {
          router.replace('/tasks');
          return;
        }
      } catch (err) {
        console.error('protectRoute error', err);
      }
    };

    protectRoute();
  }, [router, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Slot />
    </Stack>
  );
}
