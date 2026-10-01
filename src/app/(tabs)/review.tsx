import { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, StatusBadge, useApp } from "../../lib";

export default function Review() {
  const { user, reviews, activity, completed, reviewSubmission, refresh } = useApp();
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!user.isAdmin) {
    return (
      <SafeAreaView style={s.screen} edges={["top"]}>
        <View style={s.center}>
          <Text style={s.lock}>🔒</Text>
          <Text style={s.heading}>Kein Admin-Zugriff</Text>
          <Text style={s.empty}>Dieser Bereich ist nur für Admins sichtbar.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handle = async (id: string, approved: boolean) => {
    setBusyId(id);
    const err = await reviewSubmission(id, approved);
    setBusyId(null);

    if (err) {
      Alert.alert("Prüfung fehlgeschlagen", err);
      return;
    }

    Alert.alert(
      approved ? "Quest genehmigt 🎉" : "Quest abgelehnt",
      approved ? "Die Belohnung wurde dem Benutzer gutgeschrieben." : "Der Benutzer kann die Quest erneut abgeben."
    );
  };

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.heading}>Zu prüfen ({reviews.length})</Text>
            <Text style={s.subheading}>Abgaben anderer eingeloggter Benutzer</Text>
          </View>
          <Button title="↻" onPress={refresh} secondary />
        </View>

        {reviews.length === 0 && (
          <View style={s.emptyCard}>
            <Text style={s.emptyTitle}>Keine offenen Abgaben</Text>
            <Text style={s.empty}>Neue Abgaben erscheinen hier automatisch.</Text>
          </View>
        )}

        {reviews.map((r) => (
          <View key={r.id} style={s.card}>
            <Text style={s.title}>{r.questTitle}</Text>
            <Text style={s.meta}>von {r.username} · 🪙 {r.reward}</Text>

            {!!r.imageUrl ? (
              <Image
                source={{ uri: r.imageUrl }}
                style={s.image}
                resizeMode="cover"
                onError={() => console.warn("Review-Bild konnte nicht geladen werden:", r.imageUrl)}
              />
            ) : (
              <View style={s.noImage}>
                <Text>Kein Bild vorhanden</Text>
              </View>
            )}

            {!!r.comment && <Text style={s.comment}>„{r.comment}“</Text>}

            <Button
              title={busyId === r.id ? "Wird verarbeitet..." : `Genehmigen · +${r.reward} Coins`}
              onPress={() => handle(r.id, true)}
            />
            <Button
              title={busyId === r.id ? "Bitte warten..." : "Ablehnen"}
              onPress={() => handle(r.id, false)}
              secondary
            />
          </View>
        ))}

        <Text style={[s.heading, { marginTop: 20 }]}>Aktivität</Text>
        {activity.length === 0 && <Text style={s.empty}>Noch keine Aktivitäten.</Text>}
        {activity.map((a) => (
          <View key={a.id} style={s.activityCard}>
            <View style={s.activityTop}>
              <Text style={s.title}>{a.username}</Text>
              <StatusBadge status={a.status} />
            </View>
            <Text style={s.meta}>{a.questTitle}</Text>
            {!!a.at && <Text style={s.date}>{new Date(a.at).toLocaleString("de-CH")}</Text>}
          </View>
        ))}

        <Text style={[s.heading, { marginTop: 20 }]}>Abgeschlossen & bezahlt</Text>
        {completed.length === 0 && <Text style={s.empty}>Noch keine abgeschlossenen Quests.</Text>}
        {completed.map((c) => (
          <View key={c.id} style={s.card}>
            <View style={s.activityTop}>
              <Text style={s.title}>{c.questTitle}</Text>
              <Text style={s.paid}>✓ +{c.reward}</Text>
            </View>
            <Text style={s.meta}>{c.username}</Text>
            {!!c.completedAt && <Text style={s.date}>{new Date(c.completedAt).toLocaleString("de-CH")}</Text>}
            {!!c.imageUrl && <Image source={{ uri: c.imageUrl }} style={s.smallImage} />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  lock: { fontSize: 40, marginBottom: 8 },
  heading: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subheading: { color: "#6b7280", marginBottom: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  empty: { color: "#6b7280" },
  emptyCard: {
    backgroundColor: "#fff", padding: 18, borderRadius: 12, marginBottom: 12,
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
  card: {
    backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12,
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  activityCard: {
    backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  title: { fontSize: 17, fontWeight: "700" },
  meta: { color: "#6b7280", marginVertical: 4 },
  date: { color: "#9ca3af", fontSize: 12, marginTop: 2 },
  image: { width: "100%", height: 260, borderRadius: 10, marginVertical: 10, backgroundColor: "#eee" },
  smallImage: { width: "100%", height: 160, borderRadius: 10, marginTop: 8 },
  noImage: {
    height: 120, borderRadius: 10, marginVertical: 10, alignItems: "center",
    justifyContent: "center", backgroundColor: "#f3f4f6",
  },
  comment: { fontStyle: "italic", marginBottom: 8, lineHeight: 21 },
  activityTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  paid: { color: "#16a34a", fontWeight: "700" },
});
