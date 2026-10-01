import { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Button, RewardBadge, StatusBadge, useApp } from "../../lib";

export default function QuestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { quests, myQuests, acceptQuest, submitQuest } = useApp();
  const router = useRouter();

  // lokaler State fuer das Abgabe-Formular
  const [image, setImage] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const quest = quests.find((q) => q.id === id);
  const userQuest = myQuests.find((m) => m.questId === id);

  if (!quest) {
    return <View style={s.center}><Text>Quest nicht gefunden</Text></View>;
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleAccept = () => {
    acceptQuest(quest.id);
    router.replace("/my-quests" as any);
  };

  const handleSubmit = () => {
    if (!userQuest) return;
    if (!image) {
      Alert.alert("Nachweis fehlt", "Bitte lade ein Foto als Nachweis hoch.");
      return;
    }
    submitQuest(userQuest.id, image, comment);
    Alert.alert("Abgabe gesendet", "Deine Abgabe wird geprüft.");
  };

  return (
    <ScrollView contentContainerStyle={s.content}>
      <Text style={s.title}>{quest.title}</Text>
      <Text style={s.meta}>
        {quest.category} · {quest.location} · {quest.duration} Min. · {quest.difficulty}
      </Text>
      <View style={s.row}>
        <RewardBadge reward={quest.reward} />
        {userQuest && <StatusBadge status={userQuest.status} />}
      </View>
      <Text style={s.description}>{quest.description}</Text>

      {!userQuest && <Button title="Quest annehmen" onPress={handleAccept} />}

      {userQuest?.status === "accepted" && (
        <View style={s.form}>
          <Text style={s.section}>Quest abgeben</Text>
          <Button title={image ? "Foto ändern" : "Foto auswählen"} onPress={pickImage} secondary />
          {image && <Image source={{ uri: image }} style={s.preview} />}
          <TextInput
            style={s.input}
            placeholder="Kommentar (optional)"
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <Button title="Abgabe senden" onPress={handleSubmit} />
        </View>
      )}

      {userQuest?.status === "submitted" && (
        <Text style={s.info}>Deine Abgabe wurde eingereicht und wird geprüft.</Text>
      )}
      {userQuest?.status === "completed" && (
        <Text style={s.info}>Diese Quest ist abgeschlossen. 🎉</Text>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700" },
  meta: { color: "#6b7280", marginVertical: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  description: { fontSize: 16, marginBottom: 16 },
  form: { marginTop: 8 },
  section: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  preview: { width: "100%", height: 200, borderRadius: 10, marginVertical: 8 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, minHeight: 80, marginVertical: 8, textAlignVertical: "top" },
  info: { color: "#4f46e5", fontWeight: "600", marginTop: 8 },
});