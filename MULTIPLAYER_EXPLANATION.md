# Jak działa multiplayer w aplikacji

## Architektura multiplayer

Aplikacja używa hybrydowego podejścia do multiplayer - **priorytet lokalny z opcjonalnym online**.

### 🏠 Tryb lokalny (domyślny)

**Jak działa:**
1. Wszystkie dane są przechowywane lokalnie w przeglądarce (Zustand store)
2. Aplikacja zawsze działa, nawet bez internetu
3. Brak zależności od zewnętrznych usług
4. Wszystkie funkcje działają natychmiast

**Kiedy używany:**
- Gdy Firebase nie jest skonfigurowane
- Gdy brak połączenia internetowego
- Gdy Firebase zwraca błędy
- Domyślnie dla wszystkich nowych sesji

### 🌐 Tryb online (opcjonalny)

**Jak działa:**
1. **Firebase Firestore** - przechowuje sesje gry i ustawienia
2. **Firebase Realtime Database** - synchronizuje stan gry w czasie rzeczywistym
3. **Automatyczne fallback** - jeśli online nie działa, przechodzi na lokalne

**Kiedy używany:**
- Gdy Firebase jest prawidłowo skonfigurowane
- Gdy użytkownik chce synchronizacji między urządzeniami

## Szczegółowy przepływ multiplayer

### 1. Tworzenie gry

```javascript
// Funkcja createSession() zawsze:
1. Ustawia sesję lokalną (zawsze działa)
2. Próbuje utworzyć sesję w Firebase (opcjonalne)
3. Jeśli Firebase działa - synchronizuje stan
4. Jeśli nie - używa trybu lokalnego
```

**Rezultat:** Gracz zawsze może zacząć grać natychmiast.

### 2. Dołączanie do gry

```javascript
// Funkcja joinSession(code)
1. Sprawdza kod w Firebase
2. Jeśli istnieje - pobiera ustawienia gry
3. Synchronizuje z innymi graczami
4. Jeśli nie istnieje - błąd
```

### 3. Synchronizacja w czasie rzeczywistym

**Firebase Realtime Database** synchronizuje:
- Lista graczy (dołączanie/opuszczanie)
- Stan gry (aktualna karta, tura gracza)
- Głosowania (w kartach typu "Vote")

**Jak działa:**
```javascript
// Subskrypcje Firebase
subscribeToPlayers(sessionId, (playersData) => {
  // Aktualizuje lokalny stan graczy
})

subscribeToGameState(sessionId, (gameState) => {
  // Synchronizuje stan gry
})
```

## Przykład użycia

### Scenariusz 1: Jedno urządzenie (lokalne)
```
Gracz 1: Tworzy grę → Kod: ABC123
Gracz 1: Dodaje graczy lokalnie
Gracz 1: Gra normalnie
```
**Wynik:** Wszystko działa lokalnie, bez internetu.

### Scenariusz 2: Wielu graczy na jednym urządzeniu
```
Gracz 1: Tworzy grę → Kod: ABC123
Gracz 2-4: Dołączają do gry używając kodu
Firebase synchronizuje graczy
```
**Wynik:** Wielu graczy na jednym urządzeniu.

### Scenariusz 3: Wielu graczy na różnych urządzeniach
```
Urządzenie 1: Tworzy grę → Kod: ABC123
Urządzenie 2: Dołącza używając kodu ABC123
Firebase synchronizuje stan między urządzeniami
```
**Wynik:** Gra między różnymi urządzeniami.

## Bezpieczeństwo i niezawodność

### 🛡️ Fallback system
- Jeśli Firebase nie działa → automatycznie lokalne
- Jeśli brak internetu → automatycznie lokalne
- Jeśli błędy Firebase → automatycznie lokalne
- **Zawsze można grać**

### 🔒 Reguły bezpieczeństwa
```javascript
// Firestore - tylko uczestnicy sesji mogą czytać/zapisywać
match /sessions/{sessionId} {
  allow read, write: if authenticated || status == 'active'
}

// Realtime Database - wszyscy w sesji mają dostęp
"games": {
  "$sessionId": {
    ".read": true,
    ".write": true
  }
}
```

### 🔄 Synchronizacja
- **Optimistyczna** - zmiany natychmiast widoczne lokalnie
- **Automatyczna** - Firebase synchronizuje w tle
- **Bezpieczna** - błędy nie przerywają gry

## Konfiguracja Firebase

### Wymagane ustawienia:

1. **Firestore Database**
   - Tryb testowy dla rozwoju
   - Reguły bezpieczeństwa

2. **Realtime Database**
   - Tryb testowy dla rozwoju
   - Reguły bezpieczeństwa

3. **Zmienne środowiskowe**
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_PROJECT_ID=napiecie-game
   # itp.
   ```

### Opcjonalne (dla produkcji):
- Uwierzytelnianie użytkowników
- Bardziej restrykcyjne reguły bezpieczeństwa
- Monitoring i analityka

## Diagnostyka

### Sprawdzenie trybu gry:
```javascript
// W konsoli przeglądarki
console.log('isOnlineSession:', useGameStore.getState().isOnlineSession)
console.log('sessionCode:', useGameStore.getState().sessionCode)
```

### Logi Firebase:
- Otwórz konsolę przeglądarki (F12)
- Filtruj po "Firebase" lub "[createSession]"
- Sprawdź czy są błędy

### Testowanie:
1. Otwórz aplikację w nowej karcie/incognito
2. Utwórz grę w jednej karcie
3. Dołącz do gry w drugiej karcie używając kodu
4. Sprawdź czy gracze się synchronizują

## Zalety hybrydowego podejścia

✅ **Zawsze działa** - nawet bez internetu
✅ **Szybkie** - brak opóźnień od serwera
✅ **Bezpieczne** - dane lokalne domyślnie
✅ **Elastyczne** - opcjonalne synchronizacja online
✅ **Niezawodne** - automatyczne fallback

## Podsumowanie

Multiplayer działa na zasadzie **"najpierw lokalnie, potem synchronizuj"**:

1. **Lokalnie** - natychmiastowa reakcja, zawsze działa
2. **Online** - synchronizacja między urządzeniami (opcjonalne)
3. **Fallback** - automatyczne przełączanie na lokalne przy problemach

To zapewnia najlepsze doświadczenie użytkownika - gra zawsze działa, a synchronizacja online jest dodatkiem zwiększającym możliwości.
