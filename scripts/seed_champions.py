import os
from pymongo import MongoClient

# Database connection details
DB_URL = "mongodb://fares7_db_user:F1234567890@ac-uaju3if-shard-00-00.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-01.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-02.mipu0ty.mongodb.net:27017/championsacademy?ssl=true&replicaSet=atlas-6doojh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=ChampionsAcademy"
client = MongoClient(DB_URL)
db = client.get_database()

champions_collection = db["champions"]

photos = [
    "/ابطالنا/WhatsApp Image 2026-06-15 at 4.51.19 PM (6).jpeg",
    "/ابطالنا/WhatsApp Image 2026-06-15 at 4.51.20 PM (1).jpeg",
    "/ابطالنا/WhatsApp Image 2026-06-15 at 4.51.20 PM.jpeg",
]

print("Seeding Champions...")
for i, photo in enumerate(photos):
    # Check if this photo already exists in the db
    exists = champions_collection.find_one({"photoUrl": photo})
    if not exists:
        champions_collection.insert_one({
            "name": f"بطل الأكاديمية {i+1}",
            "photoUrl": photo,
            "ageCategory": "",
            "sportCategory": "",
            "achievements": "إنجازات البطل ستكتب هنا...",
            "socialLinks": {
                "facebook": "",
                "instagram": ""
            }
        })
        print(f"Inserted {photo}")
    else:
        print(f"Skipped {photo} (already exists)")

print("Seeding completed.")
