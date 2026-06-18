import sys
sys.stdout.reconfigure(encoding='utf-8')
from pymongo import MongoClient

MONGO_URI = "mongodb://fares7_db_user:F1234567890@ac-uaju3if-shard-00-00.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-01.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-02.mipu0ty.mongodb.net:27017/championsacademy?ssl=true&replicaSet=atlas-6doojh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=ChampionsAcademy"

def normalize_name(name):
    if not name:
        return ""
    # Remove extra spaces
    n = " ".join(name.strip().split())
    # Normalize Arabic characters
    n = n.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    n = n.replace("ة", "ه")
    n = n.replace("ى", "ي")
    return n.lower()

def clean_duplicates():
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    players_col = db['players']
    
    players = list(players_col.find({}))
    print(f"Total players in DB before cleanup: {len(players)}")
    
    # Group by normalized name
    by_norm_name = {}
    for p in players:
        norm = normalize_name(p.get('name', ''))
        if not norm:
            continue
        by_norm_name.setdefault(norm, []).append(p)
        
    duplicates_removed = 0
    
    for norm_name, p_list in by_norm_name.items():
        if len(p_list) > 1:
            print(f"\nFound duplicate group for normalized name: '{norm_name}' (Count: {len(p_list)})")
            for i, p in enumerate(p_list):
                print(f"  [{i}] ID: {p['_id']}, Name: '{p.get('name')}', NationalID: '{p.get('nationalId')}', File: '{p.get('fileNumber')}', Coach: '{p.get('coachId') or p.get('coach')}', TrainingType: '{p.get('trainingType')}'")
            
            # Select the "best" record to keep.
            # Best is defined by having:
            # 1. nationalId
            # 2. fileNumber
            # 3. trainingType
            # 4. beltDate
            # Let's score them
            def get_score(player):
                score = 0
                if player.get('nationalId'): score += 10
                if player.get('fileNumber'): score += 5
                if player.get('trainingType'): score += 3
                if player.get('beltDate'): score += 2
                if player.get('coachId'): score += 2
                if player.get('notes'): score += 1
                return score
            
            p_list.sort(key=get_score, reverse=True)
            keep_player = p_list[0]
            print(f"  => KEEPING: ID {keep_player['_id']} (Score: {get_score(keep_player)})")
            
            # Merge fields from other records to keep_player if they are missing
            updates = {}
            for other_p in p_list[1:]:
                for field in ['nationalId', 'fileNumber', 'trainingType', 'beltDate', 'coachId', 'parentPhone', 'birthYear', 'belt', 'notes', 'trainingDays']:
                    if other_p.get(field) and not keep_player.get(field):
                        keep_player[field] = other_p[field]
                        updates[field] = other_p[field]
                
                # Delete the duplicate record
                players_col.delete_one({"_id": other_p['_id']})
                duplicates_removed += 1
                print(f"  => DELETED: ID {other_p['_id']}")
                
            if updates:
                players_col.update_one({"_id": keep_player['_id']}, {"$set": updates})
                print(f"  => UPDATED KEEPING player with merged fields: {updates}")
                
    print(f"\nCleanup finished. Removed {duplicates_removed} duplicate records.")

if __name__ == "__main__":
    clean_duplicates()
