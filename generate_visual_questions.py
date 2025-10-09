#!/usr/bin/env python3
"""
Generator pytań wizualnych z mapami krajów, stolic i rzek
Używa danych z Natural Earth i REST Countries API
"""

import json
import base64
import requests
import os
from typing import List, Dict
import xml.etree.ElementTree as ET

class VisualQuestionGenerator:
    def __init__(self):
        self.countries_data = {}
        self.rivers_data = {}
        self.questions = []
        
    def load_countries_data(self):
        """Pobiera dane o krajach z REST Countries API"""
        print("📡 Pobieranie danych o krajach...")
        try:
            response = requests.get("https://restcountries.com/v3.1/all")
            countries = response.json()
            
            for country in countries:
                name = country.get('name', {}).get('common', '')
                capital = country.get('capital', [''])[0] if country.get('capital') else ''
                region = country.get('region', '')
                
                if name and capital:
                    self.countries_data[name] = {
                        'capital': capital,
                        'region': region,
                        'name_pl': self.translate_country_name(name)
                    }
                    
            print(f"✅ Załadowano {len(self.countries_data)} krajów")
            
        except Exception as e:
            print(f"❌ Błąd pobierania danych krajów: {e}")
            
    def translate_country_name(self, name: str) -> str:
        """Tłumaczy nazwy krajów na polski"""
        translations = {
            'Poland': 'Polska',
            'Germany': 'Niemcy', 
            'France': 'Francja',
            'Spain': 'Hiszpania',
            'Italy': 'Włochy',
            'United Kingdom': 'Wielka Brytania',
            'Russia': 'Rosja',
            'China': 'Chiny',
            'United States': 'Stany Zjednoczone',
            'Brazil': 'Brazylia',
            'India': 'Indie',
            'Japan': 'Japonia',
            'Australia': 'Australia',
            'Canada': 'Kanada',
            'Mexico': 'Meksyk'
        }
        return translations.get(name, name)
        
    def create_simple_country_svg(self, country_name: str, highlight_capital: bool = False) -> str:
        """Tworzy proste SVG kraju (placeholder - do zastąpienia prawdziwymi danymi)"""
        
        # Proste kształty krajów (przykładowe)
        country_shapes = {
            'Poland': 'M100,50 L200,60 L220,150 L180,200 L80,180 L60,120 Z',
            'France': 'M80,80 L150,70 L180,120 L170,180 L120,200 L90,160 L70,120 Z',
            'Germany': 'M120,40 L180,50 L200,120 L190,180 L140,190 L100,160 L110,100 Z',
            'Italy': 'M140,100 L160,120 L150,200 L130,250 L120,230 L125,180 L135,150 Z'
        }
        
        shape = country_shapes.get(country_name, 'M100,100 L200,100 L200,200 L100,200 Z')
        
        svg = f'''<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <style>
                    .country {{ fill: #e0e0e0; stroke: #333; stroke-width: 2; }}
                    .capital {{ fill: #ff4444; stroke: #333; stroke-width: 1; }}
                    .text {{ font-family: Arial; font-size: 14px; fill: #333; }}
                </style>
            </defs>
            
            <!-- Kraj -->
            <path d="{shape}" class="country"/>
            
            <!-- Stolica (jeśli highlight_capital) -->
            {f'<circle cx="150" cy="130" r="6" class="capital"/>' if highlight_capital else ''}
            
            <!-- Nazwa kraju -->
            <text x="200" y="280" class="text" text-anchor="middle">{country_name}</text>
        </svg>'''
        
        return svg
        
    def create_river_svg(self, river_name: str, country_name: str) -> str:
        """Tworzy SVG rzeki w kraju"""
        
        # Proste kształty rzek (przykładowe)
        river_paths = {
            'Wisła': 'M150,50 Q170,100 160,150 Q155,200 150,250',
            'Odra': 'M120,60 Q140,120 135,180 Q130,220 125,260',
            'Dunaj': 'M80,120 Q150,125 220,130 Q280,135 340,140',
            'Ren': 'M150,40 Q155,100 160,160 Q165,220 170,280'
        }
        
        country_shape = 'M100,50 L200,60 L220,150 L180,200 L80,180 L60,120 Z'
        river_path = river_paths.get(river_name, 'M100,100 L200,200')
        
        svg = f'''<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <style>
                    .country {{ fill: #f0f0f0; stroke: #666; stroke-width: 1; }}
                    .river {{ fill: none; stroke: #4169E1; stroke-width: 4; }}
                    .text {{ font-family: Arial; font-size: 14px; fill: #333; }}
                </style>
            </defs>
            
            <!-- Kontury kraju -->
            <path d="{country_shape}" class="country"/>
            
            <!-- Rzeka -->
            <path d="{river_path}" class="river"/>
            
            <!-- Etykiety -->
            <text x="200" y="20" class="text" text-anchor="middle" font-weight="bold">Rzeka w {country_name}</text>
        </svg>'''
        
        return svg
        
    def svg_to_base64(self, svg_content: str) -> str:
        """Konwertuje SVG do base64 data URL"""
        svg_bytes = svg_content.encode('utf-8')
        base64_string = base64.b64encode(svg_bytes).decode('utf-8')
        return f"data:image/svg+xml;base64,{base64_string}"
        
    def generate_capital_questions(self) -> List[Dict]:
        """Generuje pytania o stolice z mapami"""
        questions = []
        
        # Wybierz najpopularniejsze kraje
        popular_countries = ['Poland', 'Germany', 'France', 'Spain', 'Italy']
        
        for country in popular_countries:
            if country in self.countries_data:
                country_data = self.countries_data[country]
                
                # SVG z zaznaczoną stolicą
                svg_content = self.create_simple_country_svg(country, highlight_capital=True)
                image_data = self.svg_to_base64(svg_content)
                
                # Niepoprawne odpowiedzi - stolice innych krajów
                other_capitals = [
                    data['capital'] for name, data in self.countries_data.items() 
                    if name != country and data['capital']
                ][:3]
                
                answers = [country_data['capital']] + other_capitals
                
                question = {
                    'id': f'visual_capital_{country.lower().replace(" ", "_")}',
                    'question': f'Jaka jest stolica tego kraju?',
                    'image': image_data,
                    'answers': answers,
                    'correct': 0,
                    'difficulty': 'medium',
                    'explanation': f'Stolica {self.translate_country_name(country)} to {country_data["capital"]}.',
                    'visualType': 'country_capital'
                }
                
                questions.append(question)
                
        return questions
        
    def generate_river_questions(self) -> List[Dict]:
        """Generuje pytania o rzeki"""
        questions = []
        
        # Popularne rzeki
        rivers = {
            'Wisła': 'Polska',
            'Odra': 'Polska', 
            'Dunaj': 'Europa',
            'Ren': 'Niemcy'
        }
        
        for river, country in rivers.items():
            svg_content = self.create_river_svg(river, country)
            image_data = self.svg_to_base64(svg_content)
            
            # Inne rzeki jako niepoprawne odpowiedzi
            other_rivers = [r for r in rivers.keys() if r != river][:3]
            answers = [river] + other_rivers
            
            question = {
                'id': f'visual_river_{river.lower().replace(" ", "_")}',
                'question': 'Która rzeka jest pokazana na mapie?',
                'image': image_data,
                'answers': answers,
                'correct': 0,
                'difficulty': 'medium',
                'explanation': f'To jest rzeka {river}.',
                'visualType': 'river_identification'
            }
            
            questions.append(question)
            
        return questions
        
    def generate_all_questions(self) -> List[Dict]:
        """Generuje wszystkie pytania wizualne"""
        print("🎯 Generowanie pytań wizualnych...")
        
        self.load_countries_data()
        
        all_questions = []
        all_questions.extend(self.generate_capital_questions())
        all_questions.extend(self.generate_river_questions())
        
        print(f"✅ Wygenerowano {len(all_questions)} pytań wizualnych")
        return all_questions
        
    def save_to_file(self, filename: str = 'questions/visual-geography.json'):
        """Zapisuje pytania do pliku JSON"""
        questions = self.generate_all_questions()
        
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
            
        print(f"💾 Zapisano {len(questions)} pytań do {filename}")
        
if __name__ == "__main__":
    generator = VisualQuestionGenerator()
    generator.save_to_file()