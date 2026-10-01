import { Stack } from "expo-router";
import { AppProvider, Loading, useApp } from "../lib";

function Routes() {
  const { session, authLoading } = useApp();
  if (authLoading) return <Loading />;

  return (
    <Stack screenOptions={{ headerTintColor: "#4f46e5", headerBackTitle: "Zurück" }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="quest/[id]" options={{ title: "Quest" }} />
        <Stack.Screen name="create-quest" options={{ title: "Quest erstellen", presentation: "modal" }} />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <Routes />
    </AppProvider>
  );
}