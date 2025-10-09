#!/usr/bin/env python3
"""
🗺️ Generator Pytań Wizualnych z Natural Earth Data
Tworzy wysokiej jakości mapy geograficzne dla quiz'u "Wiedza to Potęga"
"""

import os
import json
import base64
import requests
import zipfile
import tempfile
import geopandas as gpd
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

class VisualQuestionGenerator:
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.output_dir = self.base_dir / "questions"
        self.data_dir = self.base_dir / "geodata"
        self.temp_dir = Path(tempfile.mkdtemp())
        
        # Datasets
        self.countries_gdf = None
        self.rivers_gdf = None
        self.lakes_gdf = None
        
        # Mapowanie krajów na nazwy polskie (lepsze niż emoji w SVG)
        self.country_names = {
            'Poland': 'POLSKA',
            'Germany': 'NIEMCY', 
            'France': 'FRANCJA',
            'Spain': 'HISZPANIA',
            'Italy': 'WŁOCHY',
            'United Kingdom': 'W. BRYTANIA',
            'Czech Republic': 'CZECHY',
            'Austria': 'AUSTRIA',
            'Hungary': 'WĘGRY',
            'Romania': 'RUMUNIA',
            'Netherlands': 'HOLANDIA',
            'Portugal': 'PORTUGALIA',
            'Serbia': 'SERBIA',
            'Croatia': 'CHORWACJA',
            'Slovakia': 'SŁOWACJA',
            'Slovenia': 'SŁOWENIA',
            'Switzerland': 'SZWAJCARIA',
            'Belgium': 'BELGIA',
            'Norway': 'NORWEGIA',
            'Sweden': 'SZWECJA',
            'Denmark': 'DANIA',
            'Finland': 'FINLANDIA'
        }
        
        # Ensure directories exist
        self.output_dir.mkdir(exist_ok=True)
        self.data_dir.mkdir(exist_ok=True)
        
    def download_natural_earth_data(self):
        """📦 Pobiera dane Natural Earth - kontury krajów i rzeki"""
        print("🌍 Pobieranie danych Natural Earth...")
        
        datasets = {
            'countries': {
                'url': 'https://naciscdn.org/naturalearth/50m/cultural/ne_50m_admin_0_countries.zip',
                'shapefile': 'ne_50m_admin_0_countries.shp'
            },
            'rivers': {
                'url': 'https://naciscdn.org/naturalearth/50m/physical/ne_50m_rivers_lake_centerlines.zip',
                'shapefile': 'ne_50m_rivers_lake_centerlines.shp'
            },
            'lakes': {
                'url': 'https://naciscdn.org/naturalearth/50m/physical/ne_50m_lakes.zip',
                'shapefile': 'ne_50m_lakes.shp'
            }
        }
        
        for name, info in datasets.items():
            extract_dir = self.data_dir / name
            shapefile_path = extract_dir / info['shapefile']
            
            # Skip if already downloaded
            if shapefile_path.exists():
                print(f"✅ {name} już pobrane")
                continue
                
            try:
                print(f"📦 Pobieranie {name}...")
                
                # Download
                response = requests.get(info['url'], stream=True, timeout=120)
                response.raise_for_status()
                
                # Save zip
                zip_path = self.temp_dir / f"{name}.zip"
                with open(zip_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                # Extract
                extract_dir.mkdir(exist_ok=True)
                with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                    zip_ref.extractall(extract_dir)
                
                print(f"✅ {name} pobrane pomyślnie")
                
            except Exception as e:
                print(f"❌ Błąd pobierania {name}: {e}")
                return False
                
        return True
        
    def load_geodata(self):
        """📂 Ładuje dane geograficzne do pamięci"""
        print("📂 Ładowanie danych geograficznych...")
        
        try:
            # Countries
            countries_path = self.data_dir / 'countries' / 'ne_50m_admin_0_countries.shp'
            if countries_path.exists():
                self.countries_gdf = gpd.read_file(countries_path)
                print(f"✅ Załadowano {len(self.countries_gdf)} krajów")
            
            # Rivers
            rivers_path = self.data_dir / 'rivers' / 'ne_50m_rivers_lake_centerlines.shp'
            if rivers_path.exists():
                self.rivers_gdf = gpd.read_file(rivers_path)
                print(f"✅ Załadowano {len(self.rivers_gdf)} rzek i jezior")
            
            # Lakes
            lakes_path = self.data_dir / 'lakes' / 'ne_50m_lakes.shp'
            if lakes_path.exists():
                self.lakes_gdf = gpd.read_file(lakes_path)
                print(f"✅ Załadowano {len(self.lakes_gdf)} jezior")
                
            return True
            
        except Exception as e:
            print(f"❌ Błąd ładowania danych: {e}")
            return False
    
    def get_country_data(self, country_name):
        """🎯 Znajduje dane kraju w zbiorze danych"""
        if self.countries_gdf is None:
            return None
            
        # Try different name fields
        name_fields = ['NAME', 'NAME_EN', 'NAME_LONG', 'ADMIN']
        
        for field in name_fields:
            if field in self.countries_gdf.columns:
                matches = self.countries_gdf[
                    self.countries_gdf[field].str.contains(
                        country_name, case=False, na=False
                    )
                ]
                if not matches.empty:
                    country_data = matches.iloc[0]
                    
                    # 🚨 SPECIAL HANDLING: Fix oversized countries with overseas territories
                    geometry = country_data.geometry
                    bounds = geometry.bounds
                    width = bounds[2] - bounds[0]
                    height = bounds[3] - bounds[1]
                    
                    # If country bounds are unreasonably large (>50°), filter to main territory
                    if width > 50 or height > 50:
                        print(f"🌍 {country_name} ma terytoria zamorskie - filtrowanie do głównego obszaru")
                        
                        # Get main landmass by finding largest component
                        if hasattr(geometry, 'geoms'):
                            # MultiPolygon - find largest polygon
                            largest_area = 0
                            main_geometry = None
                            for geom in geometry.geoms:
                                if geom.area > largest_area:
                                    largest_area = geom.area
                                    main_geometry = geom
                            if main_geometry:
                                # Create new country data with filtered geometry
                                import pandas as pd
                                filtered_data = country_data.copy()
                                filtered_data.geometry = main_geometry
                                return filtered_data
                    
                    return country_data
        
        print(f"⚠️ Nie znaleziono kraju: {country_name}")
        return None
    
    def get_rivers_in_country(self, country_name, river_name=None):
        """🌊 Znajduje rzeki w danym kraju"""
        if self.rivers_gdf is None:
            return None
            
        country_data = self.get_country_data(country_name)
        if country_data is None:
            return None
        
        # Get rivers within country bounds
        country_geom = country_data.geometry
        
        # Spatial intersection
        rivers_in_country = self.rivers_gdf[
            self.rivers_gdf.geometry.intersects(country_geom)
        ]
        
        if river_name:
            # Filter by river name
            name_fields = ['name', 'NAME', 'name_en']
            for field in name_fields:
                if field in rivers_in_country.columns:
                    specific_river = rivers_in_country[
                        rivers_in_country[field].str.contains(
                            river_name, case=False, na=False
                        )
                    ]
                    if not specific_river.empty:
                        return specific_river
        
        return rivers_in_country
    
    def create_map_svg(self, country_name, question_type='country', 
                      show_capital=False, river_name=None, title=""):
        """🎨 Tworzy wysokiej jakości mapę SVG"""
        
        country_data = self.get_country_data(country_name)
        if country_data is None:
            return None
        
        # 🔍 QUALITY CHECK: Validate geometry size before processing
        bounds = country_data.geometry.bounds
        width = bounds[2] - bounds[0]
        height = bounds[3] - bounds[1]
        
        if width > 100 or height > 100:
            print(f"⚠️ OSTRZEŻENIE: {country_name} nadal ma bardzo duże bounds ({width:.1f}° × {height:.1f}°)")
            print(f"   To może spowodować małą mapę. Sprawdź dane geograficzne.")
        elif width < 0.5 or height < 0.5:
            print(f"⚠️ OSTRZEŻENIE: {country_name} ma bardzo małe bounds ({width:.1f}° × {height:.1f}°)")
            print(f"   To może spowodować zbyt dużą mapę. Sprawdź dane geograficzne.")
        else:
            print(f"✅ {country_name}: Optymalne bounds ({width:.1f}° × {height:.1f}°)")
        
        # Create figure
        fig, ax = plt.subplots(1, 1, figsize=(10, 8))
        ax.set_aspect('equal')
        
        # Style based on question type
        if question_type == 'capital':
            country_color = '#fff3e0'
            border_color = '#e65100'
            bg_color = '#fffef7'
        elif question_type == 'river':
            country_color = '#f0f9ff'
            border_color = '#1e40af'
            bg_color = '#f0f9ff'
        else:  # country outline
            country_color = '#e8f4f8'
            border_color = '#2c5530'
            bg_color = '#f8f9fa'
        
        ax.set_facecolor(bg_color)
        
        # Plot country
        country_gdf = gpd.GeoDataFrame([country_data])
        country_gdf.plot(ax=ax, color=country_color, edgecolor=border_color, 
                        linewidth=2.5, alpha=0.9)
        
        # Add rivers if requested
        if river_name:
            rivers = self.get_rivers_in_country(country_name, river_name)
            if rivers is not None and not rivers.empty:
                rivers.plot(ax=ax, color='#1565c0', linewidth=4, alpha=0.8)
                
                # Add country name as context hint for river questions
                country_label = self.country_names.get(country_name, country_name.upper())
                ax.text(0.05, 0.95, country_label, transform=ax.transAxes, fontsize=12,
                       verticalalignment='top', horizontalalignment='left', fontweight='bold',
                       color='#1565c0',
                       bbox=dict(boxstyle="round,pad=0.5", facecolor='white', alpha=0.9, edgecolor='#1565c0'))
        
        # Add capital if requested
        if show_capital:
            capital_coords = self.get_capital_coordinates(country_name)
            if capital_coords:
                ax.plot(capital_coords[0], capital_coords[1], 'o', 
                       color='#d32f2f', markersize=15, 
                       markeredgecolor='#b71c1c', markeredgewidth=3,
                       zorder=10)
                # Ring around capital
                circle = plt.Circle(capital_coords, 0.5, fill=False, 
                                  color='#d32f2f', linewidth=2, alpha=0.7)
                ax.add_patch(circle)
                # Inner point
                ax.plot(capital_coords[0], capital_coords[1], 'o', 
                       color='#ffcdd2', markersize=6, zorder=11)
        
        # Set bounds with improved sizing
        bounds = country_data.geometry.bounds
        width = bounds[2] - bounds[0]
        height = bounds[3] - bounds[1]
        
        # Minimum size to ensure readability
        min_size = max(width, height) * 0.3
        if width < min_size:
            center_x = (bounds[0] + bounds[2]) / 2
            bounds = (center_x - min_size/2, bounds[1], center_x + min_size/2, bounds[3])
            width = min_size
        if height < min_size:
            center_y = (bounds[1] + bounds[3]) / 2
            bounds = (bounds[0], center_y - min_size/2, bounds[2], center_y + min_size/2)
            height = min_size
            
        # Generous margin for better visibility
        margin = max(width, height) * 0.15
        ax.set_xlim(bounds[0] - margin, bounds[2] + margin)
        ax.set_ylim(bounds[1] - margin, bounds[3] + margin)
        
        # Remove axes
        ax.axis('off')
        
        # Add title if provided
        if title:
            plt.title(title, fontsize=16, fontweight='bold', pad=20)
        
        # Save to SVG string
        import io
        svg_buffer = io.StringIO()
        plt.savefig(svg_buffer, format='svg', bbox_inches='tight', 
                   pad_inches=0.2, facecolor=bg_color, edgecolor='none', 
                   dpi=200, transparent=False)
        plt.close()
        
        svg_content = svg_buffer.getvalue()
        svg_buffer.close()
        
        return svg_content
    
    def get_capital_coordinates(self, country_name):
        """🏛️ Zwraca współrzędne stolicy"""
        capitals = {
            # Europa Zachodnia
            'Poland': (21.0122, 52.2297),
            'Germany': (13.4050, 52.5200),
            'France': (2.3522, 48.8566),
            'Spain': (-3.7038, 40.4168),
            'Italy': (12.4964, 41.9028),
            'United Kingdom': (-0.1276, 51.5074),
            'Portugal': (-9.1393, 38.7223),
            'Netherlands': (4.9041, 52.3676),
            'Belgium': (4.3517, 50.8503),
            'Switzerland': (7.4474, 46.9480),
            'Austria': (16.3738, 48.2082),
            'Ireland': (-6.2603, 53.3498),
            'Luxembourg': (6.1296, 49.8144),
            
            # Europa Środkowa i Wschodnia
            'Czech Republic': (14.4378, 50.0755),
            'Slovakia': (17.1077, 48.1486),
            'Hungary': (19.0402, 47.4979),
            'Romania': (26.1025, 44.4268),
            'Bulgaria': (23.3219, 42.6977),
            'Croatia': (15.9819, 45.8150),
            'Slovenia': (14.5058, 46.0569),
            'Serbia': (20.4489, 44.7866),
            'Bosnia and Herzegovina': (18.4131, 43.8563),
            'Montenegro': (19.2636, 42.4304),
            'North Macedonia': (21.4254, 41.9917),
            'Albania': (19.8187, 41.3275),
            
            # Europa Północna  
            'Sweden': (18.0686, 59.3293),
            'Norway': (10.7522, 59.9139),
            'Denmark': (12.5683, 55.6761),
            'Finland': (24.9384, 60.1699),
            'Iceland': (-21.8174, 64.1466),
            
            # Europa Wschodnia
            'Ukraine': (30.5234, 50.4501),
            'Belarus': (27.5618, 53.9006),
            'Lithuania': (25.2797, 54.6872),
            'Latvia': (24.1052, 56.9496),
            'Estonia': (24.7536, 59.4370),
            
            # Pozostałe
            'Greece': (23.7275, 37.9838),
            'Turkey': (32.8597, 39.9334),
            'Cyprus': (33.4299, 35.1856),
            'Malta': (14.3754, 35.8997)
        }
        return capitals.get(country_name)
    
    def svg_to_base64(self, svg_content):
        """📝 Konwertuje SVG do base64 dla JSON"""
        svg_bytes = svg_content.encode('utf-8')
        base64_string = base64.b64encode(svg_bytes).decode('utf-8')
        return f"data:image/svg+xml;base64,{base64_string}"
    
    def generate_capital_questions(self):
        """🏛️ Generuje pytania o stolice z kropkami"""
        print("🏛️ Generowanie pytań o stolice...")
        questions = []
        
        capitals_data = [
            # Europa Zachodnia - łatwe
            {'country': 'Poland', 'capital': 'Warszawa', 
             'wrong_answers': ['Kraków', 'Wrocław', 'Gdańsk']},
            {'country': 'Germany', 'capital': 'Berlin', 
             'wrong_answers': ['Monachium', 'Hamburg', 'Frankfurt']},
            {'country': 'France', 'capital': 'Paryż', 
             'wrong_answers': ['Lyon', 'Marseille', 'Toulouse']},
            {'country': 'Spain', 'capital': 'Madryt', 
             'wrong_answers': ['Barcelona', 'Valencia', 'Sewilla']},
            {'country': 'Italy', 'capital': 'Rzym', 
             'wrong_answers': ['Mediolan', 'Neapol', 'Turyn']},
            {'country': 'United Kingdom', 'capital': 'Londyn', 
             'wrong_answers': ['Manchester', 'Birmingham', 'Liverpool']},
            {'country': 'Portugal', 'capital': 'Lizbona', 
             'wrong_answers': ['Porto', 'Braga', 'Coimbra']},
            {'country': 'Netherlands', 'capital': 'Amsterdam', 
             'wrong_answers': ['Haga', 'Rotterdam', 'Utrecht']},
            
            # Europa Środkowa - średnie
            {'country': 'Czech Republic', 'capital': 'Praga', 
             'wrong_answers': ['Brno', 'Ostrawa', 'Plzeń']},
            {'country': 'Austria', 'capital': 'Wiedeń', 
             'wrong_answers': ['Salzburg', 'Graz', 'Innsbruck']},
            {'country': 'Hungary', 'capital': 'Budapeszt', 
             'wrong_answers': ['Debreczyn', 'Szeged', 'Pecz']},
            {'country': 'Switzerland', 'capital': 'Berno', 
             'wrong_answers': ['Zurych', 'Genewa', 'Bazylea']},
            {'country': 'Belgium', 'capital': 'Bruksela', 
             'wrong_answers': ['Antwerpia', 'Gandawa', 'Brugia']},
            
            # Europa Północna - średnie
            {'country': 'Sweden', 'capital': 'Sztokholm', 
             'wrong_answers': ['Göteborg', 'Malmö', 'Uppsala']},
            {'country': 'Norway', 'capital': 'Oslo', 
             'wrong_answers': ['Bergen', 'Trondheim', 'Stavanger']},
            {'country': 'Denmark', 'capital': 'Kopenhaga', 
             'wrong_answers': ['Aarhus', 'Odense', 'Aalborg']},
            
            # Europa Wschodnia i Bałkany - trudne
            {'country': 'Romania', 'capital': 'Bukareszt', 
             'wrong_answers': ['Kluż', 'Timișoara', 'Iași']},
            {'country': 'Croatia', 'capital': 'Zagrzeb', 
             'wrong_answers': ['Split', 'Rijeka', 'Osijek']},
            {'country': 'Serbia', 'capital': 'Belgrad', 
             'wrong_answers': ['Novi Sad', 'Niš', 'Kragujevac']},
            {'country': 'Bulgaria', 'capital': 'Sofia', 
             'wrong_answers': ['Płowdiw', 'Warna', 'Burgas']},
            {'country': 'Slovakia', 'capital': 'Bratysława', 
             'wrong_answers': ['Koszyce', 'Preszów', 'Žilina']},
            {'country': 'Slovenia', 'capital': 'Lublana', 
             'wrong_answers': ['Maribor', 'Celje', 'Kranj']},
            
            # Pozostałe
            {'country': 'Greece', 'capital': 'Ateny', 
             'wrong_answers': ['Saloniki', 'Patras', 'Iraklion']},
            {'country': 'Ireland', 'capital': 'Dublin', 
             'wrong_answers': ['Cork', 'Limerick', 'Galway']},
        ]
        
        for data in capitals_data:
            svg_content = self.create_map_svg(
                data['country'], 
                question_type='capital',
                show_capital=True,
                title="Jaka jest stolica tego kraju?"
            )
            
            if svg_content:
                question = {
                    'id': f'ne_capital_{data["country"].lower()}',
                    'question': 'Jaka jest stolica tego kraju?',
                    'image': self.svg_to_base64(svg_content),
                    'answers': [data['capital']] + data['wrong_answers'],
                    'correct': 0,
                    'difficulty': 'medium',
                    'explanation': f'Stolica tego kraju to {data["capital"]}.',
                    'visualType': 'capital_with_dot'
                }
                questions.append(question)
                print(f"✅ Utworzono pytanie o stolicę: {data['country']}")
        
        return questions
    
    def generate_country_questions(self):
        """🗺️ Generuje pytania o rozpoznawanie krajów"""
        print("🗺️ Generowanie pytań o kraje...")
        questions = []
        
        countries_data = [
            # Charakterystyczne kształty - łatwe
            {'country': 'Italy', 'name_pl': 'Włochy', 
             'wrong_answers': ['Hiszpania', 'Grecja', 'Portugalia']},
            {'country': 'Spain', 'name_pl': 'Hiszpania', 
             'wrong_answers': ['Francja', 'Portugalia', 'Włochy']},
            {'country': 'United Kingdom', 'name_pl': 'Wielka Brytania', 
             'wrong_answers': ['Irlandia', 'Islandia', 'Dania']},
            {'country': 'Greece', 'name_pl': 'Grecja', 
             'wrong_answers': ['Turcja', 'Bułgaria', 'Włochy']},
            {'country': 'Norway', 'name_pl': 'Norwegia', 
             'wrong_answers': ['Szwecja', 'Finlandia', 'Islandia']},
            {'country': 'Portugal', 'name_pl': 'Portugalia', 
             'wrong_answers': ['Hiszpania', 'Francja', 'Włochy']},
            
            # Średniej trudności
            {'country': 'Poland', 'name_pl': 'Polska', 
             'wrong_answers': ['Niemcy', 'Czechy', 'Słowacja']},
            {'country': 'France', 'name_pl': 'Francja', 
             'wrong_answers': ['Hiszpania', 'Niemcy', 'Włochy']},
            {'country': 'Germany', 'name_pl': 'Niemcy', 
             'wrong_answers': ['Polska', 'Francja', 'Austria']},
            {'country': 'Sweden', 'name_pl': 'Szwecja', 
             'wrong_answers': ['Norwegia', 'Finlandia', 'Dania']},
            {'country': 'Finland', 'name_pl': 'Finlandia', 
             'wrong_answers': ['Szwecja', 'Norwegia', 'Estonia']},
            {'country': 'Turkey', 'name_pl': 'Turcja', 
             'wrong_answers': ['Grecja', 'Bułgaria', 'Rumunia']},
            {'country': 'Romania', 'name_pl': 'Rumunia', 
             'wrong_answers': ['Bułgaria', 'Węgry', 'Serbia']},
            
            # Trudniejsze - podobne kształty
            {'country': 'Czech Republic', 'name_pl': 'Czechy', 
             'wrong_answers': ['Słowacja', 'Austria', 'Węgry']},
            {'country': 'Slovakia', 'name_pl': 'Słowacja', 
             'wrong_answers': ['Czechy', 'Węgry', 'Austria']},
            {'country': 'Austria', 'name_pl': 'Austria', 
             'wrong_answers': ['Szwajcaria', 'Słowenia', 'Czechy']},
            {'country': 'Hungary', 'name_pl': 'Węgry', 
             'wrong_answers': ['Słowacja', 'Rumunia', 'Serbia']},
            {'country': 'Croatia', 'name_pl': 'Chorwacja', 
             'wrong_answers': ['Bośnia', 'Serbia', 'Słowenia']},
            {'country': 'Serbia', 'name_pl': 'Serbia', 
             'wrong_answers': ['Bośnia', 'Chorwacja', 'Rumunia']},
            {'country': 'Bulgaria', 'name_pl': 'Bułgaria', 
             'wrong_answers': ['Rumunia', 'Serbia', 'Grecja']},
            
            # Małe kraje - bardzo trudne
            {'country': 'Slovenia', 'name_pl': 'Słowenia', 
             'wrong_answers': ['Chorwacja', 'Austria', 'Słowacja']},
            {'country': 'Belgium', 'name_pl': 'Belgia', 
             'wrong_answers': ['Holandia', 'Luksemburg', 'Szwajcaria']},
            {'country': 'Netherlands', 'name_pl': 'Holandia', 
             'wrong_answers': ['Belgia', 'Dania', 'Niemcy']},
            {'country': 'Switzerland', 'name_pl': 'Szwajcaria', 
             'wrong_answers': ['Austria', 'Luksemburg', 'Słowenia']},
            {'country': 'Denmark', 'name_pl': 'Dania', 
             'wrong_answers': ['Holandia', 'Belgia', 'Niemcy']},
        ]
        
        for data in countries_data:
            svg_content = self.create_map_svg(
                data['country'], 
                question_type='country',
                title="Jak nazywa się ten kraj?"
            )
            
            if svg_content:
                question = {
                    'id': f'ne_country_{data["country"].lower()}',
                    'question': 'Jak nazywa się ten kraj?',
                    'image': self.svg_to_base64(svg_content),
                    'answers': [data['name_pl']] + data['wrong_answers'],
                    'correct': 0,
                    'difficulty': 'hard',
                    'explanation': f'To jest {data["name_pl"]}.',
                    'visualType': 'country_outline'
                }
                questions.append(question)
                print(f"✅ Utworzono pytanie o kraj: {data['country']}")
        
        return questions
    
    def generate_river_questions(self):
        """🌊 Generuje pytania o rzeki"""
        print("🌊 Generowanie pytań o rzeki...")
        questions = []
        
        rivers_data = [
            # Główne rzeki europejskie - znane
            {'country': 'Poland', 'river': 'Vistula', 'river_pl': 'Wisła',
             'wrong_answers': ['Odra', 'Bug', 'San']},
            {'country': 'Poland', 'river': 'Oder', 'river_pl': 'Odra',
             'wrong_answers': ['Wisła', 'Warta', 'Noteć']},
            {'country': 'Germany', 'river': 'Rhine', 'river_pl': 'Ren',
             'wrong_answers': ['Dunaj', 'Łaba', 'Mozela']},
            {'country': 'France', 'river': 'Seine', 'river_pl': 'Sekwana',
             'wrong_answers': ['Loara', 'Rodan', 'Garonna']},
            {'country': 'Spain', 'river': 'Ebro', 'river_pl': 'Ebro',
             'wrong_answers': ['Tajo', 'Duero', 'Guadalquivir']},
            {'country': 'Italy', 'river': 'Po', 'river_pl': 'Pad',
             'wrong_answers': ['Tyber', 'Arno', 'Adyga']},
            {'country': 'United Kingdom', 'river': 'Thames', 'river_pl': 'Tamiza',
             'wrong_answers': ['Severn', 'Trent', 'Mersey']},
            
            # Rzeki średnio znane
            {'country': 'Czech Republic', 'river': 'Elbe', 'river_pl': 'Łaba',
             'wrong_answers': ['Morava', 'Dyje', 'Berounka']},
            {'country': 'Austria', 'river': 'Danube', 'river_pl': 'Dunaj',
             'wrong_answers': ['Inn', 'Salzach', 'Enns']},
            {'country': 'Hungary', 'river': 'Danube', 'river_pl': 'Dunaj',
             'wrong_answers': ['Tisza', 'Dráva', 'Rába']},
            {'country': 'Romania', 'river': 'Danube', 'river_pl': 'Dunaj',
             'wrong_answers': ['Prut', 'Siret', 'Olt']},
            {'country': 'Netherlands', 'river': 'Rhine', 'river_pl': 'Ren',
             'wrong_answers': ['Maas', 'IJssel', 'Waal']},
            
            # Rzeki trudniejsze
            {'country': 'Portugal', 'river': 'Tagus', 'river_pl': 'Tag',
             'wrong_answers': ['Douro', 'Mondego', 'Guadiana']},
            {'country': 'Serbia', 'river': 'Danube', 'river_pl': 'Dunaj',
             'wrong_answers': ['Sawa', 'Morava', 'Timok']},
            {'country': 'Croatia', 'river': 'Sava', 'river_pl': 'Sawa',
             'wrong_answers': ['Dunaj', 'Dráva', 'Una']},
        ]
        
        for data in rivers_data:
            svg_content = self.create_map_svg(
                data['country'], 
                question_type='river',
                river_name=data['river'],
                title="Która rzeka jest podświetlona?"
            )
            
            if svg_content:
                question = {
                    'id': f'ne_river_{data["river"].lower()}_{data["country"].lower()}',
                    'question': 'Która rzeka jest podświetlona na mapie?',
                    'image': self.svg_to_base64(svg_content),
                    'answers': [data['river_pl']] + data['wrong_answers'],
                    'correct': 0,
                    'difficulty': 'medium',
                    'explanation': f'To jest rzeka {data["river_pl"]}.',
                    'visualType': 'highlighted_river'
                }
                questions.append(question)
                print(f"✅ Utworzono pytanie o rzekę: {data['river']}")
        
        return questions
    
    def generate_combo_questions(self):
        """🌍 Generuje pytania kombinowane"""
        print("🌍 Generowanie pytań kombinowanych...")
        questions = []
        
        combo_data = [
            # Stolice + główne rzeki
            {
                'country': 'Poland', 'capital': 'Warszawa', 
                'river': 'Vistula', 'river_pl': 'Wisła',
                'question': 'Która rzeka przepływa przez stolicę tego kraju?',
                'wrong_answers': ['Odra', 'Bug', 'Warta']
            },
            {
                'country': 'Germany', 'capital': 'Berlin', 
                'river': 'Spree', 'river_pl': 'Spree',
                'question': 'Która rzeka przepływa przez stolicę tego kraju?',
                'wrong_answers': ['Ren', 'Łaba', 'Mozela']
            },
            {
                'country': 'France', 'capital': 'Paryż', 
                'river': 'Seine', 'river_pl': 'Sekwana',
                'question': 'Która rzeka przepływa przez stolicę tego kraju?',
                'wrong_answers': ['Loara', 'Rodan', 'Garonna']
            },
            {
                'country': 'United Kingdom', 'capital': 'Londyn', 
                'river': 'Thames', 'river_pl': 'Tamiza',
                'question': 'Która rzeka przepływa przez stolicę tego kraju?',
                'wrong_answers': ['Severn', 'Trent', 'Mersey']
            },
            {
                'country': 'Czech Republic', 'capital': 'Praga', 
                'river': 'Vltava', 'river_pl': 'Wełtawa',
                'question': 'Która rzeka przepływa przez stolicę tego kraju?',
                'wrong_answers': ['Łaba', 'Morava', 'Dyje']
            },
            {
                'country': 'Austria', 'capital': 'Wiedeń', 
                'river': 'Danube', 'river_pl': 'Dunaj',
                'question': 'Która rzeka przepływa przez stolicę tego kraju?',
                'wrong_answers': ['Inn', 'Salzach', 'Enns']
            },
            {
                'country': 'Hungary', 'capital': 'Budapeszt', 
                'river': 'Danube', 'river_pl': 'Dunaj',
                'question': 'Która rzeka przepływa przez stolicę tego kraju?',
                'wrong_answers': ['Tisza', 'Dráva', 'Rába']
            },
            {
                'country': 'Serbia', 'capital': 'Belgrad', 
                'river': 'Danube', 'river_pl': 'Dunaj',
                'question': 'Która rzeka przepływa przez stolicę tego kraju?',
                'wrong_answers': ['Sawa', 'Morava', 'Timok']
            }
        ]
        
        for data in combo_data:
            svg_content = self.create_map_svg(
                data['country'], 
                question_type='river',
                show_capital=True,
                river_name=data['river'],
                title=data['question']
            )
            
            if svg_content:
                question = {
                    'id': f'ne_combo_{data["country"].lower()}_{data["river"].lower()}',
                    'question': data['question'],
                    'image': self.svg_to_base64(svg_content),
                    'answers': [data['river_pl']] + data['wrong_answers'],
                    'correct': 0,
                    'difficulty': 'hard',
                    'explanation': f'{data["river_pl"]} przepływa przez {data["capital"]}.',
                    'visualType': 'combination_geography'
                }
                questions.append(question)
                print(f"✅ Utworzono pytanie kombinowane: {data['country']}")
        
        return questions
    
    def generate_all_questions(self):
        """🎯 Generuje wszystkie typy pytań"""
        print("🎯 Rozpoczynam generowanie pytań...")
        
        # Download and load data
        if not self.download_natural_earth_data():
            print("❌ Nie udało się pobrać danych")
            return []
        
        if not self.load_geodata():
            print("❌ Nie udało się załadować danych")
            return []
        
        # Generate all question types
        all_questions = []
        all_questions.extend(self.generate_capital_questions())
        all_questions.extend(self.generate_country_questions())
        all_questions.extend(self.generate_river_questions())
        all_questions.extend(self.generate_combo_questions())
        
        print(f"🎉 Wygenerowano {len(all_questions)} pytań!")
        return all_questions
    
    def save_questions(self, filename='natural_earth_geography.json'):
        """💾 Zapisuje pytania do pliku JSON"""
        questions = self.generate_all_questions()
        
        if not questions:
            print("❌ Brak pytań do zapisania")
            return
        
        output_file = self.output_dir / filename
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        
        print(f"💾 Zapisano {len(questions)} pytań do {output_file}")
        
        # Cleanup temp files
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

if __name__ == "__main__":
    print("🗺️ Generator Pytań Wizualnych - Natural Earth Data")
    print("=" * 50)
    
    generator = VisualQuestionGenerator()
    generator.save_questions()
    
    print("\n✅ Generator zakończył pracę!")
    print("📁 Sprawdź folder 'questions/' - nowe pytania są gotowe!")