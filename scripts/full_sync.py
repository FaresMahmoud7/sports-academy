"""
Full sync script:
1. Sync all 173 players from PDF to DB (insert missing ones)
2. Create/update coaches from DOCX filenames
3. Link players to coaches using fuzzy matching from DOCX content
"""
import sys
import os
import re
sys.stdout.reconfigure(encoding='utf-8')

import pdfplumber
from docx import Document
from pymongo import MongoClient
from thefuzz import fuzz, process
from bson import ObjectId

MONGO_URI = "mongodb://fares7_db_user:F1234567890@ac-uaju3if-shard-00-00.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-01.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-02.mipu0ty.mongodb.net:27017/championsacademy?ssl=true&replicaSet=atlas-6doojh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=ChampionsAcademy"

client = MongoClient(MONGO_URI)
db = client.get_database()
players_col = db['players']
coaches_col = db['coaches']

pdf_path = "public/Players and Coaches/Current_Players_per_branch_club_season_img.pdf"
docx_folder = "public/Players and Coaches"


# =====================
# STEP 1: Parse PDF
# =====================
def fix_arabic_text(text):
    if not text: return ""
    text = text.replace("(cid:1005)", "و")
    text = text.replace("(cid:1019)", "ا")
    text = text.replace("(cid:911)", "ا")
    text = text.replace("(cid:3)", " ")
    text = re.sub(r'\(cid:\d+\)', '', text)
    return text[::-1].strip()


pdf_players = []
with pdfplumber.open(pdf_path) as pdf:
    for idx, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        if not tables: continue
        table = tables[0]
        start_idx = 2 if idx == 0 else 0
        for row in table[start_idx:]:
            if not row or len(row) < 10: continue
            name = fix_arabic_text(row[8])
            if not name or 'الاسم' in name or 'م اعا' in name or len(name) < 7:
                continue
            nat_id = str(row[7]).strip() if row[7] else ""
            file_num = str(row[9]).strip() if row[9] else ""
            raw_belt = row[1] if row[1] else ""
            belt_str = fix_arabic_text(raw_belt)
            mapped_belt = "White"
            if "دان" in belt_str or "اسود" in belt_str: mapped_belt = "Black Belt"
            elif "بنى" in belt_str or "بني" in belt_str: mapped_belt = "Brown 1"
            elif "ازرق" in belt_str or "أزرق" in belt_str: mapped_belt = "Blue 1"
            elif "اخضر" in belt_str or "أخضر" in belt_str: mapped_belt = "Green 1"
            elif "برتقالي" in belt_str or "برتقالى" in belt_str: mapped_belt = "Orange 1"
            elif "اصفر" in belt_str or "أصفر" in belt_str: mapped_belt = "Yellow 1"
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

# Deduplicate PDF players by name
seen_names = set()
unique_pdf_players = []
for p in pdf_players:
    if p['name'] not in seen_names:
        seen_names.add(p['name'])
        unique_pdf_players.append(p)

print(f"PDF unique players: {len(unique_pdf_players)}")

# =====================
# STEP 2: Sync PDF → DB
# =====================
db_players = list(players_col.find({}))
db_players_by_name = {p['name']: p for p in db_players}
db_names = list(db_players_by_name.keys())

matched_ids = set()
updated = 0
inserted = 0

for pdf_p in unique_pdf_players:
    name = pdf_p['name']
    # Exact match
    match_player = db_players_by_name.get(name)
    # Fuzzy match
    if not match_player and db_names:
        result = process.extractOne(name, db_names, scorer=fuzz.token_set_ratio)
        if result:
            match_name, score = result
            if score >= 88:
                match_player = db_players_by_name[match_name]
    
    if match_player:
        players_col.update_one(
            {"_id": match_player["_id"]},
            {"$set": {
                "name": name,
                "nationalId": pdf_p['nationalId'],
                "fileNumber": pdf_p['fileNumber'],
                "belt": pdf_p['belt'],
                "birthYear": pdf_p['birthYear']
            }}
        )
        matched_ids.add(match_player["_id"])
        updated += 1
    else:
        res = players_col.insert_one({
            "name": name,
            "nationalId": pdf_p['nationalId'],
            "fileNumber": pdf_p['fileNumber'],
            "belt": pdf_p['belt'],
            "birthYear": pdf_p['birthYear'],
            "parentPhone": "00000000000",
            "registered": True,
            "trainingDays": [],
            "trainingType": "",
            "notes": "Imported from PDF"
        })
        matched_ids.add(res.inserted_id)
        inserted += 1
        print(f"  Inserted: {name}")

print(f"Updated: {updated}, Inserted: {inserted}")
print(f"Total players in DB: {players_col.count_documents({})}")

# =====================
# STEP 3: DOCX → Coaches + Player Linking
# =====================
phone_pattern = re.compile(r'(?:010|011|012|015)\d{8}')
name_pattern = re.compile(r'^[\u0621-\u064A\s]{5,}$')

# Reload DB players after sync
db_players = list(players_col.find({}))
db_names_map = {p['name']: p for p in db_players}
db_names_list = list(db_names_map.keys())

total_linked = 0
total_not_found = 0

for filename in os.listdir(docx_folder):
    if not filename.endswith(".docx"):
        continue
    coach_name = filename.replace(".docx", "").strip()
    print(f"\nProcessing coach: {coach_name}")

    # Find or create coach
    coach = coaches_col.find_one({"name": {"$regex": re.escape(coach_name), "$options": "i"}})
    if not coach:
        res = coaches_col.insert_one({
            "name": coach_name,
            "phone": "",
            "trainingTime": "",
            "trainingDays": [],
            "players": []
        })
        coach_id = res.inserted_id
        print(f"  Created coach: {coach_name}")
    else:
        coach_id = coach['_id']

    # Read DOCX
    doc_path = os.path.join(docx_folder, filename)
    try:
        doc = Document(doc_path)
    except Exception as e:
        print(f"  Failed to read {filename}: {e}")
        continue

    linked_in_this_file = set()

    for table in doc.tables:
        for row in table.rows:
            cells = [c.text.strip() for c in row.cells]
            names_in_row = []
            for cell in set(cells):
                if name_pattern.match(cell) and len(cell.split()) >= 2:
                    if not any(kw in cell for kw in ["تاريخ", "سداد", "اشتراك", "الاسم", "موبيل", "ملاحظه", "ميعاد"]):
                        names_in_row.append(cell)

            for player_name in names_in_row:
                if player_name in linked_in_this_file:
                    continue
                # Fuzzy match
                match_player = None
                result = process.extractOne(player_name, db_names_list, scorer=fuzz.token_set_ratio)
                if result:
                    match_name, score = result
                    if score >= 78:
                        match_player = db_names_map.get(match_name)

                if match_player:
                    pid = match_player['_id']
                    if pid not in linked_in_this_file:
                        players_col.update_one({"_id": pid}, {"$set": {"coachId": coach_id}})
                        coaches_col.update_one({"_id": coach_id}, {"$addToSet": {"players": pid}})
                        linked_in_this_file.add(pid)
                        total_linked += 1
                else:
                    total_not_found += 1

    print(f"  Linked {len(linked_in_this_file)} players to {coach_name}")

print(f"\nTotal linked: {total_linked}")
print(f"Not found: {total_not_found}")
print(f"Final players in DB: {players_col.count_documents({})}")
client.close()
