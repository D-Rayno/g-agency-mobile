// app/(admin)/_layout.tsx
import { useAdminAuth } from "@/stores/admin-auth";
import { router, Stack } from "expo-router";
import { useEffect } from "react";

export default function AdminLayout() {
  const { isAuthenticated, checkAuth } = useAdminAuth();

  useEffect(() => {
    const verify = async () => {
      const valid = await checkAuth();
      if (!valid) {
        router.replace("/(admin)/login");
      }
    };

    verify();
  }, []);

  // Don't render anything if checking auth
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="events/[id]" options={{ presentation: "modal" }} />
      <Stack.Screen name="users/[id]" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="registrations/[id]"
        options={{ presentation: "modal" }} />
    </Stack>
  );
}
