import { Link } from "expo-router";
import { Session } from "@supabase/supabase-js";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { supabase } from "./supabase";

// ---------- Typen ----------
export type User = { id: string; username: string; email: string; avatarUrl: string; coins: number; isAdmin: boolean };

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

export type ReviewItem = {
  id: string; imageUrl: string; comment: string;
  questTitle: string; reward: number; username: string;
};

export type ActivityItem = {
  id: string; questTitle: string; username: string;
  status: UserQuest["status"]; at: string;
};

export type CompletedItem = {
  id: string; questTitle: string; username: string; reward: number;
  completedAt: string; imageUrl: string; comment: string;
};

export type QuestStats = Record<string, { taken: number; done: number }>;

const EMPTY_USER: User = { id: "", username: "", email: "", avatarUrl: "", coins: 0, isAdmin: false };

const mapQuest = (r: any): Quest => ({
  id: r.id, title: r.title, description: r.description, category: r.category, location: r.location,
  imageUrl: r.image_url, reward: r.reward, difficulty: r.difficulty, duration: r.duration,
  creatorId: r.creator_id, createdAt: r.created_at,
});

const mapUserQuest = (r: any): UserQuest => ({
  id: r.id, userId: r.user_id, questId: r.quest_id, status: r.status,
  acceptedAt: r.accepted_at, completedAt: r.completed_at ?? undefined,
});

