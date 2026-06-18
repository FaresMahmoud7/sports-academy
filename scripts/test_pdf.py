import pdfplumber
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = "public/Players and Coaches/Current_Players_per_branch_club_season_img.pdf"

try:
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total pages: {len(pdf.pages)}")
        # Print tables from first page
        page = pdf.pages[0]
        tables = page.extract_tables()
        print(f"Tables on page 0: {len(tables)}")
        if tables:
            print(json.dumps(tables[0][:5], ensure_ascii=False, indent=2))
        else:
            text = page.extract_text()
            print("Extracted text preview:")
            print(text[:500])
except Exception as e:
    print(f"Error: {e}")
