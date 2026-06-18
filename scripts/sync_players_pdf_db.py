import pdfplumber
import re
import sys
from pymongo import MongoClient
from thefuzz import fuzz, process

sys.stdout.reconfigure(encoding='utf-8')

# Database connection
DB_URL = 'mongodb://fares7_db_user:F1234567890@ac-uaju3if-shard-00-00.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-01.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-02.mipu0ty.mongodb.net:27017/championsacademy?ssl=true&replicaSet=atlas-6doojh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=ChampionsAcademy'
client = MongoClient(DB_URL)
db = client.get_database()
players_col = db['players']
coaches_col = db['coaches']

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

# 1. Parse PDF players
pdf_players = []
with pdfplumber.open(pdf_path) as pdf:
    for idx, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        if not tables: continue
        table = tables[0]
        start_idx = 0
        if idx == 0:
            start_idx = 2
        for row in table[start_idx:]:
            if not row or len(row) < 10: continue
            nat_id = str(row[7]).strip() if row[7] else ""
            if not re.match(r'^\d{14}$', nat_id):
                continue
            name = fix_arabic_text(row[8])
            file_num = str(row[9]).strip() if row[9] else ""
            
            # Extract Belt
            raw_belt = row[1] if row[1] else ""
            belt_str = fix_arabic_text(raw_belt)
            
            # Map Belt
            mapped_belt = "White"
            if "دان" in belt_str or "اسود" in belt_str: mapped_belt = "Black Belt"
            elif "بنى" in belt_str or "بني" in belt_str: mapped_belt = "Brown 1"
            elif "ازرق" in belt_str or "أزرق" in belt_str: mapped_belt = "Blue 1"
            elif "اخضر" in belt_str or "أخضر" in belt_str: mapped_belt = "Green 1"
            elif "برتقالي" in belt_str or "برتقالى" in belt_str: mapped_belt = "Orange 1"
            elif "اصفر" in belt_str or "أصفر" in belt_str: mapped_belt = "Yellow 1"
            
            # Extract Birth Date
            birth_date = str(row[5]).strip() if row[5] else ""
            birth_year = 2015
            if birth_date:
                try:
                    birth_year = int(birth_date.split('/')[0])
                except:
                    pass
            
            pdf_players.append({
                "name": name,
                "nationalId": nat_id,
                "fileNumber": file_num,
                "belt": mapped_belt,
                "birthYear": birth_year
            })

print(f"Extracted {len(pdf_players)} players from PDF.")

# 2. Get existing players from DB
db_players = list(players_col.find({}))
db_players_by_name = {p['name']: p for p in db_players}
db_names = list(db_players_by_name.keys())

matched_ids = set()
updated_count = 0
inserted_count = 0

# 3. Sync
for pdf_p in pdf_players:
    name = pdf_p['name']
    nat_id = pdf_p['nationalId']
    file_num = pdf_p['fileNumber']
    belt = pdf_p['belt']
    birth_year = pdf_p['birthYear']
    
    # Try exact match first
    match_player = db_players_by_name.get(name)
    
    # Try fuzzy match if no exact match
    if not match_player and db_names:
        result = process.extractOne(name, db_names, scorer=fuzz.token_set_ratio)
        if result:
            match_name, score = result
            if score >= 85:
                match_player = db_players_by_name[match_name]
                print(f"Fuzzy Matched: '{name}' -> '{match_name}' (Score: {score})")
    
    if match_player:
        # Update existing
        players_col.update_one(
            {"_id": match_player["_id"]},
            {"$set": {
                "name": name, # normalize name to PDF spelling
                "nationalId": nat_id,
                "fileNumber": file_num,
                "belt": belt,
                "birthYear": birth_year
            }}
        )
        matched_ids.add(match_player["_id"])
        updated_count += 1
    else:
        # Insert new
        new_doc = {
            "name": name,
            "nationalId": nat_id,
            "fileNumber": file_num,
            "belt": belt,
            "birthYear": birth_year,
            "parentPhone": "00000000000",
            "registered": True,
            "trainingDays": [],
            "trainingType": "",
            "notes": "Imported from PDF"
        }
        res = players_col.insert_one(new_doc)
        matched_ids.add(res.inserted_id)
        inserted_count += 1
        print(f"Inserted New Player: '{name}'")

# 4. Delete players that are not in the PDF
all_db_ids = {p['_id'] for p in db_players}
to_delete_ids = list(all_db_ids - matched_ids)

if to_delete_ids:
    # Delete them
    del_res = players_col.delete_many({"_id": {"$in": to_delete_ids}})
    print(f"Deleted {del_res.deleted_count} players from DB who were not in the PDF.")
    
    # Cleanup coaches players array
    for coach in coaches_col.find({}):
        c_players = coach.get('players', [])
        new_c_players = [p_id for p_id in c_players if p_id not in to_delete_ids]
        if len(new_c_players) != len(c_players):
            coaches_col.update_one({"_id": coach["_id"]}, {"$set": {"players": new_c_players}})
            print(f"Cleaned up player list for Coach '{coach['name']}'")
else:
    print("No players to delete.")

print(f"\nSync Finished:")
print(f"Total PDF Players: {len(pdf_players)}")
print(f"Updated/Synced in DB: {updated_count}")
print(f"Newly Inserted to DB: {inserted_count}")
print(f"Deleted from DB: {len(to_delete_ids)}")
print(f"Total current players in DB: {players_col.count_documents({})}")

client.close()
