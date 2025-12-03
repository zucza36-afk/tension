# Szybkie wdrożenie - Instrukcja krok po kroku

## ✅ Build zakończony pomyślnie!

Aplikacja jest gotowa do wdrożenia. Masz dwie opcje:

## Opcja 1: Vercel (NAJPROSTSZE - 3 minuty)

### Metoda A: Przez interfejs webowy (ZALECANE)

1. **Przejdź do:** https://vercel.com
2. **Zaloguj się** przez GitHub
3. **Kliknij "Add New Project"**
4. **Importuj repozytorium:**
   - Wybierz `zucza36-afk/tension`
   - Kliknij "Import"
5. **Konfiguracja (Vercel automatycznie wykryje Vite):**
   - Framework Preset: `Vite` ✅
   - Build Command: `npm run build` ✅
   - Output Directory: `dist` ✅
   - Install Command: `npm install` ✅
6. **DODAJ ZMIENNE ŚRODOWISKOWE** (WAŻNE!):
   
   W sekcji "Environment Variables" kliknij "Add" i dodaj wszystkie:
   
   ```
   VITE_FIREBASE_API_KEY = AIzaSyAKsnZFoONtVq2m420MHvGv5S__YmdoI-E
   VITE_FIREBASE_AUTH_DOMAIN = napiecie-game.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = napiecie-game
   VITE_FIREBASE_STORAGE_BUCKET = napiecie-game.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID = 823835042612
   VITE_FIREBASE_APP_ID = 1:823835042612:web:28f411d70e924e81f4fb61
   VITE_FIREBASE_MEASUREMENT_ID = G-L2MPQCLQ1S
   VITE_FIREBASE_DATABASE_URL = https://napiecie-game-default-rtdb.europe-west1.firebasedatabase.app
   ```
   
   **Dla każdej zmiennej wybierz:** Production, Preview, Development (wszystkie trzy)
   
7. **Kliknij "Deploy"**
8. **Poczekaj 1-2 minuty** na zakończenie wdrożenia
9. **Otrzymasz link** do aplikacji (np. `https://tension-xxx.vercel.app`)

### Metoda B: Przez CLI

```bash
cd /home/cezary/Pobrane/napiecie-game

# Zaloguj się (jeśli jeszcze nie)
npx vercel login

# Wdróż
npx vercel

# Postępuj zgodnie z instrukcjami
# Następnie dodaj zmienne środowiskowe:
npx vercel env add VITE_FIREBASE_API_KEY
# Wklej: AIzaSyAKsnZFoONtVq2m420MHvGv5S__YmdoI-E
# Wybierz: Production, Preview, Development

# Powtórz dla wszystkich zmiennych, potem:
npx vercel --prod
```

## Opcja 2: Firebase Hosting

```bash
cd /home/cezary/Pobrane/napiecie-game

# Zainstaluj Firebase CLI (jeśli jeszcze nie)
npm install -g firebase-tools

# Zaloguj się
firebase login

# Wdróż
npm run deploy
```

Aplikacja będzie dostępna pod:
- https://napiecie-game.web.app
- https://napiecie-game.firebaseapp.com

## Po wdrożeniu

### 1. Dodaj domenę do Firebase

1. Przejdź do: https://console.firebase.google.com/project/napiecie-game/settings/general
2. W sekcji "Your apps" kliknij ikonę koła zębatego
3. W "Authorized domains" dodaj swoją domenę Vercel (np. `tension-xxx.vercel.app`)

### 2. Sprawdź aplikację

1. Otwórz link otrzymany od Vercel/Firebase
2. Sprawdź konsolę przeglądarki (F12) - nie powinno być błędów Firebase
3. Kliknij "Utwórz grę" - powinno działać!

### 3. Sprawdź Firebase Database

Upewnij się, że masz włączone:
- **Firestore Database:** https://console.firebase.google.com/project/napiecie-game/firestore
- **Realtime Database:** https://console.firebase.google.com/project/napiecie-game/database

## Rozwiązywanie problemów

### "Firebase nie jest skonfigurowane"
- Sprawdź, czy wszystkie zmienne środowiskowe są dodane w Vercel
- Upewnij się, że zmienne zaczynają się od `VITE_`
- Po dodaniu zmiennych, wdróż ponownie

### "404 Not Found" na podstronach
- Sprawdź, czy `vercel.json` jest w katalogu głównym
- Upewnij się, że rewrites są skonfigurowane

### Błędy budowania
- Sprawdź logi w Vercel Dashboard
- Upewnij się, że Node.js wersja jest >= 16

## Automatyczne wdrożenia

Po pierwszym wdrożeniu:
- **Vercel:** Automatycznie wdraża przy każdym pushu do GitHub
- **Firebase:** Użyj `npm run deploy` po każdej zmianie

