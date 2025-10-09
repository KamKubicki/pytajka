#!/usr/bin/env python3
"""
Skrypt do importu pytań z plików JSON do głównej bazy questions-polish.json
Sprawdza duplikaty i dodaje nowe pytania w odpowiednich kategoriach.
"""

import json
import os
import sys
from typing import Dict, List, Set, Tuple

# Mapowanie kategorii na podstawie ID pytań i treści
CATEGORY_MAPPING = {
    'sci_': 'nauka_polska',
    'tech_': 'nauka_polska', 
    'geo_world_': 'geografia_swiata',
    'geo_': 'geografia_polski',
    'hist_world_': 'historia_swiata',
    'hist_': 'historia_polski',
    'sport_': 'sport_polski',
    'cult_': 'kultura_polska',
    'art_': 'kultura_polska',
    'lit_': 'kultura_polska',
    'ent_': 'rozrywka_polska',
    'film_': 'rozrywka_polska',
    'music_': 'rozrywka_polska'
}

def load_json_file(filepath: str) -> List[Dict]:
    """Ładuje plik JSON i zwraca listę pytań."""
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            data = json.load(file)
            if isinstance(data, list):
                return data
            elif isinstance(data, dict) and 'questions' in data:
                return data['questions']
            else:
                print(f"⚠️  Nieznana struktura pliku {filepath}")
                return []
    except json.JSONDecodeError as e:
        print(f"❌ Błąd JSON w pliku {filepath}: {e}")
        return []
    except FileNotFoundError:
        print(f"❌ Nie znaleziono pliku {filepath}")
        return []
    except Exception as e:
        print(f"❌ Błąd podczas czytania {filepath}: {e}")
        return []

def load_main_database(filepath: str) -> Dict:
    """Ładuje główną bazę pytań."""
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"❌ Nie znaleziono głównej bazy {filepath}")
        return {}
    except Exception as e:
        print(f"❌ Błąd podczas czytania głównej bazy: {e}")
        return {}

def validate_question(question: Dict) -> List[str]:
    """Sprawdza czy pytanie ma poprawną strukturę."""
    errors = []
    
    required_fields = ['id', 'question', 'answers', 'correct']
    for field in required_fields:
        if field not in question:
            errors.append(f"Brak pola '{field}'")
    
    if 'answers' in question:
        if not isinstance(question['answers'], list):
            errors.append("Pole 'answers' musi być listą")
        elif len(question['answers']) != 4:
            errors.append("Musi być dokładnie 4 odpowiedzi")
    
    if 'correct' in question:
        if not isinstance(question['correct'], int) or question['correct'] not in [0, 1, 2, 3]:
            errors.append("Pole 'correct' musi być liczbą 0-3")
    
    return errors

def normalize_question_text(text: str) -> str:
    """Normalizuje tekst pytania do porównania."""
    return text.lower().strip().replace('?', '').replace('.', '').replace(',', '')

def find_duplicates(questions: List[Dict]) -> List[Tuple[str, str, str]]:
    """Znajduje duplikaty na podstawie ID i podobnej treści pytania."""
    duplicates = []
    seen_ids = set()
    seen_questions = {}
    
    for q in questions:
        q_id = q.get('id', '')
        q_text = q.get('question', '')
        q_normalized = normalize_question_text(q_text)
        
        # Sprawdź duplikaty ID
        if q_id in seen_ids:
            duplicates.append(('id', q_id, f"Duplikat ID: {q_id}"))
        seen_ids.add(q_id)
        
        # Sprawdź podobne pytania
        if q_normalized in seen_questions:
            duplicates.append(('question', q_text, f"Podobne pytanie: '{q_text}' i '{seen_questions[q_normalized]}'"))
        seen_questions[q_normalized] = q_text
    
    return duplicates

