# Napięcie - Gra Towarzyska

Elegancka aplikacja webowa do gry towarzyskiej dla par i grup, która buduje napięcie i zachęca do świadomych interakcji w bezpieczny, zabawny sposób.

## 🎯 Funkcje

### Tryby gry
- **Klasyczny**: Tury z kartami dla osób, par lub grupy
- **Eliminacja**: Głosowanie usuwa graczy lub zwiększa wyzwania  
- **Swobodny**: Karty pojawiają się bez struktury tur

### System kart
- 50 unikalnych kart z różnymi typami (Truth, Dare, Vote, Icebreaker, Touch, Strip, Group)
- 5 poziomów intensywności (1-5)
- Filtry konsensualne
- Eskalacja intensywności w czasie

### Bezpieczeństwo
- Słowo bezpieczeństwa (STOP)
- Filtry intensywności
- Ustawienia komfortu dla każdego gracza
- Anonimowe głosowanie

### Funkcje dodatkowe
- Analityka gry
- System sesji multiplayer
- Responsywny design
- Animacje i efekty wizualne

## 🚀 Instalacja

### Wymagania
- Node.js 16+ 
- npm lub yarn

### Kroki instalacji

1. **Sklonuj repozytorium**
```bash
git clone <repository-url>
cd napiecie-game
```

2. **Zainstaluj zależności**
```bash
npm install
```

3. **Skonfiguruj Firebase (opcjonalnie)**
   - Utwórz projekt w [Firebase Console](https://console.firebase.google.com/)
   - Skopiuj konfigurację do `src/firebase/config.js`
   - Włącz Firestore Database i Realtime Database

4. **Uruchom aplikację**
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:3000`

## 🎮 Jak grać

### 1. Utworzenie gry
- Kliknij "Utwórz nową grę"
- Skonfiguruj ustawienia (tryb, intensywność, filtry)
- Dodaj graczy z ich poziomami komfortu

### 2. Rozgrywka
- Każdy gracz dobiera kartę na swoją turę
- Kliknij kartę, aby ją odwrócić
- Wykonaj zadanie lub pomiń kartę
- Przejdź do następnego gracza

### 3. Funkcje specjalne
- **Głosowanie**: Dla kart typu "Vote" wszyscy głosują anonimowo
- **Słowo bezpieczeństwa**: Przycisk STOP wstrzymuje grę
- **Analityka**: Podsumowanie po zakończeniu gry

## 🛠️ Technologie

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Animacje**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Firebase (opcjonalnie)
- **Hosting**: Vercel/Firebase Hosting

## 📁 Struktura projektu

```
src/
├── components/          # Komponenty UI
│   ├── Card.jsx        # Komponent karty
│   ├── SafeWordButton.jsx
│   └── VoteModal.jsx
├── pages/              # Strony aplikacji
│   ├── HomePage.jsx    # Strona główna
│   ├── SetupPage.jsx   # Konfiguracja gry
│   ├── GamePage.jsx    # Rozgrywka
│   └── EndPage.jsx     # Podsumowanie
├── store/              # Zarządzanie stanem
│   └── gameStore.js    # Zustand store
├── data/               # Dane aplikacji
│   └── cards.js        # Talia kart
├── firebase/           # Konfiguracja Firebase
│   ├── config.js
│   └── sessionService.js
└── utils/              # Narzędzia pomocnicze
```

## 🎨 Design System

### Kolory
- **Primary**: Czerwony (#ef4444) - akcje główne
- **Secondary**: Fioletowy (#a855f7) - akcje drugorzędne  
- **Accent**: Złoty (#f59e0b) - akcenty
- **Dark**: Ciemne odcienie szarości - tło

### Typografia
- **Serif**: Playfair Display - nagłówki
- **Sans**: Inter - tekst

### Intensywność kart
- **1**: Zielony - Łagodny
- **2**: Żółty - Delikatny
- **3**: Pomarańczowy - Umiarkowany
- **4**: Czerwony - Intensywny
- **5**: Fioletowy - Ekstremalny

## 🔧 Konfiguracja

### Zmienne środowiskowe
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
```

### Dostosowanie kart
Edytuj `src/data/cards.js` aby dodać własne karty:

```javascript
{
  id: "card_051",
  type: "Dare",
  title: "Twoja karta",
  description: "Opis zadania",
  target: "one", // one, two, group, random
  intensity: 3
}
```

## 🚀 Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Firebase Hosting
```bash
npm run build
firebase deploy
```

## 📱 Responsywność

Aplikacja jest w pełni responsywna i działa na:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🔒 Bezpieczeństwo

- Wszystkie interakcje są lokalne (bez serwera)
- Dane nie są przechowywane na zewnętrznych serwerach
- Słowo bezpieczeństwa natychmiastowo wstrzymuje grę
- Filtry konsensualne chronią przed nieodpowiednimi treściami

## 🤝 Współpraca

1. Fork projektu
2. Utwórz branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit zmian (`git commit -m 'Add some AmazingFeature'`)
4. Push do branch (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## 📄 Licencja

Ten projekt jest dostępny na licencji MIT. Zobacz plik `LICENSE` dla szczegółów.

## 🆘 Wsparcie

Jeśli masz pytania lub problemy:
- Otwórz issue na GitHub
- Sprawdź dokumentację Firebase
- Skonsultuj się z zespołem

---

**Uwaga**: Ta aplikacja jest przeznaczona dla dorosłych i zawiera treści o charakterze erotycznym. Używaj odpowiedzialnie i zawsze respektuj granice wszystkich uczestników. 