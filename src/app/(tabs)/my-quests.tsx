// die MyQuests-Komponente zeigt die Liste der Quests an, die der Benutzer angenommen hat, und ermöglicht das Filtern nach Status
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { RewardBadge, StatusBadge, useApp, UserQuest } from "../../lib";

// Definieren der Abschnitte für die Anzeige der Quests nach Status
const SECTIONS: { status: UserQuest["status"]; title: string; action?: string }[] = [
  { status: "accepted", title: "Aktive Quests", action: "Abgeben →" }, // Hinzufügen einer Aktion für aktive Quests
  { status: "submitted", title: "Wird geprüft" }, // Keine Aktion für Quests, die geprüft werden
  { status: "completed", title: "Abgeschlossen" }, // Keine Aktion für abgeschlossene Quests
];
// Rendern der MyQuests-Komponente
export default function MyQuests() {
  const { myQuests, quests } = useApp();
// Wenn keine Quests vorhanden sind, wird eine leere Ansicht angezeigt
  if (myQuests.length === 0) {
    return (
      <SafeAreaView style={s.screen} edges={["top"]}>
        <View style={s.empty}>
          <Text style={s.emptyTitle}>Noch keine Quests</Text>
          <Text style={s.emptyText}>Nimm auf Home eine Quest an, dann erscheint sie hier.</Text>
        </View>
      </SafeAreaView>
    );
  }
// Rendern der Benutzeroberfläche
  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={s.content}>
        {SECTIONS.map(({ status, title, action }) => {
          const items = myQuests.filter((m) => m.status === status);
          // Wenn keine Quests in diesem Abschnitt vorhanden sind, wird null zurückgegeben
          if (items.length === 0) return null;
          return (
            <View key={status}>
              <Text style={s.section}>{title} ({items.length})</Text>
              {items.map((m) => {
                const quest = quests.find((q) => q.id === m.questId);
                if (!quest) return null;
                return (
                  <Link key={m.id} href={`/quest/${quest.id}` as any} asChild>
                    <Pressable style={s.card}>
                      <Text style={s.title}>{quest.title}</Text>
                      <Text style={s.meta}>{quest.category} · {quest.location} · {quest.duration} Min.</Text>
                      <View style={s.row}>
                        <StatusBadge status={m.status} />
                        <RewardBadge reward={quest.reward} />
                      </View>
                      {action && <Text style={s.action}>{action}</Text>}
                    </Pressable>
                  </Link>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// Stile für die MyQuests-Komponente
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  emptyText: { color: "#6b7280", textAlign: "center" },
  section: { fontSize: 18, fontWeight: "700", marginTop: 8, marginBottom: 8 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  title: { fontSize: 17, fontWeight: "700" },
  meta: { color: "#6b7280", marginVertical: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  action: { color: "#4f46e5", fontWeight: "600", marginTop: 10 },
});