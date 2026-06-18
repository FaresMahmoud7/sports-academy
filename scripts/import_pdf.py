import sys
sys.stdout.reconfigure(encoding='utf-8')
import re
import pdfplumber
from pymongo import MongoClient

MONGO_URI = "mongodb+srv://fares7_db_user:F1234567890@championsacademy.mipu0ty.mongodb.net/championsacademy?retryWrites=true&w=majority&appName=ChampionsAcademy"

def reverse_arabic(text):
    # Split the reversed words and reverse the whole string to get proper Arabic
    # Example: "نسح ىحبص" -> "صبحى حسن"
    # Actually, the letters inside the words are also reversed. 
    # "ن س ح" -> "ح س ن". 
    # So we just reverse the entire string!
    
    # Wait, look at the text:
    # "نسح" reversed is "حسن"
    # "ىحبص" reversed is "صبحى"
    # "نسح ىحبص" reversed is "صبحى حسن"
    # Replace missing characters first
    text = text.replace("(cid:1005)", "و")
    text = text.replace("(cid:1019)", "إ")
    text = text.replace("(cid:917)", "ت")
    text = text.replace("(cid:984)", "خ")
    text = text.replace("(cid:919)", "ت")
    text = text.replace("(cid:909)", "ا")
    return text[::-1]

def parse_pdf(file_path):
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    players_col = db['players']
    
    print("Extracting text from PDF...")
    all_text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            all_text += page.extract_text() + "\n"

    lines = all_text.split('\n')
    
    # Regex to match a line that contains a 14-digit national ID
    # Pattern: BeltDate BeltName SubDate SubType Category(opt) BirthDate NationalID ReversedName FileNumber Index
    # Since the string is Left-to-Right in the text file, it looks like:
    # 2023/08/18 1 - ناد 2026/05/13 ةراعإ فنصم 2008/03/17 30803170201051 نسح ىحبص ديسلا نميا رامع 157523 1
    
    parsed_players = []
    
    for line in lines:
        if re.search(r'\b\d{14}\b', line):
            # Split by national ID
            parts = re.split(r'(\b\d{14}\b)', line)
            if len(parts) == 3:
                left_part = parts[0].strip()
                national_id = parts[1]
                right_part = parts[2].strip()
                
                # left_part contains dates and belt
                # e.g. "2023/08/18 1 - ناد 2026/05/13 ةراعإ فنصم 2008/03/17"
                date_matches = re.findall(r'\d{4}/\d{2}/\d{2}', left_part)
                belt_date = date_matches[0] if len(date_matches) > 0 else ""
                birth_date = date_matches[-1] if len(date_matches) > 0 else ""
                
                # Extract Belt Name
                # It's usually between the first and second date
                belt_str = ""
                if len(date_matches) >= 2:
                    belt_match = re.search(r'\d{4}/\d{2}/\d{2}(.*?)\d{4}/\d{2}/\d{2}', left_part)
                    if belt_match:
                        raw_belt = belt_match.group(1).strip()
                        # Reverse it
                        belt_str = reverse_arabic(raw_belt).strip()
                        # Clean up
                        belt_str = re.sub(r'^\s*-\s*\d+', '', belt_str).strip()

                # right_part contains reversed name, file number, index
                # e.g. "نسح ىحبص ديسلا نميا رامع 157523 1"
                # Extract file number (last 5-7 digits before index)
                # Let's split by space
                r_tokens = right_part.split()
                if len(r_tokens) >= 2:
                    # last token is index
                    # second to last is file number
                    file_number = r_tokens[-2]
                    # remaining is reversed name
                    raw_name = " ".join(r_tokens[:-2])
                    player_name = reverse_arabic(raw_name).strip()
                    
                    # Map Belt to our enum: ['White', 'Yellow 1', 'Yellow 2', 'Yellow 3', 'Orange 1', 'Orange 2', 'Orange 3', 'Green 1', 'Blue 1', 'Brown 1', 'Brown 2', 'Black Belt']
                    mapped_belt = "White"
                    if "دان" in belt_str or "اسود" in belt_str: mapped_belt = "Black Belt"
                    elif "بنى" in belt_str or "بني" in belt_str: mapped_belt = "Brown 1"
                    elif "ازرق" in belt_str or "أزرق" in belt_str: mapped_belt = "Blue 1"
                    elif "اخضر" in belt_str or "أخضر" in belt_str: mapped_belt = "Green 1"
                    elif "برتقالي" in belt_str or "برتقالى" in belt_str: mapped_belt = "Orange 1"
                    elif "اصفر" in belt_str or "أصفر" in belt_str: mapped_belt = "Yellow 1"
                    
                    birth_year = 2015
                    if birth_date:
                        try:
                            birth_year = int(birth_date.split('/')[0])
                        except:
                            pass
                    
                    parsed_players.append({
                        "name": player_name,
                        "nationalId": national_id,
                        "fileNumber": file_number,
                        "beltDate": belt_date,
                        "belt": mapped_belt,
                        "birthYear": birth_year,
                        "parentPhone": "00000000000", # Missing from this PDF table? Wait, let's check
                        "registered": True
                    })

    print(f"Extracted {len(parsed_players)} players from PDF.")
    
    # Save to DB
    for p in parsed_players:
        # Update or Insert
        existing = players_col.find_one({"nationalId": p["nationalId"]})
        if not existing:
            players_col.insert_one(p)
            print(f"Inserted: {p['name']}")
        else:
            # Update existing
            players_col.update_one({"_id": existing["_id"]}, {"$set": {
                "fileNumber": p["fileNumber"],
                "beltDate": p["beltDate"],
                "belt": p["belt"],
                "birthYear": p["birthYear"]
            }})
            print(f"Updated: {p['name']}")
            
if __name__ == "__main__":
    if len(sys.argv) > 1:
        parse_pdf(sys.argv[1])
    else:
        print("Usage: python import_pdf.py <path_to_pdf>")
