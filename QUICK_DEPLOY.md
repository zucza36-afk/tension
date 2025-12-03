# Szybkie wdrożenie aplikacji online

## Metoda 1: Firebase Hosting (Najszybsze - 5 minut)

### Krok 1: Zainstaluj Firebase CLI
```bash
npm install -g firebase-tools
```

### Krok 2: Zaloguj się
```bash
firebase login
```

### Krok 3: Włącz Hosting w Firebase Console
1. Przejdź do https://console.firebase.google.com/project/napiecie-game/hosting
2. Kliknij "Get started"

### Krok 4: Wdróż aplikację
```bash
npm run deploy
```

**Gotowe!** Twoja aplikacja będzie dostępna pod adresem:
- https://napiecie-game.web.app
- https://napiecie-game.firebaseapp.com

---

## Metoda 2: Vercel (Najprostsze - 3 minuty)

### Krok 1: Zaloguj się
1. Przejdź do https://vercel.com
2. Zaloguj się przez GitHub

### Krok 2: Importuj projekt
1. Kliknij "Add New Project"
2. Wybierz repozytorium z aplikacją
3. Vercel automatycznie wykryje Vite

### Krok 3: Dodaj zmienne środowiskowe
W sekcji "Environment Variables" dodaj:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_FIREBASE_DATABASE_URL`

(Wszystkie wartości znajdziesz w pliku `.env`)

### Krok 4: Wdróż
Kliknij "Deploy"

**Gotowe!** Otrzymasz link do aplikacji.

---

## Po wdrożeniu

1. **Sprawdź, czy aplikacja działa:**
   - Otwórz link w przeglądarce
   - Sprawdź konsolę przeglądarki (F12) - nie powinno być błędów Firebase

2. **Dodaj domenę do Firebase:**
   - Firebase Console → Authentication → Settings → Authorized domains
   - Dodaj swoją domenę (np. `napiecie-game.vercel.app`)

3. **Sprawdź reguły bezpieczeństwa:**
   - Firestore Database → Rules
   - Realtime Database → Rules
   - Upewnij się, że są odpowiednio skonfigurowane

---

## Aktualizacje

### Firebase Hosting
```bash
npm run deploy
```

### Vercel
- Automatycznie przy każdym pushu do GitHub
- Lub ręcznie w panelu Vercel

---

## Pomoc

Szczegółowe instrukcje znajdziesz w pliku `DEPLOYMENT.md`

