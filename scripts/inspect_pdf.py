import sys
from PyPDF2 import PdfReader

def extract_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        text = ""
        for i in range(min(2, len(reader.pages))):
            text += reader.pages[i].extract_text() + "\n"
        
        with open("pdf_output.txt", "w", encoding="utf-8") as f:
            f.write(text)
        print("Output written to pdf_output.txt")
    except Exception as e:
        print(f"Error reading {file_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        extract_pdf(sys.argv[1])
    else:
        print("Usage: python inspect_pdf.py <path_to_pdf>")
