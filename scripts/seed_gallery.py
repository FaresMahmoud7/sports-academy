import pymongo

URI = "mongodb://fares7_db_user:F1234567890@ac-uaju3if-shard-00-00.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-01.mipu0ty.mongodb.net:27017,ac-uaju3if-shard-00-02.mipu0ty.mongodb.net:27017/championsacademy?ssl=true&replicaSet=atlas-6doojh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=ChampionsAcademy"

import os

def seed_gallery():
    client = pymongo.MongoClient(URI)
    db = client.get_database("championsacademy")
    gallery = db.galleryitems
    
    # Only seed if empty
    if gallery.count_documents({}) > 0:
        print(f"Gallery already has {gallery.count_documents({})} items. Skipping seed.")
        client.close()
        return

    img_dir = r'e:\Champions Acdeamy\public\image'
    files = sorted([f for f in os.listdir(img_dir) if f.endswith('.jpeg') or f.endswith('.jpg')])
    
    docs = []
    for f in files:
        docs.append({
            "imageUrl": f"/image/{f}",
            "caption": "جانب من فعاليات وإنجازات أكاديمية الأبطال",
            "createdAt": __import__('datetime').datetime.utcnow(),
            "updatedAt": __import__('datetime').datetime.utcnow(),
        })
    
    result = gallery.insert_many(docs)
    print(f"Inserted {len(result.inserted_ids)} gallery items into MongoDB.")
    client.close()

if __name__ == "__main__":
    seed_gallery()
