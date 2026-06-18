import sys
sys.stdout.reconfigure(encoding='utf-8')
from pymongo import MongoClient

DB_URL = 'mongodb://fares7_db_user:F1234567890@ac-uaju3if-shard-00-00.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-01.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-02.mipu0ty.mongodb.net:27017/championsacademy?ssl=true&replicaSet=atlas-6doojh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=ChampionsAcademy'
client = MongoClient(DB_URL)
db = client.get_database()

content = db['academycontents'].find_one()
if content:
    db['academycontents'].update_one({'_id': content['_id']}, {'$set': {'about.imageUrl': '/ابطالنا/احمد سالم.jpeg', 'about.imageFit': 'contain'}})
    print('Updated AcademyContent image.')
else:
    print('No AcademyContent found.')

# Update default in page.tsx as well!
