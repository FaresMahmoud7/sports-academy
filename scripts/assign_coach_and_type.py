import os
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
from pymongo import MongoClient

MONGO_URI = "mongodb+srv://fares7_db_user:F1234567890@championsacademy.mipu0ty.mongodb.net/championsacademy?retryWrites=true&w=majority&appName=ChampionsAcademy"

def assign_coach_and_type():
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    players_col = db['players']
    coaches_col = db['coaches']

    folder_path = os.path.join("public", "Players and Coaches")
    
    name_pattern = re.compile(r'^[\u0621-\u064A\s]{5,}$')
    
    # Get all players
    all_db_players = list(players_col.find({}))
    
    for filename in os.listdir(folder_path):
        if filename.endswith(".docx"):
            coach_name = filename.replace(".docx", "").strip()
            
            # Determine training type
            t_type = ""
            if "كاتا" in coach_name: t_type = "كاتا"
            elif "كوميتيه" in coach_name or "كومتيه" in coach_name: t_type = "كوميتيه"
            elif "فتنس" in coach_name: t_type = "فتنس"
            elif "براعم" in coach_name or "تاسيس" in coach_name: t_type = "تأسيس"
            elif "اختبارات" in coach_name: t_type = "اختبارات"
            
            # Find or create coach
            coach = coaches_col.find_one({"name": {"$regex": coach_name, "$options": "i"}})
            if not coach:
                res = coaches_col.insert_one({"name": coach_name, "phone": "", "players": []})
                coach_id = res.inserted_id
            else:
                coach_id = coach['_id']

            doc_path = os.path.join(folder_path, filename)
            try:
                doc = Document(doc_path)
            except Exception as e:
                continue

            extracted_names = []
            for table in doc.tables:
                for row in table.rows:
                    cells = [c.text.strip() for c in row.cells]
                    for cell in set(cells):
                        if name_pattern.match(cell) and len(cell.split()) >= 2:
                            if "تاريخ" not in cell and "سداد" not in cell and "اشتراك" not in cell and "الاس" not in cell and "موبيل" not in cell:
                                extracted_names.append(cell)

            print(f"\nProcessing {coach_name} - Found {len(extracted_names)} names in DOCX (Type: {t_type})")
            
            for ename in extracted_names:
                parts = ename.split()
                if len(parts) >= 2:
                    first_name = parts[0]
                    last_name = parts[-1]
                    
                    # Find a player in DB whose name starts with first_name and contains last_name
                    # or just contains both
                    matched_player = None
                    for dbp in all_db_players:
                        db_name = dbp['name']
                        if first_name in db_name and last_name in db_name:
                            matched_player = dbp
                            break
                    
                    if matched_player:
                        update_data = {"coachId": coach_id}
                        if t_type:
                            update_data["trainingType"] = t_type
                            
                        players_col.update_one({"_id": matched_player["_id"]}, {"$set": update_data})
                        print(f"  Mapped: {ename} -> {matched_player['name']} (Set coach and type: {t_type})")
                    else:
                        print(f"  NOT FOUND IN DB: {ename}")

if __name__ == "__main__":
    assign_coach_and_type()
