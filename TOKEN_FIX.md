# Rozwiązanie problemu z tokenem GitHub

## Problem

Token zwraca błąd 403 (Permission denied). To oznacza, że token nie ma odpowiednich uprawnień.

## Rozwiązanie

### Krok 1: Sprawdź uprawnienia tokenu

1. Przejdź do: https://github.com/settings/tokens
2. Znajdź swój token (lub utwórz nowy)
3. Upewnij się, że token ma zaznaczone:
   - ✅ **repo** (pełny dostęp do repozytoriów)
   - ✅ **workflow** (jeśli używasz GitHub Actions)

### Krok 2: Utwórz nowy token (jeśli potrzeba)

1. Przejdź do: https://github.com/settings/tokens/new
2. Wypełnij:
   - **Note:** "napiecie-game deployment"
   - **Expiration:** Wybierz okres (np. 90 days)
   - **Scopes:** Zaznacz **repo** (pełny dostęp)
3. Kliknij **"Generate token"**
4. **SKOPIUJ TOKEN** - zobaczysz go tylko raz!

### Krok 3: Wypchnij kod używając tokenu

**Metoda 1: Przez URL (tymczasowo)**

```bash
cd /home/cezary/Pobrane/napiecie-game

# Ustaw URL z tokenem
git remote set-url origin https://zucza36-afk:TWÓJ_NOWY_TOKEN@github.com/zucza36-afk/tension.git

# Wypchnij
git push -u origin main
```

**Metoda 2: Przez git credential helper (bezpieczniejsze)**

```bash
cd /home/cezary/Pobrane/napiecie-game

# Przywróć normalny URL
git remote set-url origin https://github.com/zucza36-afk/tension.git

# Ustaw credential helper
git config --global credential.helper store

# Wypchnij (Git zapyta o username i password)
git push -u origin main
# Username: zucza36-afk
# Password: Wklej token (nie hasło!)
```

**Metoda 3: Przez GitHub CLI (najlepsze)**

```bash
# Zainstaluj GitHub CLI
npm install -g gh

# Zaloguj się
gh auth login
# Wybierz: GitHub.com, HTTPS, Authenticate Git: Yes

# Wypchnij
cd /home/cezary/Pobrane/napiecie-game
git push -u origin main
```

## Bezpieczeństwo

⚠️ **WAŻNE:** Token w URL jest widoczny w historii Git!

Po wypchnięciu usuń token z URL:

```bash
git remote set-url origin https://github.com/zucza36-afk/tension.git
```

Lub użyj credential helper, który bezpiecznie przechowa token.

## Alternatywa: SSH Keys

Dla długoterminowego użycia, lepiej skonfigurować SSH:

```bash
# Utwórz klucz SSH
ssh-keygen -t ed25519 -C "twoj@email.com"

# Skopiuj klucz publiczny
cat ~/.ssh/id_ed25519.pub

# Dodaj klucz do GitHub: https://github.com/settings/keys

# Zmień URL na SSH
git remote set-url origin git@github.com:zucza36-afk/tension.git

# Wypchnij
git push -u origin main
```

