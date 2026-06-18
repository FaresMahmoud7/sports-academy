import os
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document
import sys
from docx import Document
from pymongo import MongoClient

MONGO_URI = "mongodb+srv://fares7_db_user:F1234567890@championsacademy.mipu0ty.mongodb.net/championsacademy?retryWrites=true&w=majority&appName=ChampionsAcademy"

def import_docx_players():
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    players_col = db['players']
    coaches_col = db['coaches']

    folder_path = os.path.join("public", "Players and Coaches")
    
    if not os.path.exists(folder_path):
        print("Folder not found.")
        return

    phone_pattern = re.compile(r'(?:010|011|012|015)\d{8}')
    # Arabic letters, spaces, minimum 2 words
    name_pattern = re.compile(r'^[\u0621-\u064A\s]{5,}$')

    for filename in os.listdir(folder_path):
        if filename.endswith(".docx"):
            print(f"Processing {filename}...")
            coach_name = filename.replace(".docx", "").strip()
            
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
                print(f"Failed to read {filename}: {e}")
                continue

            for table in doc.tables:
                for row in table.rows:
                    cells = [c.text.strip() for c in row.cells]
                    
                    phones = []
                    names = []
                    for cell in set(cells): # Use set to avoid merged cell duplicates
                        if phone_pattern.search(cell):
                            # extract first matching phone
                            match = phone_pattern.search(cell)
                            phones.append(match.group(0))
                        elif name_pattern.match(cell) and len(cell.split()) >= 2:
                            # Avoid headers like "تاريخ السداد"
                            if "تاريخ" not in cell and "سداد" not in cell and "اشتراك" not in cell and "الاس" not in cell and "موبيل" not in cell:
                                names.append(cell)

                    if names:
                        player_name = names[0]
                        parent_phone = phones[0] if phones else "00000000000"
                        
                        # Check if player already exists
                        existing = players_col.find_one({"name": player_name, "parentPhone": parent_phone})
                        if not existing:
                            new_player = {
                                "name": player_name,
                                "birthYear": 2015, # Default
                                "belt": "White",
                                "parentPhone": parent_phone,
                                "registered": True,
                                "coachId": coach_id,
                                "notes": f"Imported from {filename}",
                                "trainingDays": [],
                                "trainingType": "",
                                "fileNumber": "",
                                "nationalId": "",
                                "beltDate": ""
                            }
                            inserted = players_col.insert_one(new_player)
                            # Add to coach's players array
                            coaches_col.update_one({"_id": coach_id}, {"$push": {"players": inserted.inserted_id}})
                            print(f"  Added player: {player_name} ({parent_phone})")

    print("Import completed.")

if __name__ == "__main__":
    import_docx_players()
