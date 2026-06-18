import pdfplumber
import sys
import re

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

with pdfplumber.open(pdf_path) as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    count = 0
    for idx, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        if not tables:
            print(f"Page {idx+1} has no tables.")
            continue
        print(f"Page {idx+1} has {len(tables)} tables.")
        table = tables[0]
        start_idx = 0
        if idx == 0:
            start_idx = 2  # Skip headers
        
        for r_idx, row in enumerate(table[start_idx:]):
            if not row or len(row) < 10:
                continue
            name = fix_arabic_text(row[8])
            nat_id = str(row[7]).strip() if row[7] else ""
            file_num = str(row[9]).strip() if row[9] else ""
            if name:
                count += 1
                if count <= 15:
                    print(f"{count}: Name='{name}', NatID='{nat_id}', FileNum='{file_num}'")
    print(f"Total rows extracted: {count}")
