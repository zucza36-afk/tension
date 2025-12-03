# Uwierzytelnianie w GitHub

Repozytorium zostało połączone z GitHub, ale potrzebujesz uwierzytelnienia, aby wypchnąć kod.

## Opcja 1: Personal Access Token (ZALECANE)

### Krok 1: Utwórz Personal Access Token

1. Przejdź do https://github.com/settings/tokens
2. Kliknij **"Generate new token"** → **"Generate new token (classic)"**
3. Wypełnij:
   - **Note:** "napiecie-game deployment"
   - **Expiration:** Wybierz okres ważności (np. 90 days)
   - **Scopes:** Zaznacz `repo` (pełny dostęp do repozytoriów)
4. Kliknij **"Generate token"**
5. **SKOPIUJ TOKEN** - zobaczysz go tylko raz!

### Krok 2: Wypchnij kod

```bash
cd /home/cezary/Pobrane/napiecie-game

# Wypchnij kod (Git zapyta o username i password)
git push -u origin main
```

Gdy Git zapyta:
- **Username:** `zucza36-afk`
- **Password:** Wklej **Personal Access Token** (nie hasło GitHub!)

### Krok 3: Zapisz token (opcjonalnie)

Aby nie wpisywać tokenu za każdym razem:

```bash
# Zainstaluj Git Credential Manager
git config --global credential.helper store

# Lub użyj cache (token ważny przez 15 minut)
git config --global credential.helper cache
```

## Opcja 2: GitHub CLI

### Zainstaluj GitHub CLI

```bash
# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Lub przez npm
npm install -g gh
```

### Zaloguj się

```bash
gh auth login
```

Postępuj zgodnie z instrukcjami, wybierz:
- GitHub.com
- HTTPS
- Authenticate Git with your GitHub credentials? **Yes**

### Wypchnij kod

```bash
cd /home/cezary/Pobrane/napiecie-game
git push -u origin main
```

## Opcja 3: SSH Keys (dla przyszłości)

### Utwórz klucz SSH

```bash
ssh-keygen -t ed25519 -C "twoj@email.com"
# Naciśnij Enter dla domyślnej lokalizacji
# Opcjonalnie ustaw hasło

# Skopiuj klucz publiczny
cat ~/.ssh/id_ed25519.pub
```

### Dodaj klucz do GitHub

1. Przejdź do https://github.com/settings/keys
2. Kliknij **"New SSH key"**
3. Wklej zawartość `~/.ssh/id_ed25519.pub`
4. Kliknij **"Add SSH key"**

### Zmień URL na SSH

```bash
cd /home/cezary/Pobrane/napiecie-game
git remote set-url origin git@github.com:zucza36-afk/tension.git
git push -u origin main
```

## Szybkie rozwiązanie

Najszybsze rozwiązanie to użycie Personal Access Token:

1. Utwórz token: https://github.com/settings/tokens
2. Uruchom: `git push -u origin main`
3. Username: `zucza36-afk`
4. Password: Wklej token

## Po wypchnięciu

Po pomyślnym wypchnięciu:
- Kod będzie dostępny na: https://github.com/zucza36-afk/tension
- Możesz wdrożyć na Vercel (import z GitHub)
- Możesz kontynuować pracę z `git push`

