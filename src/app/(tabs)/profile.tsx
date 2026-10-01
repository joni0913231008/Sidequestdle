import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, useApp } from "../../lib";

export default function Profile() {
  const { user, quests, myQuests, signOut } = useApp();

  const created = quests.filter((q) => q.creatorId === user.id).length;
  const accepted = myQuests.length;
  const submitted = myQuests.filter((m) => m.status === "submitted").length;
  const completed = myQuests.filter((m) => m.status === "completed").length;

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.header}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={s.name}>{user.username}</Text>
          <Text style={s.email}>{user.email}</Text>
          {user.isAdmin && <Text style={s.admin}>Admin</Text>}
          <Text style={s.coins}>🪙 {user.coins} Coins</Text>
        </View>

        <View style={s.stats}>
          <Stat label="Erstellt" value={created} />
          <Stat label="Angenommen" value={accepted} />
          <Stat label="Abgegeben" value={submitted} />
          <Stat label="Erledigt" value={completed} />
        </View>

        <Button title="Abmelden" secondary onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={s.stat}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16 },
  header: { alignItems: "center", marginVertical: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#4f46e5", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "700" },
  name: { fontSize: 22, fontWeight: "700" },
  email: { color: "#6b7280", marginTop: 2 },
  admin: { marginTop: 6, color: "#4f46e5", fontWeight: "700" },
  coins: { marginTop: 10, fontSize: 18, fontWeight: "600" },
  stats: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  stat: { flex: 1, alignItems: "center", backgroundColor: "#fff", paddingVertical: 12, marginHorizontal: 4, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { color: "#6b7280", fontSize: 12, marginTop: 2 },
});