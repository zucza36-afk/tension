# Wdrożenie na Vercel - Instrukcja krok po kroku

## Metoda 1: Przez interfejs webowy Vercel (ZALECANE - Najprostsze)

### Krok 1: Przygotuj repozytorium Git (opcjonalnie, ale zalecane)

```bash
# Jeśli jeszcze nie masz repozytorium Git
git init
git add .
git commit -m "Initial commit"

# Utwórz repozytorium na GitHub/GitLab/Bitbucket i dodaj remote
# UWAGA: Zamień "tension" na nazwę Twojego repozytorium, jeśli jest inna
git remote add origin https://github.com/twoja-nazwa/tension.git
git push -u origin main
```

### Krok 2: Zaloguj się do Vercel

1. Przejdź do https://vercel.com
2. Kliknij **"Sign Up"** lub **"Log In"**
3. Zaloguj się przez GitHub, GitLab lub Bitbucket

### Krok 3: Importuj projekt

1. Kliknij **"Add New Project"** (lub **"New Project"**)
2. Wybierz swoje repozytorium z GitHub/GitLab/Bitbucket
   - Jeśli nie widzisz repozytorium, kliknij **"Adjust GitHub App Permissions"** i wybierz repozytorium
3. Kliknij **"Import"**

### Krok 4: Konfiguracja projektu

Vercel automatycznie wykryje Vite, ale sprawdź ustawienia:

- **Framework Preset:** `Vite` (powinno być automatycznie)
- **Root Directory:** `./` (domyślnie)
- **Build Command:** `npm run build` (domyślnie)
- **Output Directory:** `dist` (domyślnie)
- **Install Command:** `npm install` (domyślnie)

### Krok 5: Dodaj zmienne środowiskowe

**WAŻNE:** Musisz dodać wszystkie zmienne Firebase!

W sekcji **"Environment Variables"** kliknij **"Add"** i dodaj:

1. **VITE_FIREBASE_API_KEY**
   - Wartość: `AIzaSyAKsnZFoONtVq2m420MHvGv5S__YmdoI-E`

2. **VITE_FIREBASE_AUTH_DOMAIN**
   - Wartość: `napiecie-game.firebaseapp.com`

3. **VITE_FIREBASE_PROJECT_ID**
   - Wartość: `napiecie-game`

4. **VITE_FIREBASE_STORAGE_BUCKET**
   - Wartość: `napiecie-game.firebasestorage.app`

5. **VITE_FIREBASE_MESSAGING_SENDER_ID**
   - Wartość: `823835042612`

6. **VITE_FIREBASE_APP_ID**
   - Wartość: `1:823835042612:web:28f411d70e924e81f4fb61`

7. **VITE_FIREBASE_MEASUREMENT_ID**
   - Wartość: `G-L2MPQCLQ1S`

8. **VITE_FIREBASE_DATABASE_URL**
   - Wartość: `https://napiecie-game-default-rtdb.europe-west1.firebasedatabase.app`
   - **UWAGA:** Sprawdź w Firebase Console, czy ten URL jest poprawny!

### Krok 6: Wdróż

1. Kliknij **"Deploy"**
2. Poczekaj na zakończenie budowania (zwykle 1-2 minuty)
3. Po zakończeniu otrzymasz link do aplikacji (np. `https://napiecie-game.vercel.app`)

### Krok 7: Dodaj domenę do Firebase

Po wdrożeniu musisz dodać domenę Vercel do dozwolonych domen w Firebase:

1. Przejdź do Firebase Console: https://console.firebase.google.com/project/napiecie-game/settings/general
2. Przewiń w dół do sekcji **"Your apps"**
3. Kliknij ikonę koła zębatego przy aplikacji webowej
4. W sekcji **"Authorized domains"** kliknij **"Add domain"**
5. Dodaj domenę Vercel (np. `napiecie-game.vercel.app` lub `napiecie-game.vercel.app`)
6. Kliknij **"Add"**

---

## Metoda 2: Przez Vercel CLI

### Krok 1: Zainstaluj Vercel CLI lokalnie

```bash
npm install --save-dev vercel
```

### Krok 2: Zaloguj się

```bash
npx vercel login
```

### Krok 3: Wdróż

```bash
npx vercel
```

Postępuj zgodnie z instrukcjami:
- Set up and deploy? **Y**
- Which scope? Wybierz swoje konto
- Link to existing project? **N** (pierwszy raz) lub **Y** (jeśli już masz projekt)
- Project name: `napiecie-game` (lub zostaw domyślną)
- Directory: `./` (domyślnie)
- Override settings? **N** (pierwszy raz)

### Krok 4: Dodaj zmienne środowiskowe

```bash
npx vercel env add VITE_FIREBASE_API_KEY
# Wklej wartość: AIzaSyAKsnZFoONtVq2m420MHvGv5S__YmdoI-E
# Environment: Production, Preview, Development (wybierz wszystkie)

# Powtórz dla wszystkich zmiennych:
npx vercel env add VITE_FIREBASE_AUTH_DOMAIN
npx vercel env add VITE_FIREBASE_PROJECT_ID
npx vercel env add VITE_FIREBASE_STORAGE_BUCKET
npx vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
npx vercel env add VITE_FIREBASE_APP_ID
npx vercel env add VITE_FIREBASE_MEASUREMENT_ID
npx vercel env add VITE_FIREBASE_DATABASE_URL
```

### Krok 5: Wdróż ponownie z zmiennymi

```bash
npx vercel --prod
```

---

## Po wdrożeniu

### Sprawdź aplikację

1. Otwórz link otrzymany od Vercel
2. Sprawdź konsolę przeglądarki (F12) - nie powinno być błędów Firebase
3. Spróbuj utworzyć sesję online

### Automatyczne wdrożenia

Vercel automatycznie wdraża aplikację przy każdym pushu do głównej gałęzi (main/master).

### Aktualizacje

Po każdej zmianie w kodzie:
```bash
git add .
git commit -m "Update"
git push
```

Vercel automatycznie zbuduje i wdroży nową wersję.

---

## Rozwiązywanie problemów

### "Firebase nie jest skonfigurowane"

- Sprawdź, czy wszystkie zmienne środowiskowe są dodane w Vercel
- Upewnij się, że zmienne zaczynają się od `VITE_`
- Po dodaniu zmiennych, wdróż ponownie

### "Permission denied" w Firebase

- Dodaj domenę Vercel do Authorized domains w Firebase Console
- Sprawdź reguły bezpieczeństwa w Firestore i Realtime Database

### "404 Not Found" na podstronach

- Sprawdź, czy plik `vercel.json` jest w katalogu głównym
- Upewnij się, że rewrites są skonfigurowane

### Błędy budowania

- Sprawdź logi w Vercel Dashboard
- Upewnij się, że Node.js wersja jest >= 16 (sprawdź `package.json`)

---

## Linki pomocne

- Vercel Dashboard: https://vercel.com/dashboard
- Firebase Console: https://console.firebase.google.com/project/napiecie-game
- Dokumentacja Vercel: https://vercel.com/docs

