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
- Backend (port 3001)
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

## ✨ Funkcje MVP

- ✅ Dołączanie przez QR kod
- ✅ Real-time komunikacja (WebSockets)
- ✅ Lobby graczy
- ✅ Quiz z wielokrotnym wyborem
- ✅ Punktacja w czasie rzeczywistym
- ✅ Podium zwycięzców

## 🛣️ Roadmap

- [ ] Kategorie pytań i głosowanie
- [ ] Utrudniacze i power-upy  
- [ ] Tryb drużynowy
- [ ] Własne pytania
- [ ] Animacje i efekty
- [ ] Progressive Web App (PWA)

## 🔧 Stack technologiczny

- **Backend**: Node.js, Express, Socket.io, UUID, QRCode
- **Frontend**: React, Vite, Socket.io-client
- **Styling**: Vanilla CSS z gradientami i animacjami
- **Real-time**: WebSockets (Socket.io)