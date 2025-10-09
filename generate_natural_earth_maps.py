#!/usr/bin/env python3
"""
Generator wysokiej jakości map geograficznych z danych Natural Earth
Używa GeoPandas do przetwarzania prawdziwych danych geograficznych
Tworzy 4 typy pytań wizualnych: stolice z kropkami, kontury krajów, rzeki, i kombinacje
"""

import json
import base64
import requests
import os
import zipfile
import tempfile
import geopandas as gpd
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from shapely.geometry import Point
from pathlib import Path
import io
import warnings
warnings.filterwarnings('ignore')

class NaturalEarthMapGenerator:
    def __init__(self):
        self.output_dir = Path("questions")
        self.temp_dir = Path(tempfile.mkdtemp())
        self.countries_gdf = None
        self.rivers_gdf = None
        
    def download_natural_earth_data(self):
        """Pobiera i ładuje dane Natural Earth"""
        print("🌍 Pobieranie danych Natural Earth...")
        
        # URLs do danych Natural Earth
        datasets = {
            'countries': {
                'url': 'https://www.naturalearthdata.com/download/50m/cultural/ne_50m_admin_0_countries.zip',
                'shapefile': 'ne_50m_admin_0_countries.shp'
            },
            'rivers': {
                'url': 'https://www.naturalearthdata.com/download/50m/physical/ne_50m_rivers_lake_centerlines.zip',
                'shapefile': 'ne_50m_rivers_lake_centerlines.shp'
            }
        }
        
        for name, info in datasets.items():
            try:
                print(f"📦 Pobieranie {name}...")
                response = requests.get(info['url'], stream=True, timeout=60)
                response.raise_for_status()
                
                zip_path = self.temp_dir / f"{name}.zip"
                with open(zip_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                # Rozpakuj
                extract_dir = self.temp_dir / name
                extract_dir.mkdir(exist_ok=True)
                with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                    zip_ref.extractall(extract_dir)
                
                # Załaduj shapefile
                shapefile_path = extract_dir / info['shapefile']
                if shapefile_path.exists():
                    if name == 'countries':
                        self.countries_gdf = gpd.read_file(shapefile_path)
                        print(f"✅ Załadowano {len(self.countries_gdf)} krajów")
                    elif name == 'rivers':
                        self.rivers_gdf = gpd.read_file(shapefile_path)
                        print(f"✅ Załadowano {len(self.rivers_gdf)} rzek")
                else:
                    print(f"⚠️ Nie znaleziono pliku {info['shapefile']}")
                    
            except Exception as e:
                print(f"❌ Błąd pobierania {name}: {e}")
                return False
        
        return True
        
    def create_country_map_svg(self, country_name, question_type='outline', river_name=None, capital_coords=None):
        """Tworzy SVG mapy kraju z danych Natural Earth"""
        
        if self.countries_gdf is None:
            raise ValueError("Dane krajów nie zostały załadowane")
            
        # Znajdź kraj
        country_row = self.countries_gdf[
            (self.countries_gdf['NAME'].str.contains(country_name, case=False, na=False)) |
            (self.countries_gdf['NAME_EN'].str.contains(country_name, case=False, na=False))
        ]
        
        if country_row.empty:
            print(f"❌ Nie znaleziono kraju: {country_name}")
            return None
            
        country_geom = country_row.iloc[0].geometry
        
        # Utwórz figurę matplotlib
        fig, ax = plt.subplots(1, 1, figsize=(8, 6))
        ax.set_aspect('equal')
        
        # Narysuj kraj
        if question_type == 'outline':
            # Kraj z kontrastującymi kolorami
            country_row.plot(ax=ax, color='#e8f4f8', edgecolor='#2c5530', linewidth=2)
        elif question_type == 'capital':
            # Kraj w innym kolorze dla pytań o stolice
            country_row.plot(ax=ax, color='#fff3e0', edgecolor='#e65100', linewidth=2)
        elif question_type == 'river':
            # Kraj z lekkim odcieniem dla rzek
            country_row.plot(ax=ax, color='#f0f9ff', edgecolor='#1e40af', linewidth=2)
            
        # Dodaj rzekę jeśli podana
        if river_name and self.rivers_gdf is not None:
            # Znajdź rzekę w obrębie kraju
            bounds = country_geom.bounds
            rivers_in_area = self.rivers_gdf.cx[bounds[0]:bounds[2], bounds[1]:bounds[3]]
            
            river_matches = rivers_in_area[
                rivers_in_area['name'].str.contains(river_name, case=False, na=False)
            ]
            
            if not river_matches.empty:
                # Narysuj rzekę
                river_matches.plot(ax=ax, color='#1565c0', linewidth=3, alpha=0.8)
            else:
                print(f"⚠️ Nie znaleziono rzeki {river_name} w {country_name}")
                
        # Dodaj stolicę jeśli podana
        if capital_coords:
            ax.plot(capital_coords[0], capital_coords[1], 'o', 
                   color='#d32f2f', markersize=8, markeredgecolor='#b71c1c', markeredgewidth=2)
            # Dodaj ring wokół stolicy
            circle = plt.Circle(capital_coords, 0.3, fill=False, color='#d32f2f', 
                              linewidth=1, alpha=0.6)
            ax.add_patch(circle)
            
        # Usuń osie i ustaw granice
        ax.set_xlim(country_geom.bounds[0] - 0.5, country_geom.bounds[2] + 0.5)
        ax.set_ylim(country_geom.bounds[1] - 0.5, country_geom.bounds[3] + 0.5)
        ax.axis('off')
        
        # Zapisz do SVG
        svg_buffer = io.StringIO()
        plt.savefig(svg_buffer, format='svg', bbox_inches='tight', pad_inches=0.1, 
                   facecolor='white', edgecolor='none', dpi=150)
        plt.close()
        
        svg_content = svg_buffer.getvalue()
        svg_buffer.close()
        
        return svg_content
        
    def svg_to_base64(self, svg_content: str) -> str:
        """Konwertuje SVG do base64"""
        svg_bytes = svg_content.encode('utf-8')
        base64_string = base64.b64encode(svg_bytes).decode('utf-8')
        return f"data:image/svg+xml;base64,{base64_string}"
        
    def generate_capital_questions(self):
        """Generuje pytania o stolice z kropkami na mapach"""
        questions = []
        
        capitals_data = [
            {'country': 'Poland', 'capital': 'Warszawa', 'coords': [21.0122, 52.2297], 
             'wrong_answers': ['Kraków', 'Wrocław', 'Gdańsk']},
            {'country': 'Germany', 'capital': 'Berlin', 'coords': [13.4050, 52.5200], 
             'wrong_answers': ['Munich', 'Hamburg', 'Frankfurt']},
            {'country': 'France', 'capital': 'Paris', 'coords': [2.3522, 48.8566], 
             'wrong_answers': ['Lyon', 'Marseille', 'Toulouse']},
            {'country': 'Spain', 'capital': 'Madrid', 'coords': [-3.7038, 40.4168], 
             'wrong_answers': ['Barcelona', 'Valencia', 'Sevilla']},
        ]
        
        for data in capitals_data:
            try:
                svg_content = self.create_country_map_svg(
                    data['country'], 
                    question_type='capital',
                    capital_coords=data['coords']
                )
                
                if svg_content:
                    question = {
                        'id': f'ne_capital_{data["country"].lower()}',
                        'question': 'Jaka jest stolica tego kraju?',
                        'image': self.svg_to_base64(svg_content),
                        'answers': [data['capital']] + data['wrong_answers'],
                        'correct': 0,
                        'difficulty': 'medium',
                        'explanation': f'Stolica {data["country"]} to {data["capital"]}.',
                        'visualType': 'capital_with_dot'
                    }
                    questions.append(question)
                    print(f"✅ Utworzono pytanie o stolicę: {data['country']}")
                    
            except Exception as e:
                print(f"❌ Błąd tworzenia pytania o {data['country']}: {e}")
                
        return questions
        
    def generate_country_outline_questions(self):
        """Generuje pytania o rozpoznawanie krajów po konturach"""
        questions = []
        
        countries_data = [
            {'country': 'Poland', 'name_pl': 'Polska', 
             'wrong_answers': ['Niemcy', 'Czechy', 'Słowacja']},
            {'country': 'Italy', 'name_pl': 'Włochy', 
             'wrong_answers': ['Hiszpania', 'Grecja', 'Portugalia']},
            {'country': 'United Kingdom', 'name_pl': 'Wielka Brytania', 
             'wrong_answers': ['Irlandia', 'Islandia', 'Dania']},
            {'country': 'France', 'name_pl': 'Francja', 
             'wrong_answers': ['Hiszpania', 'Niemcy', 'Włochy']},
        ]
        
        for data in countries_data:
            try:
                svg_content = self.create_country_map_svg(
                    data['country'], 
                    question_type='outline'
                )
                
                if svg_content:
                    question = {
                        'id': f'ne_outline_{data["country"].lower().replace(" ", "_")}',
                        'question': 'Który kraj przedstawia ta mapa?',
                        'image': self.svg_to_base64(svg_content),
                        'answers': [data['name_pl']] + data['wrong_answers'],
                        'correct': 0,
                        'difficulty': 'hard',
                        'explanation': f'To jest mapa {data["name_pl"]}.',
                        'visualType': 'country_outline'
                    }
                    questions.append(question)
                    print(f"✅ Utworzono pytanie o kontur: {data['country']}")
                    
            except Exception as e:
                print(f"❌ Błąd tworzenia pytania o kontur {data['country']}: {e}")
                
        return questions
        
    def generate_river_questions(self):
        """Generuje pytania o rzeki podświetlone na mapach"""
        questions = []
        
        rivers_data = [
            {'country': 'Poland', 'river': 'Vistula', 'river_pl': 'Wisła',
             'wrong_answers': ['Odra', 'Bug', 'San']},
            {'country': 'Poland', 'river': 'Oder', 'river_pl': 'Odra',
             'wrong_answers': ['Wisła', 'Warta', 'Noteć']},
            {'country': 'Germany', 'river': 'Rhine', 'river_pl': 'Ren',
             'wrong_answers': ['Dunaj', 'Łaba', 'Mozela']},
            {'country': 'France', 'river': 'Seine', 'river_pl': 'Sekwana',
             'wrong_answers': ['Loara', 'Rodan', 'Garonna']},
        ]
        
        for data in rivers_data:
            try:
                svg_content = self.create_country_map_svg(
                    data['country'], 
                    question_type='river',
                    river_name=data['river']
                )
                
                if svg_content:
                    question = {
                        'id': f'ne_river_{data["river"].lower()}_{data["country"].lower()}',
                        'question': f'Która rzeka jest zaznaczona na mapie?',
                        'image': self.svg_to_base64(svg_content),
                        'answers': [data['river_pl']] + data['wrong_answers'],
                        'correct': 0,
                        'difficulty': 'medium',
                        'explanation': f'To jest rzeka {data["river_pl"]} w {data["country"]}.',
                        'visualType': 'highlighted_river'
                    }
                    questions.append(question)
                    print(f"✅ Utworzono pytanie o rzekę: {data['river']} w {data['country']}")
                    
            except Exception as e:
                print(f"❌ Błąd tworzenia pytania o rzekę {data['river']}: {e}")
                
        return questions
        
    def generate_combination_questions(self):
        """Generuje pytania kombinowane (kraj + stolica + rzeka)"""
        questions = []
        
        combination_data = [
            {
                'country': 'Poland', 'capital': 'Warszawa', 'coords': [21.0122, 52.2297],
                'river': 'Vistula', 'river_pl': 'Wisła',
                'question': 'Która rzeka przepływa przez stolicę tego kraju?',
                'wrong_answers': ['Odra', 'Bug', 'Warta']
            }
        ]
        
        for data in combination_data:
            try:
                svg_content = self.create_country_map_svg(
                    data['country'], 
                    question_type='river',
                    river_name=data['river'],
                    capital_coords=data['coords']
                )
                
                if svg_content:
                    question = {
                        'id': f'ne_combo_{data["country"].lower()}_{data["river"].lower()}',
                        'question': data['question'],
                        'image': self.svg_to_base64(svg_content),
                        'answers': [data['river_pl']] + data['wrong_answers'],
                        'correct': 0,
                        'difficulty': 'hard',
                        'explanation': f'{data["river_pl"]} przepływa przez {data["capital"]}, stolicę {data["country"]}.',
                        'visualType': 'combination_geography'
                    }
                    questions.append(question)
                    print(f"✅ Utworzono pytanie kombinowane: {data['country']}")
                    
            except Exception as e:
                print(f"❌ Błąd tworzenia pytania kombinowanego {data['country']}: {e}")
                
        return questions
        
    def generate_all_questions(self):
        """Generuje wszystkie typy pytań wizualnych"""
        print("🎯 Generowanie pytań z danych Natural Earth...")
        
        if not self.download_natural_earth_data():
            print("❌ Nie udało się pobrać danych Natural Earth")
            return []
            
        all_questions = []
        
        # Generuj wszystkie 4 typy pytań
        all_questions.extend(self.generate_capital_questions())
        all_questions.extend(self.generate_country_outline_questions()) 
        all_questions.extend(self.generate_river_questions())
        all_questions.extend(self.generate_combination_questions())
        
        print(f"✅ Wygenerowano {len(all_questions)} pytań Natural Earth")
        return all_questions
        
    def save_questions(self):
        """Zapisuje pytania do pliku"""
        questions = self.generate_all_questions()
        
        if not questions:
            print("❌ Brak pytań do zapisania")
            return
            
        output_file = self.output_dir / 'natural-earth-geography.json'
        self.output_dir.mkdir(exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
            
        print(f"💾 Zapisano {len(questions)} pytań Natural Earth do {output_file}")
        
        # Usuń pliki tymczasowe
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)
        print("🧹 Usunięto pliki tymczasowe")

if __name__ == "__main__":
    generator = NaturalEarthMapGenerator()
    generator.save_questions()