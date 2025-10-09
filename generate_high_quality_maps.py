#!/usr/bin/env python3
"""
Generator wysokiej jakości map geograficznych
Używa predefiniowanych, precyzyjnych danych geograficznych
Tworzy 4 typy pytań wizualnych zgodnie z zaleceniami użytkownika
"""

import json
import base64
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.path import Path
import numpy as np
from pathlib import Path as PathLib
import io

class HighQualityMapGenerator:
    def __init__(self):
        self.output_dir = PathLib("questions")
        
    def get_poland_coordinates(self):
        """Prawdziwe współrzędne granic Polski (uproszczone ale precyzyjne)"""
        # Oparte na prawdziwych danych geograficznych
        return np.array([
            [14.1, 54.8], [16.2, 54.5], [18.6, 54.4], [22.7, 54.3], [23.9, 54.2],
            [23.9, 52.5], [24.1, 50.9], [22.7, 49.0], [20.2, 49.0], [18.9, 49.4],
            [17.6, 50.0], [16.2, 50.5], [14.7, 50.8], [14.4, 52.6], [14.1, 54.8]
        ])
        
    def get_germany_coordinates(self):
        """Prawdziwe współrzędne granic Niemiec"""
        return np.array([
            [5.9, 55.1], [9.9, 54.8], [14.1, 54.8], [14.4, 52.6], [14.7, 50.8],
            [12.2, 47.7], [10.2, 47.3], [7.5, 47.6], [6.2, 49.5], [6.0, 51.1],
            [5.9, 53.6], [5.9, 55.1]
        ])
        
    def get_france_coordinates(self):
        """Prawdziwe współrzędne granic Francji"""
        return np.array([
            [-4.8, 48.4], [1.4, 51.1], [4.2, 49.9], [8.2, 49.0], [7.6, 47.6],
            [6.9, 45.9], [7.0, 43.6], [3.1, 42.4], [-1.8, 43.4], [-4.8, 48.4]
        ])
        
    def get_spain_coordinates(self):
        """Prawdziwe współrzędne granic Hiszpanii"""
        return np.array([
            [-9.3, 42.0], [-6.2, 43.8], [-1.8, 43.4], [3.1, 42.4], [3.3, 41.9],
            [2.1, 41.4], [0.7, 41.6], [-0.3, 39.3], [-7.0, 37.1], [-7.4, 37.1],
            [-9.5, 38.7], [-9.3, 42.0]
        ])
        
    def get_italy_coordinates(self):
        """Prawdziwe współrzędne granic Włoch"""
        return np.array([
            [6.6, 45.9], [13.8, 46.5], [16.2, 41.9], [15.5, 37.1], [12.4, 36.6],
            [8.4, 39.2], [7.4, 43.8], [6.6, 45.9]
        ])
        
    def get_uk_coordinates(self):
        """Prawdziwe współrzędne granic Wielkiej Brytanii"""
        return np.array([
            [-8.2, 54.9], [-3.0, 58.6], [-0.5, 59.4], [1.8, 52.8], [1.4, 50.9],
            [-5.7, 49.9], [-10.7, 51.4], [-8.2, 54.9]
        ])
        
    def get_country_geometry(self, country_name):
        """Zwraca współrzędne dla danego kraju"""
        geometries = {
            'Poland': self.get_poland_coordinates(),
            'Germany': self.get_germany_coordinates(),
            'France': self.get_france_coordinates(),
            'Spain': self.get_spain_coordinates(),
            'Italy': self.get_italy_coordinates(),
            'United Kingdom': self.get_uk_coordinates()
        }
        return geometries.get(country_name)
        
    def get_river_coordinates(self, river_name, country):
        """Prawdziwe współrzędne rzek"""
        rivers = {
            'Wisła': np.array([
                [19.9, 49.3], [20.1, 50.1], [21.0, 52.2], [20.6, 53.4], [19.4, 54.4]
            ]),
            'Odra': np.array([
                [17.9, 49.9], [17.5, 50.8], [16.9, 51.7], [14.5, 53.1], [14.1, 53.9]
            ]),
            'Rhine': np.array([
                [8.2, 47.6], [8.5, 49.0], [8.1, 50.1], [6.8, 51.2], [6.1, 51.8]
            ]),
            'Seine': np.array([
                [4.0, 48.0], [2.3, 48.9], [1.2, 49.4], [0.1, 49.4]
            ])
        }
        return rivers.get(river_name)
        
    def get_capital_coordinates(self, country):
        """Współrzędne stolic"""
        capitals = {
            'Poland': (21.0122, 52.2297),  # Warszawa
            'Germany': (13.4050, 52.5200),  # Berlin
            'France': (2.3522, 48.8566),   # Paryż
            'Spain': (-3.7038, 40.4168),   # Madryt
            'Italy': (12.4964, 41.9028),   # Rzym
            'United Kingdom': (-0.1276, 51.5074)  # Londyn
        }
        return capitals.get(country)
        
    def create_high_quality_svg_map(self, country_name, question_type='outline', 
                                   river_name=None, show_capital=False):
        """Tworzy wysokiej jakości mapę SVG"""
        
        # Pobierz współrzędne kraju
        country_coords = self.get_country_geometry(country_name)
        if country_coords is None:
            return None
            
        # Utwórz figurę matplotlib
        fig, ax = plt.subplots(1, 1, figsize=(10, 8))
        ax.set_aspect('equal')
        
        # Kolory według typu pytania
        if question_type == 'outline':
            country_color = '#e8f4f8'
            border_color = '#2c5530'
            bg_color = '#f8f9fa'
        elif question_type == 'capital':
            country_color = '#fff3e0'
            border_color = '#e65100'
            bg_color = '#fffef7'
        elif question_type == 'river':
            country_color = '#f0f9ff'
            border_color = '#1e40af'
            bg_color = '#f0f9ff'
        else:
            country_color = '#f5f5f5'
            border_color = '#333333'
            bg_color = '#ffffff'
            
        # Ustaw tło
        ax.set_facecolor(bg_color)
        
        # Narysuj kontur kraju
        country_polygon = patches.Polygon(country_coords, closed=True, 
                                        facecolor=country_color, 
                                        edgecolor=border_color, 
                                        linewidth=3, alpha=0.8)
        ax.add_patch(country_polygon)
        
        # Dodaj rzekę jeśli podana
        if river_name:
            river_coords = self.get_river_coordinates(river_name, country_name)
            if river_coords is not None:
                ax.plot(river_coords[:, 0], river_coords[:, 1], 
                       color='#1565c0', linewidth=5, alpha=0.9, 
                       solid_capstyle='round', solid_joinstyle='round')
                       
        # Dodaj stolicę jeśli wymagana
        if show_capital:
            capital_coords = self.get_capital_coordinates(country_name)
            if capital_coords:
                # Główny punkt stolicy
                ax.plot(capital_coords[0], capital_coords[1], 'o', 
                       color='#d32f2f', markersize=12, 
                       markeredgecolor='#b71c1c', markeredgewidth=2,
                       zorder=10)
                # Ring wokół stolicy
                circle = plt.Circle(capital_coords, 0.4, fill=False, 
                                  color='#d32f2f', linewidth=2, alpha=0.7)
                ax.add_patch(circle)
                # Wewnętrzny punkt
                ax.plot(capital_coords[0], capital_coords[1], 'o', 
                       color='#ffcdd2', markersize=4, zorder=11)
                       
        # Ustaw granice i usuń osie
        if len(country_coords) > 0:
            margin = 1.0
            ax.set_xlim(country_coords[:, 0].min() - margin, 
                       country_coords[:, 0].max() + margin)
            ax.set_ylim(country_coords[:, 1].min() - margin, 
                       country_coords[:, 1].max() + margin)
        
        ax.axis('off')
        
        # Zapisz jako SVG
        svg_buffer = io.StringIO()
        plt.savefig(svg_buffer, format='svg', bbox_inches='tight', 
                   pad_inches=0.2, facecolor=bg_color, edgecolor='none', 
                   dpi=200, transparent=False)
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
        """Typ 1: Pytania o stolice z kropkami na mapach"""
        questions = []
        
        capitals_data = [
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
        ]
        
        for data in capitals_data:
            svg_content = self.create_high_quality_svg_map(
                data['country'], question_type='capital', show_capital=True
            )
            
            if svg_content:
                question = {
                    'id': f'hq_capital_{data["country"].lower()}',
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
        
    def generate_country_outline_questions(self):
        """Typ 2: Pytania o rozpoznawanie krajów po konturach"""
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
            {'country': 'Spain', 'name_pl': 'Hiszpania', 
             'wrong_answers': ['Francja', 'Portugalia', 'Włochy']},
        ]
        
        for data in countries_data:
            svg_content = self.create_high_quality_svg_map(
                data['country'], question_type='outline'
            )
            
            if svg_content:
                question = {
                    'id': f'hq_outline_{data["country"].lower().replace(" ", "_")}',
                    'question': 'Który kraj przedstawia ta mapa?',
                    'image': self.svg_to_base64(svg_content),
                    'answers': [data['name_pl']] + data['wrong_answers'],
                    'correct': 0,
                    'difficulty': 'hard',
                    'explanation': f'To jest mapa kraju: {data["name_pl"]}.',
                    'visualType': 'country_outline'
                }
                questions.append(question)
                print(f"✅ Utworzono pytanie o kontur: {data['country']}")
                
        return questions
        
    def generate_river_questions(self):
        """Typ 3: Pytania o rzeki podświetlone na mapach"""
        questions = []
        
        rivers_data = [
            {'country': 'Poland', 'river': 'Wisła', 
             'wrong_answers': ['Odra', 'Bug', 'San']},
            {'country': 'Poland', 'river': 'Odra', 
             'wrong_answers': ['Wisła', 'Warta', 'Noteć']},
            {'country': 'Germany', 'river': 'Rhine', 'river_pl': 'Ren',
             'wrong_answers': ['Dunaj', 'Łaba', 'Mozela']},
            {'country': 'France', 'river': 'Seine', 'river_pl': 'Sekwana',
             'wrong_answers': ['Loara', 'Rodan', 'Garonna']},
        ]
        
        for data in rivers_data:
            svg_content = self.create_high_quality_svg_map(
                data['country'], question_type='river', river_name=data['river']
            )
            
            if svg_content:
                river_display = data.get('river_pl', data['river'])
                question = {
                    'id': f'hq_river_{data["river"].lower()}_{data["country"].lower()}',
                    'question': 'Która rzeka jest zaznaczona na mapie?',
                    'image': self.svg_to_base64(svg_content),
                    'answers': [river_display] + data['wrong_answers'],
                    'correct': 0,
                    'difficulty': 'medium',
                    'explanation': f'To jest rzeka {river_display}.',
                    'visualType': 'highlighted_river'
                }
                questions.append(question)
                print(f"✅ Utworzono pytanie o rzekę: {data['river']}")
                
        return questions
        
    def generate_combination_questions(self):
        """Typ 4: Pytania kombinowane (kraj + stolica + rzeka)"""
        questions = []
        
        combination_data = [
            {
                'country': 'Poland', 'capital': 'Warszawa', 'river': 'Wisła',
                'question': 'Która rzeka przepływa przez stolicę tego kraju?',
                'wrong_answers': ['Odra', 'Bug', 'Warta']
            }
        ]
        
        for data in combination_data:
            svg_content = self.create_high_quality_svg_map(
                data['country'], question_type='river', 
                river_name=data['river'], show_capital=True
            )
            
            if svg_content:
                question = {
                    'id': f'hq_combo_{data["country"].lower()}_{data["river"].lower()}',
                    'question': data['question'],
                    'image': self.svg_to_base64(svg_content),
                    'answers': [data['river']] + data['wrong_answers'],
                    'correct': 0,
                    'difficulty': 'hard',
                    'explanation': f'{data["river"]} przepływa przez {data["capital"]}, stolicę tego kraju.',
                    'visualType': 'combination_geography'
                }
                questions.append(question)
                print(f"✅ Utworzono pytanie kombinowane: {data['country']}")
                
        return questions
        
    def generate_all_questions(self):
        """Generuje wszystkie 4 typy pytań wizualnych"""
        print("🎯 Generowanie wysokiej jakości pytań geograficznych...")
        
        all_questions = []
        all_questions.extend(self.generate_capital_questions())
        all_questions.extend(self.generate_country_outline_questions()) 
        all_questions.extend(self.generate_river_questions())
        all_questions.extend(self.generate_combination_questions())
        
        print(f"✅ Wygenerowano {len(all_questions)} wysokiej jakości pytań")
        return all_questions
        
    def save_questions(self):
        """Zapisuje pytania do pliku"""
        questions = self.generate_all_questions()
        
        if not questions:
            print("❌ Brak pytań do zapisania")
            return
            
        output_file = self.output_dir / 'high-quality-geography.json'
        self.output_dir.mkdir(exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
            
        print(f"💾 Zapisano {len(questions)} wysokiej jakości pytań do {output_file}")

if __name__ == "__main__":
    generator = HighQualityMapGenerator()
    generator.save_questions()