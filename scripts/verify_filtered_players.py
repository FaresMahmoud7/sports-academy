import pdfplumber
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = "public/Players and Coaches/Current_Players_per_branch_club_season_img.pdf"

def fix_arabic_text(text):
    if not text: return ""
    text = text.replace("(cid:1005)", "و")
    text = text.replace("(cid:1019)", "ا")
    text = text.replace("(cid:911)", "ا")
    text = text.replace("(cid:3)", " ")
    text = re.sub(r'\(cid:\d+\)', '', text)
    # reverse the string
    text = text[::-1]
    return text.strip()

count = 0
with pdfplumber.open(pdf_path) as pdf:
    for idx, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        if not tables: continue
        table = tables[0]
        start_idx = 0
        if idx == 0:
            start_idx = 2
        for row in table[start_idx:]:
            if not row or len(row) < 10: continue
            nat_id = str(row[7]).strip() if row[7] else ""
            if not re.match(r'^\d{14}$', nat_id):
                continue
            name = fix_arabic_text(row[8])
            file_num = str(row[9]).strip() if row[9] else ""
            
            # Extract Belt
            raw_belt = row[1] if row[1] else ""
            belt_str = fix_arabic_text(raw_belt)
            
            # Map Belt
            mapped_belt = "White"
            if "دان" in belt_str or "اسود" in belt_str: mapped_belt = "Black Belt"
            elif "بنى" in belt_str or "بني" in belt_str: mapped_belt = "Brown 1"
            elif "ازرق" in belt_str or "أزرق" in belt_str: mapped_belt = "Blue 1"
            elif "اخضر" in belt_str or "أخضر" in belt_str: mapped_belt = "Green 1"
            elif "برتقالي" in belt_str or "برتقالى" in belt_str: mapped_belt = "Orange 1"
            elif "اصفر" in belt_str or "أصفر" in belt_str: mapped_belt = "Yellow 1"
            
            # Extract Birth Date
            birth_date = str(row[5]).strip() if row[5] else ""
            birth_year = 2015
            if birth_date:
                try:
                    birth_year = int(birth_date.split('/')[0])
                except:
                    pass
                    
            count += 1
            print(f"{count}: Name='{name}', NatID='{nat_id}', FileNum='{file_num}', Belt='{mapped_belt}', BirthYear={birth_year}")

print(f"Total filtered players: {count}")
