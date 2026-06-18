"""
Sync players from Current_Players_per_branch_club_season PDF to MongoDB.
Source of truth: public/Players and Coaches/Current_Players_per_branch_club_season_img.pdf
"""
import pdfplumber
import re
import sys
from pymongo import MongoClient

sys.stdout.reconfigure(encoding='utf-8')

DB_URL = 'mongodb://fares7_db_user:F1234567890@ac-uaju3if-shard-00-00.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-01.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-02.mipu0ty.mongodb.net:27017/championsacademy?ssl=true&replicaSet=atlas-6doojh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=ChampionsAcademy'
client = MongoClient(DB_URL)
db = client.get_database()
players_col = db['players']
coaches_col = db['coaches']

pdf_path = "public/Players and Coaches/Current_Players_per_branch_club_season_img.pdf"

VALID_BELTS = {'White', 'Yellow', 'Orange', 'Green', 'Blue', 'Brown', 'Black Belt'}


def normalize_nat_id(nat_id: str) -> str:
    nat_id = str(nat_id).strip()
    if len(nat_id) == 13 and nat_id[0] in '12':
        return '3' + nat_id
    return nat_id


def fix_arabic_text(text):
    if not text:
        return ""
    text = text.replace("(cid:1005)", "و")
    text = text.replace("(cid:1019)", "ا")
    text = text.replace("(cid:911)", "ا")
    text = text.replace("(cid:3)", " ")
    text = re.sub(r'\(cid:\d+\)', '', text)
    return text[::-1].strip()


def map_belt(raw_belt):
    belt_str = fix_arabic_text(raw_belt)
    dan = None

    dan_match = re.search(r'(\d+)\s*-\s*دان|دان\s*-\s*(\d+)', belt_str)
    if dan_match:
        dan = int(dan_match.group(1) or dan_match.group(2))
        return "Black Belt", dan

    if any(k in belt_str for k in ["دان", "اسود", "ناد"]):
        return "Black Belt", 1
    if any(k in belt_str for k in ["بنى", "بني", "ىنب"]):
        return "Brown", None
    if any(k in belt_str for k in ["ازرق", "أزرق", "قرزأ", "قرزا"]):
        return "Blue", None
    if any(k in belt_str for k in ["اخضر", "أخضر", "رضخأ", "رضخا"]):
        return "Green", None
    if any(k in belt_str for k in ["برتقالي", "برتقالى", "ىلا", "لبرتق"]):
        return "Orange", None
    if any(k in belt_str for k in ["اصفر", "أصفر", "رفصأ", "رفصا"]):
        return "Yellow", None
    if any(k in belt_str for k in ["ابيض", "أبيض", "ضيبأ", "ضيبا"]):
        return "White", None

    return "White", None


def parse_pdf_players():
    players = []
    seen_national_ids = set()

    with pdfplumber.open(pdf_path) as pdf:
        for idx, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            if not tables:
                continue
            table = tables[0]
            start_idx = 2 if idx == 0 else 0

            for row in table[start_idx:]:
                if not row or len(row) < 11:
                    continue

                name = fix_arabic_text(row[8])
                if not name or len(name) < 5 or 'الاسم' in name:
                    continue

                nat_id = normalize_nat_id(str(row[7]).strip() if row[7] else "")
                if not re.match(r'^\d{14}$', nat_id):
                    continue

                if nat_id in seen_national_ids:
                    continue
                seen_national_ids.add(nat_id)

                file_num = str(row[9]).strip() if row[9] else ""
                belt_date = str(row[1]).strip() if row[1] else ""
                belt, dan = map_belt(row[2] if row[2] else "")

                birth_date = str(row[6]).strip() if row[6] else ""
                birth_year = 2015
                if birth_date:
                    try:
                        birth_year = int(birth_date.split('/')[0])
                    except ValueError:
                        pass

                player = {
                    "name": name,
                    "nationalId": nat_id,
                    "fileNumber": file_num,
                    "belt": belt,
                    "birthYear": birth_year,
                    "beltDate": belt_date,
                    "parentPhone": "00000000000",
                    "registered": True,
                    "trainingDays": [],
                    "trainingType": "",
                    "notes": "Imported from PDF",
                }
                if belt == "Black Belt" and dan:
                    player["danDegree"] = dan

                players.append(player)

    return players


pdf_players = parse_pdf_players()
print(f"Extracted {len(pdf_players)} unique players from PDF.")

belt_counts = {}
for p in pdf_players:
    belt_counts[p['belt']] = belt_counts.get(p['belt'], 0) + 1
print("Belt distribution:", belt_counts)

db_players = list(players_col.find({}))
db_by_nat_id = {p.get('nationalId', ''): p for p in db_players if p.get('nationalId')}
db_by_name = {p['name']: p for p in db_players}
db_names = list(db_by_name.keys())

matched_ids = set()
updated_count = 0
inserted_count = 0

for pdf_p in pdf_players:
    match_player = db_by_nat_id.get(pdf_p['nationalId'])

    if not match_player:
        match_player = db_by_name.get(pdf_p['name'])

    update_fields = {
        "name": pdf_p['name'],
        "nationalId": pdf_p['nationalId'],
        "fileNumber": pdf_p['fileNumber'],
        "belt": pdf_p['belt'],
        "birthYear": pdf_p['birthYear'],
        "beltDate": pdf_p['beltDate'],
    }
    if pdf_p.get('danDegree'):
        update_fields['danDegree'] = pdf_p['danDegree']
    else:
        update_fields['danDegree'] = None

    if match_player:
        players_col.update_one({"_id": match_player["_id"]}, {"$set": update_fields})
        matched_ids.add(match_player["_id"])
        updated_count += 1
    else:
        res = players_col.insert_one(pdf_p)
        matched_ids.add(res.inserted_id)
        inserted_count += 1
        print(f"Inserted: {pdf_p['name']}")

all_db_ids = {p['_id'] for p in db_players}
to_delete_ids = list(all_db_ids - matched_ids)

if to_delete_ids:
    del_res = players_col.delete_many({"_id": {"$in": to_delete_ids}})
    print(f"Deleted {del_res.deleted_count} players not in PDF.")
    for coach in coaches_col.find({}):
        c_players = coach.get('players', [])
        new_c_players = [p_id for p_id in c_players if p_id not in to_delete_ids]
        if len(new_c_players) != len(c_players):
            coaches_col.update_one({"_id": coach["_id"]}, {"$set": {"players": new_c_players}})

print(f"\nSync finished:")
print(f"PDF players: {len(pdf_players)}")
print(f"Updated: {updated_count}, Inserted: {inserted_count}, Deleted: {len(to_delete_ids)}")
print(f"Total in DB: {players_col.count_documents({})}")

client.close()
