# Sidequest – Architektur

## 1. Komponenten

Die App besteht aus wiederverwendbaren Komponenten. Dadurch sehen die verschiedenen Screens einheitlich aus und Änderungen müssen nur an einer Stelle gemacht werden.

### Globale Komponenten

| Komponente  | Verwendung                                        |
| ----------- | ------------------------------------------------- |
| `Header`    | Titel, Zurück-Button und optionale Aktionen       |
| `BottomNav` | Navigation zwischen Home, Meine Quests und Profil |
| `Button`    | Primäre und sekundäre Aktionen                    |
| `Input`     | Texteingaben in Formularen                        |
| `Modal`     | Bestätigungen und Fehlermeldungen                 |
| `Loading`   | Anzeige während Daten geladen werden              |

### Quest-Komponenten

| Komponente    | Verwendung                                |
| ------------- | ----------------------------------------- |
| `QuestCard`   | Darstellung einer Quest in der Übersicht  |
| `QuestList`   | Liste aller verfügbaren Quests            |
| `QuestDetail` | Vollständige Informationen zu einer Quest |
| `RewardBadge` | Anzeige der Coin-Belohnung                |
| `StatusBadge` | Anzeige des aktuellen Quest-Status        |

### Formulare

Es gibt zwei zentrale Formulare:

**Quest erstellen**

* Titel
* Beschreibung
* Kategorie
* Ort
* Belohnung
* Bild

**Quest abgeben**

* Quest auswählen
* Foto/Nachweis hochladen
* Kommentar
* Abgabe bestätigen

---

# 2. Navigation

Wir verwenden eine Kombination aus **Bottom Navigation und Stack Navigation**.

Die Bottom Navigation enthält drei Hauptbereiche:

```text
┌──────────────────────────────────────┐
│                                      │
│              Aktueller Screen        │
│                                      │
├──────────────────────────────────────┤
│   🏠 Home     📋 Meine Quests    👤 Profil │
└──────────────────────────────────────┘
```

## Navigationshierarchie

```text
APP
│
├── 🏠 HOME
│   │
│   ├── Alle Quests
│   │    └── Quest Detail
│   │          └── Quest annehmen
│   │
│   └── + Quest erstellen
│          └── Quest erstellt
│
├── 📋 MEINE QUESTS
│   │
│   ├── Aktive Quests
│   │    └── Quest Detail
│   │
│   └── Quest abgeben
│          └── Abgabe bestätigt
│
└── 👤 PROFIL
     │
     ├── Benutzerinformationen
     └── Einstellungen
```

### Haupt-User-Flow

Der wichtigste Ablauf der App ist:

```text
Alle Quests
     │
     │ Quest auswählen
     ▼
Quest Detail
     │
     │ "Quest annehmen"
     ▼
Meine Quests
     │
     │ Quest erledigen
     ▼
Quest abgeben
     │
     │ Abgabe senden
     ▼
Abgeschlossen
```

Zusätzlich kann von der Übersicht aus eine neue Quest erstellt werden:

```text
Home
 │
 │ "+"
 ▼
Quest erstellen
 │
 │ "Quest erstellen"
 ▼
Home
```

---

# 3. Datenmodell

## User

Ein Benutzer besitzt ein Profil und kann Quests erstellen oder erledigen.

```js
{
  id: string,
  username: string,
  email: string,
  avatarUrl: string,
  coins: number
}
```

## Quest

Eine Quest enthält alle Informationen, die in der Übersicht und Detailansicht benötigt werden.

```js
{
  id: string,
  title: string,
  description: string,
  category: string,
  location: string,
  imageUrl: string,
  reward: number,
  difficulty: string,
  duration: number,
  creatorId: string,
  createdAt: Date
}
```

Beispiel:

```js
{
  id: "q123",
  title: "Stadtpark Clean-Up",
  description: "Sammle Müll im Stadtpark.",
  category: "Umwelt",
  location: "Zürich",
  imageUrl: "...",
  reward: 10,
  difficulty: "easy",
  duration: 30,
  creatorId: "u42",
  createdAt: "2026-09-30"
}
```

## UserQuest

Dieses Objekt verbindet einen Benutzer mit einer Quest.

```js
{
  id: string,
  userId: string,
  questId: string,
  status: "accepted" | "submitted" | "completed",
  acceptedAt: Date,
  completedAt: Date
}
```

