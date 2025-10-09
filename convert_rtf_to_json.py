#!/usr/bin/env python3
"""
Skrypt do konwersji pliku RTF (pytania.json) na poprawny format JSON
"""

import re
import json
import sys

def clean_rtf_text(text):
    """Czyści tekst RTF i ekstraktuje zawartość JSON."""
    print("🔍 Analizuję strukturę RTF...")
    
    # Znajdź sekcję z danymi (po \f0\fs28)
    data_start = text.find('\\f0\\fs28')
    if data_start == -1:
        raise ValueError("Nie znaleziono sekcji danych w RTF")
    
    # Wytnij sekcję danych
    data_section = text[data_start:]
    
    # Znajdź początek i koniec JSON
    json_start = data_section.find('[')
    if json_start == -1:
        raise ValueError("Nie znaleziono początku JSON")
    
    json_content = data_section[json_start:]
    
    print("🧹 Czyszczę formatowanie RTF...")
    
    # Usuń komendy kolorów RTF (\cf2, \cf4, \cf5, etc.)
    json_content = re.sub(r'\\cf\d+\s*', '', json_content)
    
    # Usuń inne komendy RTF
    json_content = re.sub(r'\\cb\d+\s*', '', json_content)  # background color
    json_content = re.sub(r'\\expnd\d+\\expndtw\d+\\kerning\d+\s*', '', json_content)  # kerning
    json_content = re.sub(r'\\[a-z]+\d*\s*', '', json_content)  # inne komendy RTF
    
    # Zamień \ na normalny backslash i usuń escape'y
    json_content = json_content.replace('\\\\"', '"')  # Escaped quotes
    json_content = json_content.replace('\\\\', '\\')   # Escaped backslashes
    json_content = json_content.replace('\\{', '{')     # Escaped braces
    json_content = json_content.replace('\\}', '}')     # Escaped braces
    json_content = json_content.replace('\\"', '"')     # Remaining escaped quotes
    
    print("🇵🇱 Konwertuję polskie znaki...")
    
    # Konwertuj polskie znaki unicode
    unicode_replacements = {
        '\\uc0\\u322 ': 'ł',
        '\\uc0\\u322': 'ł', 
        '\\u322 ': 'ł',
        '\\u322': 'ł',
        '\\uc0\\u347 ': 'ś',
        '\\uc0\\u347': 'ś',
        '\\u347': 'ś',
        '\\uc0\\u263 ': 'ć',
        '\\uc0\\u263': 'ć', 
        '\\u263': 'ć',
        '\\uc0\\u261 ': 'ą',
        '\\uc0\\u261': 'ą',
        '\\u261': 'ą',
        '\\uc0\\u281 ': 'ę',
        '\\uc0\\u281': 'ę',
        '\\u281': 'ę',
        '\\uc0\\u324 ': 'ń',
        '\\uc0\\u324': 'ń',
        '\\u324': 'ń',
        '\\uc0\\u243 ': 'ó',
        '\\uc0\\u243': 'ó',
        '\\u243': 'ó',
        '\\uc0\\u378 ': 'ź',
        '\\uc0\\u378': 'ź',
        '\\u378': 'ź',
        '\\uc0\\u380 ': 'ż',
        '\\uc0\\u380': 'ż',
        '\\u380': 'ż',
        "\\'f3": 'ó',  # RTF encoding for ó
        "\\'ea": 'ę',  # RTF encoding for ę
        "\\'b1": 'ą',  # RTF encoding for ą
        "\\'e6": 'ć',  # RTF encoding for ć
        "\\'b3": 'ł',  # RTF encoding for ł
        "\\'f1": 'ń',  # RTF encoding for ń
        "\\'9c": 'ś',  # RTF encoding for ś
        "\\'9f": 'ź',  # RTF encoding for ź
        "\\'bf": 'ż'   # RTF encoding for ż
    }
    
    for rtf_char, polish_char in unicode_replacements.items():
        json_content = json_content.replace(rtf_char, polish_char)
    
    # Usuń pozostałe escape sequences
    json_content = re.sub(r'\\uc\d+', '', json_content)
    json_content = re.sub(r'\\u\d+\s*', '', json_content)
    json_content = re.sub(r"\\'[a-fA-F0-9]{2}", '', json_content)  # Hex escapes
    
    # Normalizuj białe znaki
    json_content = re.sub(r'\\\s*\n\s*', '', json_content)  # Usuń RTF line breaks
    json_content = re.sub(r'\s+', ' ', json_content)        # Normalizuj spacje
    json_content = json_content.strip()
    
    # Znajdź koniec JSON
    bracket_count = 0
    end_pos = -1
    
    for i, char in enumerate(json_content):
        if char == '[':
            bracket_count += 1
        elif char == ']':
            bracket_count -= 1
            if bracket_count == 0:
                end_pos = i + 1
                break
    
    if end_pos > 0:
        json_content = json_content[:end_pos]
    
    print(f"📏 Długość wyczyszczonego JSON: {len(json_content)} znaków")
    
    return json_content