// Lokales Foto in Supabase Storage hochladen, gibt die öffentliche URL zurück
async function uploadImage(uri: string, userId: string): Promise<string> {
  if (uri.startsWith("http")) return uri;
  const res = await fetch(uri);
  const buffer = await res.arrayBuffer();
  const path = `${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("images").upload(path, buffer, { contentType: "image/jpeg" });
  if (error) throw new Error(error.message);
  return supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
}

// ---------- Globaler State ----------
type AppState = {
  user: User;
  session: Session | null;
  authLoading: boolean;
  quests: Quest[];
  myQuests: UserQuest[];
  reviews: ReviewItem[];
  activity: ActivityItem[];
  completed: CompletedItem[];
  stats: QuestStats;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (username: string, email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  createQuest: (q: Omit<Quest, "id" | "creatorId" | "createdAt">) => Promise<string | null>;
  acceptQuest: (questId: string) => Promise<string | null>;
  submitQuest: (userQuestId: string, imageUri: string, comment: string) => Promise<string | null>;
  reviewSubmission: (submissionId: string, approved: boolean) => Promise<string | null>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User>(EMPTY_USER);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [myQuests, setMyQuests] = useState<UserQuest[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [completed, setCompleted] = useState<CompletedItem[]>([]);
  const [stats, setStats] = useState<QuestStats>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session beim Start laden und auf Änderungen hören
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Alle Daten aus der Datenbank laden
  const refresh = useCallback(async () => {
    if (!session) return;
    const uid = session.user.id;

    const [p, q, uq, st] = await Promise.all([
      supabase.from("profiles").select("username, coins, is_admin").eq("id", uid).single(),
      supabase.from("quests").select("*").order("created_at", { ascending: false }),
      supabase.from("user_quests").select("*").eq("user_id", uid),
      supabase.rpc("quest_stats"),
    ]);

    if (q.error || uq.error) {
      setError("Fehler beim Laden");
      return;
    }
    setError(null);
    setQuests((q.data ?? []).map(mapQuest));
    setMyQuests((uq.data ?? []).map(mapUserQuest));

    const map: QuestStats = {};
    (st.data ?? []).forEach((x: any) => {
      map[x.quest_id] = { taken: Number(x.taken), done: Number(x.done) };
    });
    setStats(map);

    setUser({
      id: uid,
      email: session.user.email ?? "",
      avatarUrl: "",
      username: p.data?.username ?? "User",
      coins: p.data?.coins ?? 0,
      isAdmin: p.data?.is_admin ?? false,
    });

    if (p.data?.is_admin) {
      const [r, a, c] = await Promise.all([
        supabase
          .from("submissions")
          .select("id, image_url, comment, user_quests(quests(title, reward), profiles(username))")
          .eq("status", "pending")
          .order("submitted_at", { ascending: true }),
        supabase
          .from("user_quests")
          .select("id, status, accepted_at, completed_at, quests(title), profiles(username)")
          .neq("status", "completed")
          .order("accepted_at", { ascending: false })
          .limit(50),
        supabase
          .from("user_quests")
          .select("id, completed_at, quests(title, reward), profiles(username), submissions(image_url, comment, status)")
          .eq("status", "completed")
          .order("completed_at", { ascending: false }),
      ]);
      if (!r.error) {
        setReviews(
          (r.data ?? []).map((x: any) => ({
            id: x.id,
            imageUrl: x.image_url,
            comment: x.comment,
            questTitle: x.user_quests?.quests?.title ?? "?",
            reward: x.user_quests?.quests?.reward ?? 0,
            username: x.user_quests?.profiles?.username ?? "?",
          }))
        );
      }
      if (!a.error) {
        setActivity(
          (a.data ?? []).map((x: any) => ({
            id: x.id,
            questTitle: x.quests?.title ?? "?",
            username: x.profiles?.username ?? "?",
            status: x.status,
            at: x.completed_at ?? x.accepted_at,
          }))
        );
      }
      if (!c.error) {
        setCompleted(
          (c.data ?? []).map((x: any) => {
            const sub = (x.submissions ?? []).find((y: any) => y.status === "approved");
            return {
              id: x.id,
              questTitle: x.quests?.title ?? "?",
              username: x.profiles?.username ?? "?",
              reward: x.quests?.reward ?? 0,
              completedAt: x.completed_at,
              imageUrl: sub?.image_url ?? "",
              comment: sub?.comment ?? "",
            };
          })
        );
      }
    } else {
      setReviews([]);
      setActivity([]);
      setCompleted([]);
    }
  }, [session]);

  // Beim Anmelden laden, danach alle 10 Sekunden aktualisieren
  useEffect(() => {
    if (!session) {
      setUser(EMPTY_USER);
      setQuests([]);
      setMyQuests([]);
      setReviews([]);
      setActivity([]);
      setCompleted([]);
      setStats({});
      return;
    }
    setLoading(true);
    refresh().finally(() => setLoading(false));
    const timer = setInterval(refresh, 10000);
    return () => clearInterval(timer);
  }, [session, refresh]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  };

  const signUp = async (username: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
    return error?.message ?? null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const createQuest: AppState["createQuest"] = async (q) => {
    try {
      const imageUrl = q.imageUrl ? await uploadImage(q.imageUrl, user.id) : "";
      const { error } = await supabase.from("quests").insert({
        title: q.title, description: q.description, category: q.category, location: q.location,
        image_url: imageUrl, reward: q.reward, difficulty: q.difficulty, duration: q.duration,
      });
      if (error) return error.message;
      await refresh();
      return null;
    } catch (e: any) {
      return e.message ?? "Fehler";
    }
  };

  const acceptQuest: AppState["acceptQuest"] = async (questId) => {
    const { error } = await supabase.from("user_quests").insert({ quest_id: questId });
    if (error) return error.message;
    await refresh();
    return null;
  };

  const submitQuest: AppState["submitQuest"] = async (userQuestId, imageUri, comment) => {
    try {
      const imageUrl = await uploadImage(imageUri, user.id);
      const { error } = await supabase.rpc("submit_quest", {
        p_user_quest_id: userQuestId, p_image_url: imageUrl, p_comment: comment,
      });
      if (error) return error.message;
      await refresh();
      return null;
    } catch (e: any) {
      return e.message ?? "Fehler";
    }
  };

  const reviewSubmission: AppState["reviewSubmission"] = async (submissionId, approved) => {
    const { error } = await supabase.rpc("review_submission", {
      p_submission_id: submissionId, p_approved: approved,
    });
    if (error) return error.message;
    await refresh();
    return null;
  };

  return (
    <AppContext.Provider
      value={{
        user, session, authLoading, quests, myQuests, reviews, activity, completed, stats,
        loading, error, refresh,
        signIn, signUp, signOut, createQuest, acceptQuest, submitQuest, reviewSubmission,
      }}
    >
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
  const { stats } = useApp();
  const st = stats[quest.id] ?? { taken: 0, done: 0 };
  return (
    <Link href={`/quest/${quest.id}` as any} asChild>
      <Pressable style={s.card}>
        {!!quest.imageUrl && <Image source={{ uri: quest.imageUrl }} style={s.cardImage} />}
        <Text style={s.title}>{quest.title}</Text>
        <Text style={s.meta}>{quest.category} · {quest.location} · {quest.duration} Min. · {quest.difficulty}</Text>
        <RewardBadge reward={quest.reward} />
        <Text style={s.meta}>👥 {st.taken} angenommen · ✅ {st.done} erledigt</Text>
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