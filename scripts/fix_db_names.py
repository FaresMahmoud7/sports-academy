import sys
sys.stdout.reconfigure(encoding='utf-8')
from pymongo import MongoClient

MONGO_URI = "mongodb+srv://fares7_db_user:F1234567890@championsacademy.mipu0ty.mongodb.net/championsacademy?retryWrites=true&w=majority&appName=ChampionsAcademy"

def fix_names():
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    players_col = db['players']
    
    players = players_col.find({})
    for p in players:
        name = p['name']
        if "dic(" in name:
            new_name = name.replace(")0201:dic(", "لا").replace(")0203:dic(", "الله").replace(")589:dic(", "ك").replace(")989:dic(", "ق").replace(")1101:dic(", "ة").replace(")0101:dic(", "ي")
            players_col.update_one({"_id": p['_id']}, {"$set": {"name": new_name}})
            print(f"Fixed: {name} -> {new_name}")

if __name__ == "__main__":
    fix_names()