def determine_category(question: Dict) -> str:
    """Określa kategorię pytania na podstawie ID i treści."""
    q_id = question.get('id', '')
    q_text = question.get('question', '').lower()
    
    # Sprawdź mapowanie na podstawie ID
    for prefix, category in CATEGORY_MAPPING.items():
        if q_id.startswith(prefix):
            return category
    
    # Sprawdź słowa kluczowe w treści
    if any(word in q_text for word in ['polska', 'polsk', 'warszawa', 'kraków', 'wisła']):
        if any(word in q_text for word in ['historia', 'król', 'wojna', 'bitwa']):
            return 'historia_polski'
        elif any(word in q_text for word in ['rzeka', 'góra', 'miasto', 'województwo']):
            return 'geografia_polski'
        elif any(word in q_text for word in ['kultura', 'literatura', 'chopin', 'mickiewicz']):
            return 'kultura_polska'
        elif any(word in q_text for word in ['sport', 'piłka', 'skoki', 'medal']):
            return 'sport_polski'
        else:
            return 'kultura_polska'  # domyślnie polska kultura
    
    # Kategorie światowe/ogólne
    if any(word in q_text for word in ['chromosom', 'atom', 'chemia', 'fizyka', 'biologia']):
        return 'nauka_polska'
    elif any(word in q_text for word in ['rzeka', 'kontynent', 'stolica', 'kraj']):
        return 'geografia_swiata'
    elif any(word in q_text for word in ['wojna światowa', 'napoleon', 'hitler']):
        return 'historia_swiata'
    
    # Domyślna kategoria
    return 'nauka_polska'

def add_missing_categories(database: Dict, new_categories: Set[str]):
    """Dodaje brakujące kategorie do bazy danych."""
    category_templates = {
        'nauka_polska': {
            'name': 'Nauka i Wynalazki',
            'color': '#4169E1',
            'icon': '🔬',
            'questions': []
        },
        'geografia_swiata': {
            'name': 'Geografia Świata',
            'color': '#228B22',
            'icon': '🌍',
            'questions': []
        },
        'historia_swiata': {
            'name': 'Historia Świata',
            'color': '#8B4513',
            'icon': '🌍',
            'questions': []
        }
    }
    
    added_categories = []
    for category in new_categories:
        if category not in database['categories']:
            if category in category_templates:
                database['categories'][category] = category_templates[category]
                added_categories.append(category)
                print(f"➕ Dodano nową kategorię: {category}")
            else:
                print(f"⚠️  Nieznana kategoria: {category}")
    
    return added_categories

