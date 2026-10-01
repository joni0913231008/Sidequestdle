// This component allows users to create a new quest by filling out a form with the necessary details, including title, description, category, location, reward, and an optional image. Upon submission, the quest is created and the user is navigated back to the previous screen.
import { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Button, useApp } from "../lib";
// Rendern der CreateQuest-Komponente
export default function CreateQuest() {
  const { createQuest } = useApp();
  const router = useRouter();

  // lokaler State, wie im Dokument
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [reward, setReward] = useState("10");
  const [image, setImage] = useState<string | null>(null);
// Funktion zum Auswählen eines Bildes aus der Galerie
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };
// Funktion zum Erstellen der Quest
  const handleCreate = () => {
    const rewardNumber = parseInt(reward, 10);
    if (!title.trim() || !description.trim() || !category.trim()) {
      Alert.alert("Angaben fehlen", "Titel, Beschreibung und Kategorie sind Pflicht.");
      return;
    }
    // Validierung der Belohnung
    if (isNaN(rewardNumber) || rewardNumber <= 0) {
      Alert.alert("Ungültige Belohnung", "Die Belohnung muss eine Zahl über 0 sein.");
      return;
    }
    createQuest({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      location: location.trim(),
      imageUrl: image ?? "",
      reward: rewardNumber,
      difficulty: "easy",
      duration: 30,
    });
    router.back();
  };
// Rendern der Benutzeroberfläche
  return (
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.label}>Titel *</Text>
      <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="z.B. Stadtpark Clean-Up" />

      <Text style={s.label}>Beschreibung *</Text>
      <TextInput
        style={[s.input, s.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder="Was soll erledigt werden?"
        multiline
      />

      <Text style={s.label}>Kategorie *</Text>
      <TextInput style={s.input} value={category} onChangeText={setCategory} placeholder="z.B. Umwelt" />

      <Text style={s.label}>Ort</Text>
      <TextInput style={s.input} value={location} onChangeText={setLocation} placeholder="z.B. Zürich" />

      <Text style={s.label}>Belohnung (Coins) *</Text>
      <TextInput style={s.input} value={reward} onChangeText={setReward} keyboardType="number-pad" />

      <Text style={s.label}>Bild</Text>
      <Button title={image ? "Bild ändern" : "Bild auswählen"} onPress={pickImage} secondary />
      {image && <Image source={{ uri: image }} style={s.preview} />}

      <Button title="Quest erstellen" onPress={handleCreate} />
    </ScrollView>
  );
}
// Stile für die CreateQuest-Komponente
const s = StyleSheet.create({
  content: { padding: 16 },
  label: { fontWeight: "600", marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12 },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  preview: { width: "100%", height: 180, borderRadius: 10, marginVertical: 8 },
});