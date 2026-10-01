// This is the root (layout) file for the `(tabs)` group. All routes defined in this folder will be rendered as children of this layout component.
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// This layout is shared across all routes defined in the `(tabs)` folder. You can add shared UI like a navigation bar here.
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#4f46e5" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="my-quests"
        options={{
          title: "Meine Quests",
          tabBarIcon: ({ color, size }) => <Ionicons name="list" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}