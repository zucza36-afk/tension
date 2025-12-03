# Konfiguracja Firebase

Ten przewodnik pomoże Ci skonfigurować Firebase dla trybu multiplayer online.

## Krok 1: Utworzenie projektu Firebase

1. Przejdź do [Firebase Console](https://console.firebase.google.com/)
2. Kliknij "Add project" (Dodaj projekt)
3. Wprowadź nazwę projektu (np. "napiecie-game")
4. Postępuj zgodnie z instrukcjami, aby utworzyć projekt

## Krok 2: Dodanie aplikacji webowej

1. W Firebase Console, wybierz swój projekt
2. Kliknij ikonę koła zębatego (⚙️) > **Project settings**
3. Przewiń w dół do sekcji **"Your apps"**
4. Kliknij ikonę **Web (</>)** aby dodać aplikację webową
5. Wprowadź nazwę aplikacji (np. "napiecie-game-web")
6. **NIE zaznaczaj** "Also set up Firebase Hosting" (możemy to zrobić później)
7. Kliknij **"Register app"**

## Krok 3: Skopiowanie konfiguracji

Po zarejestrowaniu aplikacji, zobaczysz obiekt konfiguracyjny JavaScript:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Krok 4: Włączenie usług Firebase

### Firestore Database

1. W Firebase Console, przejdź do **Firestore Database**
2. Kliknij **"Create database"**
3. Wybierz **"Start in test mode"** (dla rozwoju)
4. Wybierz lokalizację (np. `europe-west` dla Polski)
5. Kliknij **"Enable"**

### Realtime Database

1. W Firebase Console, przejdź do **Realtime Database**
2. Kliknij **"Create database"**
3. Wybierz lokalizację (np. `europe-west1`)
4. Wybierz **"Start in test mode"** (dla rozwoju)
5. Kliknij **"Enable"**

## Krok 5: Konfiguracja w aplikacji

### Opcja A: Używanie pliku .env (ZALECANE)

1. Skopiuj plik `.env.example` jako `.env`:
   ```bash
   cp .env.example .env
   ```

2. Otwórz plik `.env` i wypełnij wartościami z Firebase Console:
   ```env
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
   ```

3. Uruchom ponownie serwer deweloperski:
   ```bash
   npm run dev
   ```

### Opcja B: Bezpośrednia edycja config.js

1. Otwórz plik `src/firebase/config.js`
2. Zastąp wartości w obiekcie `firebaseConfig` wartościami z Firebase Console

## Krok 6: Reguły bezpieczeństwa (WAŻNE!)

### Firestore Database

W Firebase Console, przejdź do **Firestore Database** > **Rules** i ustaw:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Sesje - tylko uczestnicy mogą czytać/zapisywać
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null || 
        resource.data.status == 'active';
    }
    
    // Analityka - tylko uczestnicy sesji mogą zapisywać
    match /analytics/{sessionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Realtime Database

W Firebase Console, przejdź do **Realtime Database** > **Rules** i ustaw:

```json
{
  "rules": {
    "games": {
      "$sessionId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

**UWAGA**: Te reguły są dla trybu testowego. Dla produkcji powinieneś dodać autentykację.

## Weryfikacja konfiguracji

1. Uruchom aplikację: `npm run dev`
2. W konsoli przeglądarki powinieneś zobaczyć, że Firebase jest zainicjalizowane
3. Spróbuj utworzyć nową sesję online
4. Sprawdź w Firebase Console, czy dane są zapisywane w Firestore i Realtime Database

## Rozwiązywanie problemów

### "Firebase nie jest skonfigurowane"
- Sprawdź, czy wszystkie wartości w `.env` są wypełnione
- Upewnij się, że zmienne zaczynają się od `VITE_`
- Uruchom ponownie serwer deweloperski po zmianie `.env`

### "Permission denied"
- Sprawdź reguły bezpieczeństwa w Firebase Console
- Upewnij się, że Firestore i Realtime Database są włączone

### "Network request failed"
- Sprawdź, czy masz połączenie z internetem
- Sprawdź, czy domena jest dodana do dozwolonych w Firebase Console

## Produkcja

Dla środowiska produkcyjnego:
1. Zmień reguły bezpieczeństwa na bardziej restrykcyjne
2. Dodaj autentykację użytkowników
3. Rozważ użycie Firebase Hosting do hostowania aplikacji