def parse_and_validate_json(json_text):
    """Parsuje i waliduje JSON."""
    try:
        # Próbuj sparsować jako JSON
        data = json.loads(json_text)
        return data
    except json.JSONDecodeError as e:
        print(f"❌ Błąd parsowania JSON: {e}")
        
        # Spróbuj naprawić częste problemy
        print("🔧 Próbuję naprawić JSON...")
        
        # Napraw przecinki
        json_text = re.sub(r',\s*}', '}', json_text)
        json_text = re.sub(r',\s*]', ']', json_text)
        
        # Napraw cudzysłowy
        json_text = re.sub(r'([{,]\s*)([a-zA-Z_]+):', r'\1"\2":', json_text)
        
        try:
            data = json.loads(json_text)
            print("✅ JSON naprawiony!")
            return data
        except json.JSONDecodeError as e2:
            print(f"❌ Nie udało się naprawić JSON: {e2}")
            
            # Zapisz problematyczny tekst do debugowania
            with open('debug_json.txt', 'w', encoding='utf-8') as f:
                f.write(json_text)
            print("💾 Zapisano problematyczny JSON do debug_json.txt")
            return None

def main():
    rtf_file = 'pytania.json'
    output_file = 'pytania-cleaned.json'
    
    print("🔄 Konwersja pliku RTF na JSON")
    print("=" * 50)
    
    try:
        # Wczytaj plik RTF
        print(f"📖 Czytam plik: {rtf_file}")
        with open(rtf_file, 'r', encoding='utf-8') as file:
            rtf_content = file.read()
        
        # Wyczyść RTF i wyekstraktuj JSON
        print("🧹 Czyszczę format RTF...")
        json_text = clean_rtf_text(rtf_content)
        
        # Parsuj JSON
        print("📝 Parsuję JSON...")
        questions_data = parse_and_validate_json(json_text)
        
        if questions_data is None:
            print("❌ Nie udało się sparsować JSON!")
            sys.exit(1)
        
        # Waliduj strukturę pytań
        print("✅ Walidacja pytań...")
        valid_questions = []
        invalid_count = 0
        
        for i, question in enumerate(questions_data):
            if not isinstance(question, dict):
                print(f"⚠️  Pytanie {i+1}: nie jest obiektem")
                invalid_count += 1
                continue
                
            required_fields = ['id', 'question', 'answers', 'correct']
            missing_fields = [field for field in required_fields if field not in question]
            
            if missing_fields:
                print(f"⚠️  Pytanie {i+1} ({question.get('id', 'BRAK_ID')}): brakuje pól {missing_fields}")
                invalid_count += 1
                continue
            
            # Sprawdź odpowiedzi
            if not isinstance(question['answers'], list) or len(question['answers']) != 4:
                print(f"⚠️  Pytanie {i+1} ({question['id']}): nieprawidłowe odpowiedzi")
                invalid_count += 1
                continue
            
            # Sprawdź correct
            if not isinstance(question['correct'], int) or question['correct'] not in [0, 1, 2, 3]:
                print(f"⚠️  Pytanie {i+1} ({question['id']}): nieprawidłowe pole 'correct'")
                invalid_count += 1
                continue
            
            # Dodaj domyślne pola jeśli brakuje
            if 'difficulty' not in question:
                question['difficulty'] = 'medium'
            
            if 'explanation' not in question:
                correct_answer = question['answers'][question['correct']]
                question['explanation'] = f"Poprawna odpowiedź to: {correct_answer}"
            
            valid_questions.append(question)
        
        print(f"📊 Podsumowanie:")
        print(f"   ✅ Prawidłowe pytania: {len(valid_questions)}")
        print(f"   ❌ Nieprawidłowe pytania: {invalid_count}")
        
        if not valid_questions:
            print("❌ Brak prawidłowych pytań!")
            sys.exit(1)
        
        # Zapisz wyczyszczone pytania
        print(f"💾 Zapisuję do: {output_file}")
        with open(output_file, 'w', encoding='utf-8') as file:
            json.dump(valid_questions, file, ensure_ascii=False, indent=2)
        
        print(f"🎉 Sukces! Skonwertowano {len(valid_questions)} pytań")
        print(f"📁 Plik zapisany jako: {output_file}")
        print(f"💡 Teraz możesz dodać te pytania do głównej bazy używając: python3 import_questions.py")
        
    except FileNotFoundError:
        print(f"❌ Nie znaleziono pliku: {rtf_file}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Nieoczekiwany błąd: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()