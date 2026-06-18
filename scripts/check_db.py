import sys
sys.stdout.reconfigure(encoding='utf-8')
from pymongo import MongoClient
from collections import Counter

URI = "mongodb://fares7_db_user:F1234567890@ac-uaju3if-shard-00-00.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-01.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-02.mipu0ty.mongodb.net:27017/championsacademy?ssl=true&replicaSet=atlas-6doojh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=ChampionsAcademy"
client = MongoClient(URI)
col = client.get_database()['players']
print('Total:', col.count_documents({}))
belts = Counter(p.get('belt', '?') for p in col.find({}, {'belt': 1}))
print('Belts:', dict(belts))
client.close()
