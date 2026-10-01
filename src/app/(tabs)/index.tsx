// Importiere die benötigten Hooks und Komponenten
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button, Loading, QuestList, useApp } from "../../lib";

// Die Home-Komponente zeigt die Liste der Quests an und ermöglicht das Filtern nach Kategorie und Suche
export default function Home() {
  const { quests, loading, error } = useApp();
  const router = useRouter();

  // lokaler State, wie im Dokument
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle");

  if (loading) return <Loading />;
  if (error) return <View style={s.center}><Text>Fehler beim Laden</Text></View>;

  const categories = ["Alle", ...Array.from(new Set(quests.map((q) => q.category)))];

  const filtered = quests.filter(
    (q) =>
      (selectedCategory === "Alle" || q.category === selectedCategory) &&
      q.title.toLowerCase().includes(search.toLowerCase())
  );

  // Rendern der Benutzeroberfläche
  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={s.content}>
        <TextInput
          style={s.input}
          placeholder="Quests suchen..."
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chips}>
          {categories.map((c) => (
            <Pressable
              key={c}
              onPress={() => setSelectedCategory(c)}
              style={[s.chip, selectedCategory === c && s.chipActive]}
            >
              <Text style={selectedCategory === c && { color: "#fff" }}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Button title="+ Quest erstellen" onPress={() => router.push("/create-quest" as any)} />

        <QuestList quests={filtered} />
      </ScrollView>
    </SafeAreaView>
  );
}
// Stile für die Home-Komponente
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, marginBottom: 12 },
  chips: { marginBottom: 8, flexGrow: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#fff", marginRight: 8 },
  chipActive: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
});