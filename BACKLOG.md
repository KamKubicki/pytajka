# 📋 Product Backlog - Wiedza to Potęga

## 🎯 Kompletny backlog z oryginalnymi wymaganiami

### Epic 1: Core Game Mechanics ✅ (MVP - Ukończone)

#### User Story 1: Dołączanie do gry
**Jako gracz, chcę móc łatwo dołączyć do gry używając QR kodu, żeby szybko rozpocząć rozgrywkę.**

Acceptance Criteria:
- ✅ Host może wygenerować kod sesji i QR kod
- ✅ Gracze mogą zeskanować QR kod telefonem  
- ✅ Gracze mogą ręcznie wprowadzić kod sesji
- ✅ Każdy gracz wybiera awatar i imię
- ✅ Lista graczy aktualizuje się w czasie rzeczywistym

#### User Story 2: Lobby i zarządzanie sesją
**Jako host, chcę móc zarządzać lobby i rozpoczynać grę, gdy wszyscy gracze będą gotowi.**

Acceptance Criteria:
- ✅ Host widzi listę wszystkich połączonych graczy
- ✅ Host może rozpocząć grę przyciskiem
- ✅ Gracze widzą licznik połączonych graczy
- ✅ System pokazuje informacje o stanie gry

#### User Story 3: System pytań i odpowiedzi  
**Jako gracz, chcę odpowiadać na pytania na swoim telefonie i widzieć pytania na głównym ekranie.**

Acceptance Criteria:
- ✅ Pytania wyświetlają się na TV/głównym ekranie
- ✅ Gracze widzą opcje odpowiedzi na telefonach
- ✅ Timer odlicza czas na odpowiedź (15s)
- ✅ Gracze mogą zmieniać odpowiedzi do końca czasu
- ✅ System zbiera wszystkie odpowiedzi

#### User Story 4: Feedback i punktacja
**Jako gracz, chcę widzieć czy odpowiedziałem poprawnie i jakie są moje punkty.**

Acceptance Criteria:  
- ✅ Gracz widzi feedback o poprawnej/błędnej odpowiedzi
- ✅ Punkty naliczają się automatycznie (100 pkt za poprawną)
- ✅ Wyniki wyświetlają się w czasie rzeczywistym
- ✅ Na końcu gry jest podium zwycięzców

#### User Story 5: Przerwy i tempo gry
**Jako gracz, chcę mieć czas na oddech między pytaniami i widzieć postęp gry.**

Acceptance Criteria:
- ✅ 5-sekundowe przerwy między pytaniami
- ✅ Countdown do następnego pytania  
- ✅ Numeracja pytań (np. "Pytanie 3/5")
- ✅ Osobny ekran zakończenia na telefonie

---

### Epic 2: Advanced Game Features 🚧 (Do zrobienia)

#### User Story 6: Rozgrywka turowa
**Jako gracz, chcę uczestniczyć w turowych rozgrywkach gdzie gracze mogą wpływać na kolejność i wybory.**

Acceptance Criteria:
- [ ] Gracze mogą głosować na kolejność odpowiadania
- [ ] System obsługuje tury indywidualne
- [ ] Możliwość przekazywania tury innemu graczowi
- [ ] Czasowe bonusy za szybkie odpowiedzi w swojej turze

#### User Story 7: Głosowanie nad kategoriami
**Jako gracz, chcę móc głosować nad kategoriami pytań, żeby gra była bardziej interaktywna.**

Acceptance Criteria:
- [ ] Lista kategorii do wyboru (nauka, sport, historia, etc.)
- [ ] System głosowania większościowego
- [ ] Wyświetlanie wyników głosowania w czasie rzeczywistym
- [ ] Losowanie kategorii w przypadku remisu
- [ ] Historia wybranych kategorii w sesji

#### User Story 8: System utrudniaczy i power-upów
**Jako gracz, chcę używać utrudniaczy przeciwko innym graczom i power-upów dla siebie.**

Power-upy:
- [ ] **Podwójna szansa** - możliwość zmiany odpowiedzi po czasie
- [ ] **Dodatkowy czas** - +10 sekund na pytanie
- [ ] **Podwójne punkty** - x2 punkty za poprawną odpowiedź
- [ ] **Podpowiedź 50/50** - usuwa 2 błędne opcje

Utrudniacze:
- [ ] **Zaciemnienie** - ukryj odpowiedzi przeciwnika na 5s
- [ ] **Scramble** - pomieszaj litery w opcjach odpowiedzi
- [ ] **Presja czasu** - zmniejsz czas o połowę dla gracza
- [ ] **Blokada** - zablokuj możliwość odpowiedzi na 3s

Mechanics:
- [ ] Gracze dostają utrudniacze/power-upy za poprawne odpowiedzi
- [ ] System inventory na telefonie gracza
- [ ] Animacje użycia na głównym ekranie
- [ ] Cooldown między użyciami

