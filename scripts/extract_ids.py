import pdfplumber
import sys
import re
from pymongo import MongoClient
from thefuzz import fuzz, process

sys.stdout.reconfigure(encoding='utf-8')

DB_URL = "mongodb://fares7_db_user:F1234567890@ac-uaju3if-shard-00-00.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-01.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-02.mipu0ty.mongodb.net:27017/championsacademy?ssl=true&replicaSet=atlas-6doojh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=ChampionsAcademy"
client = MongoClient(DB_URL)
db = client.get_database()
players_collection = db["players"]

pdf_path = "public/Players and Coaches/Current_Players_per_branch_club_season_img.pdf"

def fix_arabic_text(text):
    if not text: return ""
    text = text.replace("(cid:1005)", "و")
    text = text.replace("(cid:1019)", "ا")
    text = text.replace("(cid:911)", "ا")
    text = text.replace("(cid:3)", " ")
    text = re.sub(r'\(cid:\d+\)', '', text)
    # reverse the string
    text = text[::-1]
    return text.strip()

# Load players from DB
db_players = list(players_collection.find())
db_names = [p['name'] for p in db_players]

updates = 0
unmatched = []

print("Extracting from PDF...")
try:
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            if not tables: continue
            table = tables[0]
            # skip header
            start_idx = 0
            if i == 0:
                start_idx = 2 # based on my previous check, data starts at row 2 on page 1
            
            for row in table[start_idx:]:
                if not row or len(row) < 10: continue
                # Col 9: File Number
                file_number = str(row[9]).strip() if row[9] else ""
                # Col 8: Name
                raw_name = row[8]
                if not raw_name: continue
                
                # Col 7: National ID
                national_id = str(row[7]).strip() if row[7] else ""
                
                if file_number == "None": file_number = ""
                if national_id == "None": national_id = ""
                
                clean_name = fix_arabic_text(raw_name)
                
                if not clean_name: continue
                
                # Match name
                result = process.extractOne(clean_name, db_names, scorer=fuzz.token_set_ratio)
                if not result:
                    unmatched.append((clean_name, file_number, national_id, 0))
                    continue
                match, score = result
                
                if score >= 60:
                    player = next(p for p in db_players if p['name'] == match)
                    
                    update_fields = {}
                    if file_number and not player.get('fileNumber'):
                        update_fields['fileNumber'] = file_number
                    if national_id and not player.get('nationalId'):
                        update_fields['nationalId'] = national_id
                        
                    if update_fields:
                        players_collection.update_one({'_id': player['_id']}, {'$set': update_fields})
                        updates += 1
                        print(f"Updated {match} (Matched: {clean_name}) -> {update_fields}")
                else:
                    unmatched.append((clean_name, file_number, national_id, score))

    print(f"\nSuccessfully updated {updates} players.")
    if unmatched:
        print(f"\nCould not match {len(unmatched)} players with high confidence:")
        for u in unmatched[:10]: # Print top 10
            print(f"Name from PDF: {u[0]} (Score: {u[3]})")
            
except Exception as e:
    print(f"Error: {e}")
