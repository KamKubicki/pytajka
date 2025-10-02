# 📝 Przewodnik dodawania pytań

## 🏗️ Struktura pytań

### Format JSON
Każde pytanie ma następującą strukturę:

```json
{
  "id": "kategoria_numer",
  "question": "Treść pytania?",
  "answers": ["A", "B", "C", "D"],
  "correct": 0,
  "difficulty": "easy|medium|hard",
  "explanation": "Wyjaśnienie poprawnej odpowiedzi"
}
```

### Kategorie
- **historia** 🏛️ - wydarzenia historyczne, daty, postacie
- **nauka** 🔬 - fizyka, chemia, biologia, matematyka
- **sport** ⚽ - piłka nożna, olimpiada, rekordy
- **geografia** 🌍 - stolice, kraje, kontynenty
- **rozrywka** 🎬 - filmy, muzyka, gry, celebryci  
- **literatura** 📚 - książki, autorzy, poezja

## ✅ Zasady tworzenia pytań

### 1. **Jasność pytania**
- Pytanie musi być jednoznaczne
- Unikaj dwuznaczności
- Używaj prostego języka

✅ **Dobre:** "Która planeta jest najbliżej Słońca?"
❌ **Złe:** "Która z planet jest bliżej naszej gwiazdy?"

### 2. **Odpowiedzi**
- Dokładnie 4 opcje (A, B, C, D)
- Jedna poprawna odpowiedź
- Błędne odpowiedzi powinny być prawdopodobne
- Unikaj opcji "wszystkie powyższe" lub "żadna z powyższych"

### 3. **Poziomy trudności**

#### 🟢 **Easy (łatwe)**
- Podstawowa wiedza ogólna
- Znane fakty i daty
- 20 sekund na odpowiedź
- 100 pkt bazowych + bonus do 50 pkt

#### 🟡 **Medium (średnie)**  
- Szeroka wiedza ogólna
- Fakty mniej oczywiste
- 15 sekund na odpowiedź
- 150 pkt bazowych + bonus do 75 pkt

#### 🔴 **Hard (trudne)**
- Specjalistyczna wiedza
- Szczegóły i niuanse
- 10 sekund na odpowiedź  
- 200 pkt bazowych + bonus do 100 pkt

## 🎯 Przykłady dobrych pytań

### Historia - Easy
```json
{
  "id": "hist_003",
  "question": "W którym roku upadł mur berliński?",
  "answers": ["1987", "1989", "1990", "1991"],
  "correct": 1,
  "difficulty": "easy",
  "explanation": "Mur berliński upadł 9 listopada 1989 roku."
}
```

### Nauka - Medium
```json
{
  "id": "sci_003", 
  "question": "Ile par chromosomów ma człowiek?",
  "answers": ["22", "23", "24", "46"],
  "correct": 1,
  "difficulty": "medium",
  "explanation": "Człowiek ma 23 pary chromosomów (łącznie 46)."
}
```

### Sport - Hard
```json
{
  "id": "sport_002",
  "question": "Kto jest rekordzistą świata w skoku o tyczce (mężczyźni)?",
  "answers": ["Sergey Bubka", "Armand Duplantis", "Renaud Lavillenie", "Brad Walker"],
  "correct": 1,
  "difficulty": "hard", 
  "explanation": "Armand Duplantis ustanowił rekord świata - 6,24m w 2024 roku."
}
```

## 🚀 Jak dodać pytania do gry

### 1. **Edytuj plik JSON**
```bash
# Otwórz plik z pytaniami
nano backend/questions.json
```

### 2. **Dodaj nowe pytanie**
```json
{
  "id": "nowe_001",
  "question": "Twoje pytanie?",
  "answers": ["A", "B", "C", "D"],
  "correct": 0,
  "difficulty": "medium",
  "explanation": "Wyjaśnienie"
}
```

### 3. **Zrestartuj serwer**
```bash
npm run dev
```

## ✨ Wskazówki

### **Dobre źródła pytań:**
- Wikipedia (sprawdzone fakty)
- Podręczniki szkolne
- Quizy telewizyjne
- Encyklopedie

### **Czego unikać:**
- Pytań wymagających opinii
- Zbyt łatwych pytań (oczywiste odpowiedzi)
- Zbyt trudnych pytań (tylko eksperci wiedzą)
- Pytań o aktualne wydarzenia (szybko się dezaktualizują)

### **Testowanie pytań:**
1. Zadaj pytanie znajomym
2. Czy odpowiedzi są oczywiste?
3. Czy pytanie jest sprawiedliwe?
4. Czy wyjaśnienie jest jasne?

## 📊 Template do masowego dodawania

```json
{
  "id": "kat_XXX",
  "question": "",
  "answers": ["", "", "", ""],
  "correct": 0,
  "difficulty": "medium",
  "explanation": ""
},
```

### Kopiuj i wypełniaj! 🎯