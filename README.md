# 🧠 Wiedza to Potęga - Multiplayer Quiz Game

Gra quizowa w stylu "Wiedza to Potęga" dla wielu graczy. Gracze dołączają przez QR kod i odpowiadają na pytania za pomocą telefonów.

## 🚀 Szybki start

### Instalacja
```bash
npm run install:all
```

### Uruchomienie
```bash
npm run dev
```

To uruchomi:
- Backend (port 8001)
- Frontend TV (port 3000) 
- Frontend Mobile (port 3002)

### Jak grać
1. Otwórz http://localhost:3000 na TV/komputerze
2. Zeskanuj QR kod telefonem lub wejdź na http://localhost:3002
3. Wprowadź kod gry i swoje dane
4. Rozpocznij grę gdy wszyscy dołączą!

## 🏗️ Architektura

```
backend/          - Node.js + Express + Socket.io
frontend-tv/      - React (dla TV/dużego ekranu)
frontend-mobile/  - React (dla telefonów)
shared/           - Współdzielone typy i utils
```

## ✨ Funkcje - Stan obecny

### MVP ✅ (Ukończone)
- ✅ Dołączanie przez QR kod i kod sesji
- ✅ Real-time komunikacja (WebSockets)
- ✅ Lobby graczy z avatarami
- ✅ Quiz z wielokrotnym wyborem (5 pytań)
- ✅ Punktacja w czasie rzeczywistym
- ✅ Podium zwycięzców na TV
- ✅ Countdown timery (15s na odpowiedź)
- ✅ Feedback o poprawnych/błędnych odpowiedziach
- ✅ Możliwość poprawiania odpowiedzi
- ✅ Przerwy między pytaniami (5s)
- ✅ Ekran zakończenia gry na telefonie
- ✅ Responsywne UI dla mobile i TV

### Core Game Features 🚧 (Do zrobienia)
- [ ] **Rozgrywka turowa** - gracze wybierają kolejność
- [ ] **Głosowanie nad kategoriami** - wybór kategorii pytań
- [ ] **System utrudniaczy** - power-upy i przeszkody
- [ ] **Różne typy pytań** - prawda/fałsz, otwarte, obrazkowe
- [ ] **Tryb drużynowy** - współpraca w zespołach

### Extended Features 📋 (Przyszłość)  
- [ ] Własne zestawy pytań (upload JSON/CSV)
- [ ] Statystyki graczy i historie gier
- [ ] Różne poziomy trudności
- [ ] Progressive Web App (PWA)
- [ ] Animacje i efekty dźwiękowe
- [ ] Admin panel do zarządzania grami

## 🔧 Stack technologiczny

- **Backend**: Node.js, Express, Socket.io, UUID, QRCode
- **Frontend**: React, Vite, Socket.io-client
- **Styling**: Vanilla CSS z gradientami i animacjami
- **Real-time**: WebSockets (Socket.io)