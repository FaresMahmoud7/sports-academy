import sys
sys.stdout.reconfigure(encoding='utf-8')
from pymongo import MongoClient

DB_URL = 'mongodb://fares7_db_user:F1234567890@ac-uaju3if-shard-00-00.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-01.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-02.mipu0ty.mongodb.net:27017/championsacademy?ssl=true&replicaSet=atlas-6doojh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=ChampionsAcademy'
client = MongoClient(DB_URL)
db = client.get_database()

champions_collection = db["champions"]

# Update all champions to have empty ageCategory, sportCategory, and achievements
res = champions_collection.update_many(
    {}, 
    {"$set": {"ageCategory": "", "sportCategory": "", "achievements": ""}}
)

print(f"Updated {res.modified_count} champions in DB.")
client.close()
