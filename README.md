# 🎯 Pytajka - Multiplayer Quiz Game

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-black)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Nowoczesna aplikacja quizowa w stylu telewizyjnego show, umożliwiająca rozgrywkę dla wielu graczy jednocześnie. Gra składa się z dwóch interfejsów - głównego ekranu wyświetlanego na TV oraz aplikacji mobilnej dla graczy.

## 🎮 Funkcjonalności

### 🖥️ Interfejs TV (Host)
- **Elegancki interfejs główny** - nowoczesny design z gradientami i animacjami
- **System sesji** - generowanie kodów QR do łatwego dołączania graczy
- **Real-time gameplay** - natychmiastowe wyświetlanie odpowiedzi graczy
- **Show-style layout** - kolumny odpowiedzi z wyświetlaniem graczy w czasie rzeczywistym
- **System punktacji** - punkty za poprawność + bonus za szybkość odpowiedzi
- **Statystyki na żywo** - liczba odpowiedzi, pozostały czas, wyniki

### 📱 Aplikacja Mobilna (Gracze)
- **Łatwe dołączanie** - skanowanie QR kodu lub wpisanie kodu sesji
- **Personalizacja** - wybór nicku i awatara (emoji)
- **Intuicyjny interfejs** - duże przyciski odpowiedzi, czytelny design
- **Podgląd wyników** - natychmiastowe informacje o poprawności odpowiedzi
- **Responsive design** - działa na wszystkich urządzeniach mobilnych

### 🧠 System Pytań
- **Baza 339+ pytań** w 7 kategoriach:
  - 🏛️ Historia Polski (38 pytań)
  - 🗺️ Geografia Polski (30 pytań)
  - 🎭 Kultura Polska (10 pytań)
  - ⚽ Sport Polski (16 pytań)
  - 🔬 Nauka i Wynalazki (219 pytań)
  - 🎬 Rozrywka Polska (25 pytań)
  - 🌍 Geografia Świata (1 pytanie)

- **Pytania wizualne** - mapy geograficzne, zdjęcia
- **Wyjaśnienia** - dodatkowe informacje po każdej odpowiedzi
- **Automatyczne ładowanie** - system automatycznie wykrywa nowe pliki z pytaniami

## 🚀 Szybki start

### Wymagania
- Node.js 18+ 
- npm lub yarn
- Nowoczesna przeglądarka
- Sieć lokalna (dla gry wieloosobowej)

### Instalacja i uruchomienie

1. **Sklonuj repozytorium**
```bash
git clone https://github.com/your-username/pytajka.git
cd pytajka
```

2. **Zainstaluj zależności i uruchom**

**Backend** (port 3001):
```bash
cd backend
npm install
npm run dev
```

**Interfejs TV** (port 5173):
```bash
cd frontend-tv
npm install
npm run dev
```

**Aplikacja Mobilna** (port 3002):
```bash
cd frontend-mobile
npm install
npm run dev
```

### Dostęp do aplikacji:
- **TV Interface**: http://localhost:5173
- **Mobile App**: http://localhost:3002  
- **Backend API**: http://localhost:3001

## 🎮 Jak grać

1. **Host** otwiera interfejs TV w przeglądarce
2. **Tworzy nową sesję** - generuje się kod QR i kod sesji  
3. **Gracze** skanują QR kod lub wchodzą na adres mobilny i wpisują kod
4. **Wybierają nick i awatar** (emoji)
5. **Host startuje grę** gdy wszyscy są gotowi
6. **Gracze odpowiadają** na pytania na swoich telefonach
7. **Wyniki** wyświetlają się na głównym ekranie w czasie rzeczywistym
8. **Punktacja** - 100 pkt za poprawną odpowiedź + bonus za szybkość (max 100 pkt)

## 🏗️ Architektura

```
pytajka/
├── backend/              # Serwer Node.js + Socket.io
│   ├── server.js        # Główny plik serwera
│   ├── game.js          # Logika gry i sesji
│   ├── socket.js        # Obsługa WebSocket
│   ├── routes.js        # API routes
│   └── utils.js         # Narzędzia pomocnicze
├── frontend-tv/         # Interfejs dla TV/projektora  
│   ├── src/
│   │   ├── components/  # Komponenty React
│   │   ├── index.css    # Style CSS
│   │   └── App.jsx      # Główny komponent
├── frontend-mobile/     # Aplikacja mobilna
│   ├── src/
│   │   ├── components/  # Komponenty React
│   │   └── App.jsx      # Główny komponent
└── questions/           # Baza pytań (JSON)
    ├── baza-pytan-500plus.json
    ├── natural_earth_geography.json
    └── ...
```

## 🔧 Stack technologiczny

- **Backend**: Node.js, Express, Socket.io, UUID, QRCode
- **Frontend**: React, Vite, Socket.io-client
- **Styling**: Vanilla CSS z gradientami i animacjami
- **Real-time**: WebSockets (Socket.io)