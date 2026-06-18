import pymongo
from pymongo import MongoClient

# MongoDB URI from .env.local
URI = "mongodb://fares7_db_user:F1234567890@ac-uaju3if-shard-00-00.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-01.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-02.mipu0ty.mongodb.net:27017/championsacademy?ssl=true&replicaSet=atlas-6doojh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=ChampionsAcademy"

def migrate_belts():
    client = MongoClient(URI)
    db = client.get_database("championsacademy")
    players_collection = db.players
    
    # Mapping of old belt names to new ones
    mapping = {
        'Yellow 1': 'Yellow',
        'Yellow 2': 'Yellow',
        'Yellow 3': 'Yellow',
        'Orange 1': 'Orange',
        'Orange 2': 'Orange',
        'Orange 3': 'Orange',
        'Green 1': 'Green',
        'Blue 1': 'Blue',
        'Brown 1': 'Brown',
        'Brown 2': 'Brown',
    }
    
    count = 0
    for old_belt, new_belt in mapping.items():
        result = players_collection.update_many(
            {"belt": old_belt},
            {"$set": {"belt": new_belt}}
        )
        if result.modified_count > 0:
            print(f"Updated {result.modified_count} players from {old_belt} to {new_belt}")
            count += result.modified_count
            
    print(f"Migration completed. Total players updated: {count}")
    client.close()

if __name__ == "__main__":
    migrate_belts()
