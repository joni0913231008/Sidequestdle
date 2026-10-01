import { Link } from "expo-router";
import { createContext, ReactNode, useContext, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";

// ---------- Typen ----------
export type User = { id: string; username: string; email: string; avatarUrl: string; coins: number };

export type Quest = {
  id: string; title: string; description: string; category: string; location: string;
  imageUrl: string; reward: number; difficulty: string; duration: number;
  creatorId: string; createdAt: string;
};

export type UserQuest = {
  id: string; userId: string; questId: string;
  status: "accepted" | "submitted" | "completed";
  acceptedAt: string; completedAt?: string;
};

export type Submission = {
  id: string; userQuestId: string; imageUrl: string; comment: string;
  submittedAt: string; status: "pending" | "approved" | "rejected";
};

// ---------- Testdaten ----------
const TEST_USER: User = { id: "u1", username: "Demo", email: "demo@sidequest.app", avatarUrl: "", coins: 0 };

const TEST_QUESTS: Quest[] = [
  {
    id: "q1",
    title: "Watermelon devourer",
    description: "Eat a watermelon whole in an hour",
    category: "food",
    location: "NA",
    imageUrl: "https://picsum.photos/seed/q1/600/400",
    reward: 15,
    difficulty: "normal",
    duration: 60,
    creatorId: "u42",
    createdAt: "2026-09-30",
  },
];

// ---------- Globaler State ----------
type AppState = {
  user: User;
  quests: Quest[];
  myQuests: UserQuest[];
  loading: boolean;
  error: string | null;
  createQuest: (q: Omit<Quest, "id" | "creatorId" | "createdAt">) => void;
  acceptQuest: (questId: string) => void;
  submitQuest: (userQuestId: string, imageUrl: string, comment: string) => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user] = useState(TEST_USER);
  const [quests, setQuests] = useState(TEST_QUESTS);
  const [myQuests, setMyQuests] = useState<UserQuest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const createQuest: AppState["createQuest"] = (q) =>
    setQuests((prev) => [
      { ...q, id: `q${Date.now()}`, creatorId: user.id, createdAt: new Date().toISOString() },
      ...prev,
    ]);

  const acceptQuest = (questId: string) => {
    if (myQuests.some((m) => m.questId === questId)) return;
    setMyQuests((prev) => [
      ...prev,
      { id: `uq${Date.now()}`, userId: user.id, questId, status: "accepted", acceptedAt: new Date().toISOString() },
    ]);
  };

  const submitQuest = (userQuestId: string, imageUrl: string, comment: string) => {
    setSubmissions((prev) => [
      ...prev,
      { id: `s${Date.now()}`, userQuestId, imageUrl, comment, submittedAt: new Date().toISOString(), status: "pending" },
    ]);
    setMyQuests((prev) => prev.map((m) => (m.id === userQuestId ? { ...m, status: "submitted" } : m)));
  };

  return (
    <AppContext.Provider value={{ user, quests, myQuests, loading, error, createQuest, acceptQuest, submitQuest }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp muss innerhalb von AppProvider verwendet werden");
  return ctx;
}

// ---------- Komponenten ----------
export function Button({ title, onPress, secondary }: { title: string; onPress: () => void; secondary?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[s.button, secondary && s.buttonSecondary]}>
      <Text style={[s.buttonText, secondary && { color: "#4f46e5" }]}>{title}</Text>
    </Pressable>
  );
}

export function Loading() {
  return <View style={s.center}><ActivityIndicator size="large" /></View>;
}

export function RewardBadge({ reward }: { reward: number }) {
  return <Text style={s.reward}>🪙 {reward}</Text>;
}

export function StatusBadge({ status }: { status: UserQuest["status"] }) {
  const label = { accepted: "Angenommen", submitted: "Abgegeben", completed: "Abgeschlossen" }[status];
  return <Text style={s.status}>{label}</Text>;
}

export function QuestCard({ quest }: { quest: Quest }) {
  return (
    <Link href={`/quest/${quest.id}` as any} asChild>
      <Pressable style={s.card}>
        {!!quest.imageUrl && <Image source={{ uri: quest.imageUrl }} style={s.cardImage} />}
        <Text style={s.title}>{quest.title}</Text>
        <Text style={s.meta}>{quest.category} · {quest.location} · {quest.duration} Min.</Text>
        <RewardBadge reward={quest.reward} />
      </Pressable>
    </Link>
  );
}

export function QuestList({ quests }: { quests: Quest[] }) {
  if (quests.length === 0) return <View style={s.center}><Text>Keine Quests gefunden</Text></View>;
  return <View>{quests.map((q) => <QuestCard key={q.id} quest={q} />)}</View>;
}

// ---------- Stile ----------
const s = StyleSheet.create({
  button: { backgroundColor: "#4f46e5", padding: 14, borderRadius: 10, alignItems: "center", marginVertical: 6 },
  buttonSecondary: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#4f46e5" },
  buttonText: { color: "#fff", fontWeight: "600" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  cardImage: { width: "100%", height: 150, borderRadius: 8, marginBottom: 10 },
  title: { fontSize: 17, fontWeight: "700" },
  meta: { color: "#6b7280", marginVertical: 4 },
  reward: { fontWeight: "600" },
  status: { color: "#4f46e5", fontWeight: "600" },
});