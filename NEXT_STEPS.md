# Co dalej? - Następne kroki

## ✅ Co już zostało zrobione:

1. ✅ Aplikacja z funkcją multiplayer online (Firebase)
2. ✅ Konfiguracja Firebase
3. ✅ Kod wypchnięty na GitHub: https://github.com/zucza36-afk/tension
4. ✅ Konfiguracja hostingu (Vercel, Firebase Hosting)

## 🎯 Następne kroki (w kolejności priorytetu):

### 1. Wdróż aplikację online (ZALECANE - 10 minut)

Aplikacja jest gotowa do wdrożenia. Wybierz jedną z opcji:

#### Opcja A: Vercel (Najprostsze)

1. Przejdź do https://vercel.com
2. Zaloguj się przez GitHub
3. Kliknij **"Add New Project"**
4. Wybierz repozytorium `zucza36-afk/tension`
5. **Dodaj zmienne środowiskowe:**
   - `VITE_FIREBASE_API_KEY` = `AIzaSyAKsnZFoONtVq2m420MHvGv5S__YmdoI-E`
   - `VITE_FIREBASE_AUTH_DOMAIN` = `napiecie-game.firebaseapp.com`
   - `VITE_FIREBASE_PROJECT_ID` = `napiecie-game`
   - `VITE_FIREBASE_STORAGE_BUCKET` = `napiecie-game.firebasestorage.app`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` = `823835042612`
   - `VITE_FIREBASE_APP_ID` = `1:823835042612:web:28f411d70e924e81f4fb61`
   - `VITE_FIREBASE_MEASUREMENT_ID` = `G-L2MPQCLQ1S`
   - `VITE_FIREBASE_DATABASE_URL` = `https://napiecie-game-default-rtdb.europe-west1.firebasedatabase.app`
6. Kliknij **"Deploy"**

**Szczegóły:** Zobacz `VERCEL_DEPLOY.md`

#### Opcja B: Firebase Hosting

```bash
# Zainstaluj Firebase CLI
npm install -g firebase-tools

# Zaloguj się
firebase login

# Wdróż
npm run deploy
```

**Szczegóły:** Zobacz `DEPLOYMENT.md`

### 2. Sprawdź Firebase Database

Upewnij się, że masz włączone:

1. **Firestore Database:**
   - Przejdź do: https://console.firebase.google.com/project/napiecie-game/firestore
   - Jeśli nie jest włączone, kliknij "Create database"
   - Wybierz "Start in test mode"

2. **Realtime Database:**
   - Przejdź do: https://console.firebase.google.com/project/napiecie-game/database
   - Jeśli nie jest włączone, kliknij "Create database"
   - Wybierz lokalizację (np. `europe-west1`)
   - Wybierz "Start in test mode"

3. **Sprawdź Database URL:**
   - W ustawieniach Realtime Database znajdź "Database URL"
   - Jeśli różni się od tego w `.env`, zaktualizuj `VITE_FIREBASE_DATABASE_URL`

### 3. Dodaj domenę do Firebase (po wdrożeniu)

Po wdrożeniu na Vercel/Firebase Hosting:

1. Przejdź do: https://console.firebase.google.com/project/napiecie-game/settings/general
2. W sekcji "Your apps" kliknij ikonę koła zębatego
3. W "Authorized domains" dodaj swoją domenę (np. `napiecie-game.vercel.app`)

### 4. Przetestuj aplikację online

1. Otwórz wdrożoną aplikację
2. Sprawdź konsolę przeglądarki (F12) - nie powinno być błędów Firebase
3. Spróbuj utworzyć sesję online
4. Otwórz aplikację na innym urządzeniu/przeglądarce
5. Dołącz do sesji używając kodu sesji
6. Sprawdź, czy gracze synchronizują się w czasie rzeczywistym

### 5. Opcjonalne ulepszenia

- **Dostosuj design** - zmień kolory, style w `tailwind.config.js`
- **Dodaj więcej kart** - edytuj `src/data/cards.js`
- **Dodaj tłumaczenia** - rozszerz `src/utils/translations.js`
- **Dodaj domenę własną** - skonfiguruj w Vercel/Firebase Hosting
- **Skonfiguruj reguły bezpieczeństwa** - dostosuj reguły Firestore/Realtime Database

## 📚 Przydatne linki

- **Repozytorium GitHub:** https://github.com/zucza36-afk/tension
- **Firebase Console:** https://console.firebase.google.com/project/napiecie-game
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Dokumentacja Firebase:** https://firebase.google.com/docs
- **Dokumentacja Vercel:** https://vercel.com/docs

## 🐛 Rozwiązywanie problemów

### Aplikacja nie ładuje się online
- Sprawdź, czy wszystkie zmienne środowiskowe są ustawione
- Sprawdź konsolę przeglądarki (F12)
- Sprawdź logi w Vercel/Firebase Hosting

### Firebase nie działa
- Sprawdź, czy Firestore i Realtime Database są włączone
- Sprawdź, czy domena jest dodana do Authorized domains
- Sprawdź reguły bezpieczeństwa

### Multiplayer nie działa
- Sprawdź, czy Realtime Database jest włączone
- Sprawdź reguły bezpieczeństwa Realtime Database
- Sprawdź konsolę przeglądarki pod kątem błędów

## 🎉 Gratulacje!

Twoja aplikacja jest gotowa! Po wdrożeniu będzie dostępna dla wszystkich w internecie.

Masz pytania? Sprawdź dokumentację w plikach:
- `FIREBASE_SETUP.md` - konfiguracja Firebase
- `VERCEL_DEPLOY.md` - wdrożenie na Vercel
- `DEPLOYMENT.md` - ogólne wdrożenie
- `QUICK_DEPLOY.md` - szybki start

