# 🗺️ Generator Pytań Wizualnych - Natural Earth Data

Generator wysokiej jakości map geograficznych dla quiz'u "Wiedza to Potęga" używający prawdziwych danych Natural Earth.

## 🚀 Szybki Start

```bash
# 1. Zainstaluj wymagania
pip install -r requirements.txt

# 2. Uruchom generator
python visual_question_generator.py
```

Generator automatycznie:
- Pobierze dane Natural Earth (~50MB)
- Wygeneruje wysokiej jakości mapy SVG
- Stworzy plik JSON z pytaniami gotowymi dla gry

## 🎯 Typy Pytań

### 1. Stolice z Kropkami ●
```python
generator.generate_capital_questions()
```
- Kontury kraju + czerwona kropka na stolicy
- Pytanie: "Jaka jest stolica tego kraju?"
- Przykład: Mapa Polski z kropką na Warszawie

### 2. Kontury Krajów 🗺️
```python
generator.generate_country_questions()
```
- Tylko kontury kraju bez oznaczeń
- Pytanie: "Jak nazywa się ten kraj?"
- Przykład: Kształt Włoch do rozpoznania

### 3. Rzeki Podświetlone 〰️
```python
generator.generate_river_questions()
```
- Kontury kraju + podświetlona rzeka
- Pytanie: "Która rzeka jest podświetlona?"
- Przykład: Mapa Francji z zaznaczoną Sekwaną

### 4. Pytania Kombinowane 🌍
```python
generator.generate_combo_questions()
```
- Kontury + stolica + rzeki w jednej mapie
- Pytanie: "Która rzeka przepływa przez stolicę?"
- Przykład: Polska + Warszawa + Wisła

## 📋 Wymagania

```
geopandas>=0.12.0
matplotlib>=3.5.0
requests>=2.28.0
Pillow>=9.0.0
shapely>=2.0.0
fiona>=1.8.0
pyproj>=3.4.0
pandas>=1.5.0
```

## 🔧 Dostosowywanie

### Dodawanie Nowych Krajów

```python
capitals_data = [
    {'country': 'Czech Republic', 'capital': 'Praga', 
     'wrong_answers': ['Bratysława', 'Budapeszt', 'Wiedeń']},
]
```

### Dodawanie Nowych Rzek

```python
rivers_data = [
    {'country': 'Austria', 'river': 'Danube', 'river_pl': 'Dunaj',
     'wrong_answers': ['Ren', 'Łaba', 'Inn']},
]
```

### Zmiana Stylów Map

```python
# W funkcji create_map_svg()
if question_type == 'capital':
    country_color = '#fff3e0'    # Kolor wypełnienia
    border_color = '#e65100'     # Kolor granic
    bg_color = '#fffef7'         # Kolor tła
```

## 📁 Struktura Plików

```
WiedzaToPotega/
├── visual_question_generator.py    # Generator główny
├── requirements.txt                # Wymagania Python
├── README_generator.md             # Ta dokumentacja
├── geodata/                        # Pobrane dane Natural Earth
│   ├── countries/
│   ├── rivers/
│   └── lakes/
└── questions/
    └── natural_earth_geography.json # Wygenerowane pytania
```

## 🐛 Rozwiązywanie Problemów

### Problem: Błąd pobierania danych
```bash
# Sprawdź połączenie internetowe
ping www.naturalearthdata.com

# Ręczne pobieranie danych
mkdir geodata
cd geodata
# Pobierz pliki z https://www.naturalearthdata.com/downloads/
```

### Problem: Błąd instalacji GeoPandas
```bash
# Na macOS
brew install gdal
pip install geopandas

# Na Ubuntu/Debian
sudo apt-get install gdal-bin libgdal-dev
pip install geopandas

# Na Windows
conda install geopandas
```

### Problem: Pusty plik JSON
```python
# Sprawdź czy dane zostały załadowane
generator = VisualQuestionGenerator()
generator.load_geodata()
print(f"Kraje: {len(generator.countries_gdf) if generator.countries_gdf else 0}")
print(f"Rzeki: {len(generator.rivers_gdf) if generator.rivers_gdf else 0}")
```

## 🎮 Integracja z Grą

Generator tworzy pytania w formacie kompatybilnym z systemem quiz'u:

```json
{
  "id": "ne_capital_poland",
  "question": "Jaka jest stolica tego kraju?",
  "image": "data:image/svg+xml;base64,PD94bWw...",
  "answers": ["Warszawa", "Kraków", "Wrocław", "Gdańsk"],
  "correct": 0,
  "difficulty": "medium",
  "explanation": "Stolica tego kraju to Warszawa.",
  "visualType": "capital_with_dot"
}
```

## 🌍 Źródła Danych

- **Natural Earth**: Darmowe dane geograficzne wysokiej jakości
- **Kraje**: 50m Admin 0 Countries
- **Rzeki**: 50m Rivers Lake Centerlines  
- **Jeziora**: 50m Lakes (opcjonalnie)

## 📈 Wydajność

- **Pierwsze uruchomienie**: ~2-3 minuty (pobieranie danych)
- **Kolejne uruchomienia**: ~30 sekund (dane już pobrane)
- **Rozmiar danych**: ~50MB dla wszystkich zbiorów
- **Format map**: Wektorowe SVG (skalowalne)

## 🤝 Wkład w Rozwój

Aby dodać nowe funkcje:

1. Skopiuj istniejące funkcje generowania
2. Dostosuj parametry dla nowego typu pytania  
3. Dodaj nowe dane geograficzne w `__init__`
4. Przetestuj z różnymi krajami

## 📞 Pomoc

Jeśli napotkasz problemy:
1. Sprawdź logi generatora - wyświetlają szczegółowe informacje
2. Upewnij się, że wszystkie wymagania są zainstalowane
3. Sprawdź czy dane Natural Earth zostały pobrane do `geodata/`

## ✨ Funkcje Zaawansowane

### Automatyczne Wykrywanie Rzek
Generator automatycznie znajduje rzeki w granicach kraju używając spatial intersection.

### Optymalizacja Pamięci
Dane są ładowane tylko raz i przechowywane w pamięci podczas całego procesu generowania.

### Cache Danych
Pobrane dane Natural Earth są zapisywane lokalnie i nie będą pobierane ponownie.

### Obsługa Błędów
Generator gracefully obsługuje brakujące dane i kontynuuje pracę z dostępnymi zasobami.