## QuestSubmission

Speichert die Abgabe einer erledigten Quest.

```js
{
  id: string,
  userQuestId: string,
  imageUrl: string,
  comment: string,
  submittedAt: Date,
  status: "pending" | "approved" | "rejected"
}
```

---

# 4. Zustand

Nicht alle Daten müssen global gespeichert werden.

## Lokaler State

Daten, die nur auf einem Screen benötigt werden, bleiben lokal.

### Quest erstellen

```js
title
description
category
location
reward
image
```

### Quest abgeben

```js
selectedQuest
image
comment
```

### Home

```js
search
selectedCategory
selectedFilter
```

Diese Daten werden nicht mit anderen Screens geteilt.

---

## Globaler State

Daten, die mehrere Screens benötigen, werden global verwaltet.

```js
{
  user,
  quests,
  myQuests,
  loading,
  error
}
```

Beispielsweise muss eine angenommene Quest sowohl auf **Home** als auch unter **Meine Quests** verfügbar sein.

---

# 5. API

Die App kommuniziert mit dem Backend über eine REST-API.

## Quests

```text
GET    /api/quests
GET    /api/quests/:id
POST   /api/quests
```

## User Quests

```text
GET    /api/users/:userId/quests
POST   /api/quests/:id/accept
```

## Abgaben

```text
POST   /api/submissions
GET    /api/submissions/:id
```

---

# 6. Side Effects

API-Aufrufe werden nur bei Aktionen ausgeführt, bei denen Daten geladen oder verändert werden.

### Quests laden

```text
App öffnen
    ↓
GET /api/quests
    ↓
Quests im globalen State speichern
    ↓
QuestList anzeigen
```

### Quest erstellen

```text
Formular ausfüllen
    ↓
"Quest erstellen"
    ↓
POST /api/quests
    ↓
Neue Quest speichern
    ↓
Zur Home-Seite
```

### Quest annehmen

```text
"Quest annehmen"
    ↓
POST /api/quests/:id/accept
    ↓
UserQuest erstellen
    ↓
Meine Quests aktualisieren
```

### Quest abgeben

```text
Formular ausfüllen
    ↓
POST /api/submissions
    ↓
Submission speichern
    ↓
Quest Status = "submitted"
```

---

# 7. Local Storage

Der Local Storage wird nur für Daten verwendet, die auch nach einem Neustart der App erhalten bleiben sollen.

```text
authToken
userId
selectedFilter
```

Die eigentlichen Quests werden **nicht dauerhaft im Local Storage gespeichert**, sondern vom Backend geladen.

---

# 8. Lade- und Fehlerzustände

Jeder API-Aufruf besitzt drei mögliche Zustände:

```text
             API Request
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
     Loading    Success    Error
        │         │         │
     Spinner    Daten    Fehlermeldung
                          + Retry
```

Beispiele:

* Während Quests geladen werden → Loading-Anzeige
* Keine Quests vorhanden → „Keine Quests gefunden“
* API nicht erreichbar → „Fehler beim Laden“
* Abgabe fehlgeschlagen → Fehlermeldung + erneut versuchen

---

# 9. Architekturübersicht

```text
                    ┌──────────────┐
                    │   Backend    │
                    │     API      │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Global State │
                    │              │
                    │ User         │
                    │ Quests       │
                    │ MyQuests     │
                    └──────┬───────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          ┌──────┐    ┌───────────┐   ┌────────┐
          │ Home │    │Meine      │   │ Profil │
          │      │    │Quests     │   │        │
          └──┬───┘    └─────┬─────┘   └────────┘
             │              │
             ▼              ▼
       Quest Detail    Quest abgeben
             │
             ▼
       Quest annehmen
```

## Zusammenfassung

Die Architektur ist bewusst einfach gehalten:

* **Bottom Navigation** für die drei Hauptbereiche
* **Stack Navigation** für Detailseiten und Formulare
* Wiederverwendbare **Quest- und Form-Komponenten**
* **Globaler State** für User und Quest-Daten
* **Lokaler State** für Formulare und Filter
* **REST-API** für dauerhafte Daten
* **Local Storage** für kleine lokale Einstellungen
* Klare Behandlung von **Loading-, Success- und Error-Zuständen**
