import sys
import json
from docx import Document

def extract_tables(file_path):
    try:
        doc = Document(file_path)
        tables_data = []
        for i, table in enumerate(doc.tables):
            table_data = []
            for row in table.rows:
                row_data = [cell.text.strip() for cell in row.cells]
                table_data.append(row_data)
            tables_data.append({
                "table_index": i,
                "rows": table_data
            })
        with open("docx_output.json", "w", encoding="utf-8") as f:
            json.dump(tables_data, f, ensure_ascii=False, indent=2)
        print("Output written to docx_output.json")
    except Exception as e:
        print(f"Error reading {file_path}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        extract_tables(sys.argv[1])
    else:
        print("Usage: python inspect_docx.py <path_to_docx>")
