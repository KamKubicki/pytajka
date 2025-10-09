# 🔒 HTTPS Setup dla Kamery na iPhone

## Problem
Safari na iPhone wymaga HTTPS aby uzyskać dostęp do kamery. Bez HTTPS funkcja selfie nie będzie działać.

## ✅ Rozwiązanie

### 1. Automatyczne uruchomienie z HTTPS
```bash
./start-https.sh
```

### 2. Manualne uruchomienie

#### Generowanie certyfikatów (jednorazowo):
```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=PL/ST=Poland/L=Warsaw/O=WiedzaToPotega/OU=Dev/CN=localhost"
```

#### Uruchomienie serwerów:
```bash
# Backend (terminal 1)
cd backend && node server.js

# Frontend TV (terminal 2) 
cd frontend-tv && npm run dev
```

## 📱 Dostęp z iPhone

1. **Znajdź swoje IP**: 
   ```bash
   ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | head -1
   ```

2. **Użyj HTTPS URL**:
   - Frontend: `https://192.168.1.XXX:3000/`
   - Kod QR automatycznie pokaże HTTPS URL

3. **Akcja na iPhone**:
   - Zeskanuj kod QR lub wejdź na HTTPS URL
   - Safari pokaże ostrzeżenie o certyfikacie
   - Kliknij "Advanced" → "Proceed to site"
   - Teraz kamera będzie działać!

## 🔧 Porty

- **HTTP Backend**: 8001
- **HTTPS Backend**: 8443
- **HTTPS Frontend**: 3000 (lub kolejny dostępny)

## 🎯 Alternatywy dla iPhone

Jeśli nie chcesz konfigurować HTTPS:

1. **Chrome na iPhone** - lepsze wsparcie kamery
2. **Firefox na iPhone** - także działa
3. **Safari** - wymaga HTTPS (ten setup)

## 🔍 Debugowanie

- Sprawdź logi backendu czy certyfikaty zostały załadowane
- W konsoli przeglądarki sprawdź błędy WebRTC/getUserMedia
- Upewnij się że używasz HTTPS URL na mobile
- Safari może wymagać ponownego zezwolenia na kamerę

## 📝 Notatki

- Certyfikaty są self-signed i ważne 365 dni
- Przeglądarki pokażą ostrzeżenie o bezpieczeństwie - to normalne dla dev
- Certyfikaty są gitignore'd - bezpieczne dla repo