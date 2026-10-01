// This is the root (layout) file for the app. All routes defined in the app will be rendered as children of this layout component.
import { Stack } from "expo-router";
import { AppProvider } from "../lib";

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerTintColor: "#4f46e5",
          headerBackTitle: "Zurück",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="quest/[id]" options={{ title: "Quest" }} />
        <Stack.Screen
          name="create-quest"
          options={{ title: "Quest erstellen", presentation: "modal" }}
        />
      </Stack>
    </AppProvider>
  );
}