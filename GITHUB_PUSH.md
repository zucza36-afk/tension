# Wypchnięcie kodu do GitHub

## Status

✅ Repozytorium Git zostało zainicjalizowane
✅ Pliki zostały dodane
✅ Pierwszy commit został utworzony
✅ Gałąź została zmieniona na `main`

## Następne kroki

### 1. Utwórz repozytorium na GitHub

1. Przejdź do https://github.com
2. Zaloguj się do swojego konta
3. Kliknij **"+"** w prawym górnym rogu → **"New repository"**
4. Wypełnij:
   - **Repository name:** `tension` (lub inna nazwa)
   - **Description:** "A party game application with Firebase multiplayer support"
   - **Visibility:** Public lub Private (według preferencji)
   - **NIE zaznaczaj** "Initialize this repository with a README" (już mamy pliki)
5. Kliknij **"Create repository"**

**UWAGA:** Jeśli repozytorium już istnieje (np. `zucza36-afk/tension`), pomiń ten krok i przejdź do kroku 2.

### 2. Połącz lokalne repozytorium z GitHub

Po utworzeniu repozytorium GitHub pokaże instrukcje. Uruchom w terminalu:

```bash
cd /home/cezary/Pobrane/napiecie-game

# Dodaj remote (zamień YOUR_USERNAME na swoją nazwę użytkownika GitHub)
# Jeśli repozytorium nazywa się "tension":
git remote add origin https://github.com/YOUR_USERNAME/tension.git

# Wypchnij kod
git push -u origin main
```

**Lub jeśli używasz SSH:**

```bash
git remote add origin git@github.com:YOUR_USERNAME/tension.git
git push -u origin main
```

**Jeśli repozytorium już istnieje i jest połączone:**
```bash
# Sprawdź obecny remote
git remote -v

# Jeśli trzeba zmienić URL:
git remote set-url origin https://github.com/YOUR_USERNAME/tension.git
git push -u origin main
```

### 3. Alternatywnie: użyj GitHub CLI

Jeśli masz zainstalowany GitHub CLI:

```bash
cd /home/cezary/Pobrane/napiecie-game
gh repo create tension --public --source=. --remote=origin --push
```

## Konfiguracja użytkownika Git (opcjonalnie)

Jeśli chcesz zmienić nazwę użytkownika i email dla wszystkich repozytoriów:

```bash
git config --global user.name "Twoje Imię"
git config --global user.email "twoj@email.com"
```

Dla tego repozytorium ustawiono:
- Name: Cezary
- Email: cezary@example.com

Możesz to zmienić:
```bash
cd /home/cezary/Pobrane/napiecie-game
git config user.name "Twoje Imię"
git config user.email "twoj@email.com"
```

## Po wypchnięciu

Po wypchnięciu kodu możesz:

1. **Wdrożyć na Vercel:**
   - Przejdź do https://vercel.com
   - Importuj repozytorium z GitHub
   - Dodaj zmienne środowiskowe
   - Wdróż

2. **Udostępnić kod:**
   - Link do repozytorium będzie dostępny dla innych
   - Mogą klonować i uruchamiać lokalnie

3. **Kontynuować pracę:**
   - Każdy `git push` zaktualizuje repozytorium
   - Vercel automatycznie wdroży nowe zmiany

## Przydatne komendy Git

```bash
# Sprawdź status
git status

# Dodaj zmiany
git add .

# Utwórz commit
git commit -m "Opis zmian"

# Wypchnij zmiany
git push

# Pobierz zmiany
git pull

# Sprawdź historię
git log
```

## Ważne pliki, które NIE są w repozytorium

Następujące pliki są w `.gitignore` i nie będą w repozytorium:
- `.env` - zawiera wrażliwe dane Firebase
- `node_modules/` - zależności (instalowane przez `npm install`)
- `dist/` - zbudowana aplikacja

To jest poprawne - te pliki nie powinny być w repozytorium.

