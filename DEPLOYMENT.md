# Wdrożenie aplikacji online

Ten przewodnik pomoże Ci opublikować aplikację w internecie, aby była dostępna dla wszystkich.

## Opcja 1: Firebase Hosting (ZALECANE)

Firebase Hosting jest zintegrowane z Twoim projektem Firebase i oferuje szybkie wdrożenie.

### Wymagania

1. Zainstaluj Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Zaloguj się do Firebase:
   ```bash
   firebase login
   ```

3. Zainicjalizuj hosting (jeśli jeszcze nie):
   ```bash
   firebase init hosting
   ```
   
   Wybierz:
   - Use an existing project: `napiecie-game`
   - Public directory: `dist`
   - Single-page app: `Yes`
   - Set up automatic builds: `No` (lub `Yes` jeśli używasz GitHub)

### Wdrożenie

1. **Zbuduj aplikację:**
   ```bash
   npm run build
   ```

2. **Wdróż na Firebase Hosting:**
   ```bash
   firebase deploy --only hosting
   ```

3. **Twoja aplikacja będzie dostępna pod adresem:**
   ```
   https://napiecie-game.web.app
   ```
   lub
   ```
   https://napiecie-game.firebaseapp.com
   ```

### Automatyczne wdrożenia (opcjonalnie)

Możesz skonfigurować automatyczne wdrożenia z GitHub:

1. W Firebase Console przejdź do **Hosting**
2. Kliknij **Get started** w sekcji "GitHub Actions"
3. Postępuj zgodnie z instrukcjami

## Opcja 2: Vercel (PROSTE I SZYBKE)

Vercel oferuje bardzo proste wdrożenie z GitHub.

### Wymagania

1. Konto na [Vercel](https://vercel.com)
2. Repozytorium na GitHub/GitLab/Bitbucket

### Wdrożenie

1. **Zaloguj się do Vercel:**
   - Przejdź do https://vercel.com
   - Zaloguj się przez GitHub

2. **Importuj projekt:**
   - Kliknij "Add New Project"
   - Wybierz swoje repozytorium
   - Vercel automatycznie wykryje Vite

3. **Konfiguracja:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Zmienne środowiskowe:**
   - W sekcji "Environment Variables" dodaj wszystkie zmienne z `.env`:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_FIREBASE_MEASUREMENT_ID`
     - `VITE_FIREBASE_DATABASE_URL`

5. **Wdróż:**
   - Kliknij "Deploy"
   - Po zakończeniu otrzymasz link do aplikacji

### Automatyczne wdrożenia

Vercel automatycznie wdraża przy każdym pushu do głównej gałęzi.

## Opcja 3: Netlify

Netlify to kolejna popularna opcja hostingu.

### Wdrożenie

1. **Zaloguj się do Netlify:**
   - Przejdź do https://netlify.com
   - Zaloguj się przez GitHub

2. **Importuj projekt:**
   - Kliknij "Add new site" > "Import an existing project"
   - Wybierz repozytorium

3. **Konfiguracja:**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Zmienne środowiskowe:**
   - Site settings > Environment variables
   - Dodaj wszystkie zmienne z `.env`

5. **Wdróż:**
   - Kliknij "Deploy site"

## Opcja 4: GitHub Pages

Darmowy hosting przez GitHub Pages.

### Wdrożenie

1. **Zainstaluj gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Dodaj skrypt do package.json:**
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. **Zaktualizuj vite.config.js:**
   ```js
   export default defineConfig({
     base: '/napiecie-game/', // nazwa repozytorium
     // ... reszta konfiguracji
   })
   ```

4. **Wdróż:**
   ```bash
   npm run deploy
   ```

## Sprawdzanie wdrożenia

Po wdrożeniu sprawdź:

1. ✅ Aplikacja ładuje się poprawnie
2. ✅ Firebase działa (sprawdź konsolę przeglądarki)
3. ✅ Multiplayer online działa
4. ✅ Wszystkie strony są dostępne (routing)

## Aktualizacje

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

### Vercel/Netlify
- Automatycznie przy każdym pushu
- Lub ręcznie przez panel

## Rozwiązywanie problemów

### "404 Not Found" na podstronach
- Upewnij się, że masz skonfigurowane rewrites (przekierowania)
- Sprawdź `firebase.json` lub `vercel.json`

### Firebase nie działa
- Sprawdź, czy zmienne środowiskowe są ustawione w hostingu
- Sprawdź reguły bezpieczeństwa w Firebase Console

### Błędy CORS
- Sprawdź, czy domena jest dodana do dozwolonych w Firebase Console
- Project Settings > Authorized domains

## Rekomendacja

**Dla szybkiego startu:** Vercel (najprostsze)
**Dla integracji z Firebase:** Firebase Hosting (najlepsze)
**Dla darmowego hostingu:** GitHub Pages