#### User Story 9: Różne typy pytań
**Jako gracz, chcę różnorodność w typach pytań, żeby gra była bardziej angażująca.**

Typy pytań:
- [ ] **Prawda/Fałsz** - proste pytania binarne
- [ ] **Pytania otwarte** - wpisywanie tekstu
- [ ] **Pytania obrazkowe** - rozpoznawanie ze zdjęć
- [ ] **Pytania audio** - rozpoznawanie dźwięków/muzyki
- [ ] **Pytania rangingowe** - uszeregowanie opcji 1-4

#### User Story 10: Tryb drużynowy
**Jako gracz, chcę grać w drużynach i współpracować z innymi.**

Acceptance Criteria:
- [ ] Podział graczy na drużyny (2-4 drużyny)
- [ ] Wspólna punktacja drużyny
- [ ] Możliwość radzenia się w drużynie (chat/voice)
- [ ] Drużynowe power-upy i utrudniacze
- [ ] Podium drużyn zamiast indywidualnego

---

### Epic 3: Content & Customization 📚 (Przyszłość)

#### User Story 11: Własne zestawy pytań
**Jako host, chcę móc dodawać własne pytania i kategorie.**

Acceptance Criteria:
- [ ] Upload plików JSON/CSV z pytaniami
- [ ] Web interface do dodawania pytań
- [ ] Walidacja formatu pytań
- [ ] Podgląd zestawu przed grą
- [ ] Możliwość mieszania własnych z domyślnymi pytaniami

#### User Story 12: Poziomy trudności
**Jako host, chcę móc wybrać poziom trudności gry.**

Levels:
- [ ] **Łatwy** - więcej czasu (20s), prostsze pytania
- [ ] **Średni** - standardowy czas (15s), mieszane pytania  
- [ ] **Trudny** - mniej czasu (10s), trudniejsze pytania
- [ ] **Expert** - bardzo mało czasu (7s), najtrudniejsze pytania

#### User Story 13: Statystyki i historie
**Jako gracz, chcę widzieć swoje statystyki i historię gier.**

Acceptance Criteria:
- [ ] Zapisywanie wyników gier
- [ ] Statystyki per kategoria
- [ ] Ranking graczy
- [ ] Historia ostatnich 10 gier
- [ ] Export statystyk do PDF

---

### Epic 4: Technical Improvements 🔧 (Przyszłość)

#### User Story 14: Progressive Web App
**Jako gracz, chcę móc zainstalować grę na telefonie jak aplikację.**

Acceptance Criteria:
- [ ] Service Worker dla offline capability
- [ ] Web App Manifest
- [ ] Install prompts na mobile
- [ ] Offline mode dla pojedynczego gracza
- [ ] Push notifications dla zaproszeń

#### User Story 15: Ulepszone UX
**Jako gracz, chcę żeby gra była bardziej angażująca wizualnie i dźwiękowo.**

Acceptance Criteria:
- [ ] Efekty dźwiękowe (poprawna/błędna odpowiedź)
- [ ] Muzyka w tle
- [ ] Zaawansowane animacje CSS
- [ ] Konfetti przy wygranej
- [ ] Vibracje na telefonie przy feedback

#### User Story 16: Admin Panel
**Jako administrator, chcę móc zarządzać grami i graczami.**

Acceptance Criteria:
- [ ] Dashboard z aktywnymi sesjami
- [ ] Możliwość zakończenia gry
- [ ] Ban/kick graczy
- [ ] Moderacja treści pytań
- [ ] Logi i monitoring

---

## 🎮 Priorytety rozwoju

### Faza 1 (Następne sprinty):
1. **Rozgrywka turowa** - fundamentalna mechanika gry
2. **Głosowanie nad kategoriami** - zwiększa interaktywność
3. **System utrudniaczy** - dodaje strategiczny element

### Faza 2 (Średni termin):
4. **Różne typy pytań** - zwiększa różnorodność
5. **Tryb drużynowy** - nowa forma rozgrywki
6. **Własne zestawy pytań** - customization

### Faza 3 (Długi termin):  
7. **PWA i offline mode** - lepsze UX
8. **Advanced features** - statystyki, admin panel
9. **Audio/Visual enhancements** - polish

## 📊 Definition of Done

Każde zadanie jest ukończone gdy:
- [ ] Funkcjonalność działa na wszystkich urządzeniach (TV + mobile)
- [ ] Jest przetestowana ręcznie przez zespół
- [ ] Kod jest zreviewowany  
- [ ] Dokumentacja jest zaktualizowana
- [ ] UX/UI jest spójne z resztą aplikacji
- [ ] Performance nie jest znacząco pogorszona