import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, useApp } from "../lib";

export default function Login() {
  const { signIn, signUp } = useApp();
  const [register, setRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || password.length < 6 || (register && !username.trim())) {
      Alert.alert("Angaben fehlen", "Bitte alle Felder ausfüllen. Das Passwort braucht mind. 6 Zeichen.");
      return;
    }
    setBusy(true);
    const error = register
      ? await signUp(username.trim(), email.trim(), password)
      : await signIn(email.trim(), password);
    setBusy(false);
    if (error) Alert.alert("Fehler", error);
  };

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.content}>
        <Text style={s.title}>Sidequest</Text>
        <Text style={s.subtitle}>{register ? "Konto erstellen" : "Anmelden"}</Text>

        {register && (
          <TextInput style={s.input} placeholder="Benutzername" value={username} onChangeText={setUsername} autoCapitalize="none" />
        )}
        <TextInput style={s.input} placeholder="E-Mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={s.input} placeholder="Passwort" value={password} onChangeText={setPassword} secureTextEntry />

        <Button title={busy ? "Bitte warten..." : register ? "Registrieren" : "Anmelden"} onPress={submit} />
        <Button
          title={register ? "Ich habe schon ein Konto" : "Neues Konto erstellen"}
          onPress={() => setRegister(!register)}
          secondary
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 32, fontWeight: "800", color: "#4f46e5", textAlign: "center" },
  subtitle: { fontSize: 18, textAlign: "center", marginBottom: 24, color: "#6b7280" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, marginBottom: 10 },
});