def main():
    print("🚀 Importowanie pytań do bazy questions-polish.json")
    print("=" * 60)
    
    # Pliki źródłowe
    source_files = [
        'baza-pytan-500plus.json',
        'dodatkowe-pytania.json',
        'pytania-cleaned.json',
        'dodatkowe-pytania-150.json'
    ]
    
    main_db_file = 'questions-polish.json'
    
    # Załaduj główną bazę
    print(f"📖 Ładowanie głównej bazy: {main_db_file}")
    database = load_main_database(main_db_file)
    if not database:
        print("❌ Nie można załadować głównej bazy danych!")
        sys.exit(1)
    
    # Zbierz wszystkie istniejące pytania
    existing_questions = []
    existing_ids = set()
    existing_texts = set()
    
    for category_data in database.get('categories', {}).values():
        for question in category_data.get('questions', []):
            existing_questions.append(question)
            existing_ids.add(question.get('id', ''))
            existing_texts.add(normalize_question_text(question.get('question', '')))
    
    print(f"📊 Istniejąca baza: {len(existing_questions)} pytań w {len(database.get('categories', {}))} kategoriach")
    
    # Przetwarzaj każdy plik źródłowy
    all_new_questions = []
    skipped_questions = []
    invalid_questions = []
    
    for source_file in source_files:
        if not os.path.exists(source_file):
            print(f"⚠️  Plik {source_file} nie istnieje, pomijam...")
            continue
            
        print(f"\n📂 Przetwarzam: {source_file}")
        questions = load_json_file(source_file)
        
        if not questions:
            print(f"⚠️  Brak pytań w pliku {source_file}")
            continue
        
        print(f"📊 Znaleziono {len(questions)} pytań")
        
        # Sprawdź duplikaty w samym pliku
        file_duplicates = find_duplicates(questions)
        if file_duplicates:
            print(f"⚠️  Znaleziono {len(file_duplicates)} duplikatów w pliku:")
            for dup_type, dup_id, dup_msg in file_duplicates[:5]:  # Pokaż pierwsze 5
                print(f"   - {dup_msg}")
        
        # Przetwarzaj każde pytanie
        for question in questions:
            # Walidacja
            errors = validate_question(question)
            if errors:
                invalid_questions.append((source_file, question.get('id', 'BRAK_ID'), errors))
                continue
            
            q_id = question.get('id')
            q_text = normalize_question_text(question.get('question', ''))
            
            # Sprawdź duplikaty z istniejącą bazą
            if q_id in existing_ids:
                skipped_questions.append((source_file, q_id, 'Duplikat ID'))
                continue
            
            if q_text in existing_texts:
                skipped_questions.append((source_file, q_id, 'Podobne pytanie'))
                continue
            
            # Dodaj do nowych pytań
            all_new_questions.append(question)
            existing_ids.add(q_id)
            existing_texts.add(q_text)
    
    # Podsumowanie walidacji
    print(f"\n📊 Podsumowanie walidacji:")
    print(f"   ✅ Nowe pytania do dodania: {len(all_new_questions)}")
    print(f"   ⏭️  Pominięte (duplikaty): {len(skipped_questions)}")
    print(f"   ❌ Nieprawidłowe pytania: {len(invalid_questions)}")
    
    if invalid_questions:
        print(f"\n❌ Nieprawidłowe pytania:")
        for filename, q_id, errors in invalid_questions[:10]:  # Pokaż pierwsze 10
            print(f"   {filename} - {q_id}: {', '.join(errors)}")
    
    if skipped_questions:
        print(f"\n⏭️  Przykłady pominiętych:")
        for filename, q_id, reason in skipped_questions[:5]:  # Pokaż pierwsze 5
            print(f"   {filename} - {q_id}: {reason}")
    
    if not all_new_questions:
        print("\n🎯 Brak nowych pytań do dodania!")
        return
    
    # Kategoryzuj nowe pytania
    questions_by_category = {}
    new_categories = set()
    
    for question in all_new_questions:
        category = determine_category(question)
        if category not in questions_by_category:
            questions_by_category[category] = []
        questions_by_category[category].append(question)
        
        if category not in database.get('categories', {}):
            new_categories.add(category)
    
    # Dodaj nowe kategorie jeśli potrzeba
    if new_categories:
        add_missing_categories(database, new_categories)
    
    # Dodaj pytania do odpowiednich kategorii
    total_added = 0
    for category, questions in questions_by_category.items():
        if category in database['categories']:
            database['categories'][category]['questions'].extend(questions)
            total_added += len(questions)
            print(f"➕ Dodano {len(questions)} pytań do kategorii '{category}'")
        else:
            print(f"⚠️  Nie można dodać pytań do nieznanej kategorii: {category}")
    
    # Zapisz zaktualizowaną bazę
    backup_file = f"{main_db_file}.backup"
    print(f"\n💾 Tworzę kopię zapasową: {backup_file}")
    
    try:
        with open(backup_file, 'w', encoding='utf-8') as file:
            json.dump(database, file, ensure_ascii=False, indent=2)
        
        print(f"💾 Zapisuję zaktualizowaną bazę: {main_db_file}")
        with open(main_db_file, 'w', encoding='utf-8') as file:
            json.dump(database, file, ensure_ascii=False, indent=2)
        
        print(f"\n🎉 Sukces! Dodano {total_added} nowych pytań!")
        
        # Podsumowanie końcowe
        total_questions = sum(len(cat['questions']) for cat in database['categories'].values())
        print(f"📊 Baza danych teraz zawiera {total_questions} pytań w {len(database['categories'])} kategoriach")
        
        for category_id, category_data in database['categories'].items():
            count = len(category_data['questions'])
            print(f"   {category_data['name']}: {count} pytań")
            
    except Exception as e:
        print(f"❌ Błąd podczas zapisywania: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()