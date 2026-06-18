import sys
import fitz

def extract_pdf(file_path):
    try:
        doc = fitz.open(file_path)
        text = ""
        for i in range(min(2, len(doc))):
            text += doc[i].get_text() + "\n"
        
        with open("pdf_output_fitz.txt", "w", encoding="utf-8") as f:
            f.write(text)
        print("Output written to pdf_output_fitz.txt")
    except Exception as e:
        print(f"Error reading {file_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        extract_pdf(sys.argv[1])
    else:
        print("Usage: python inspect_pdf_fitz.py <path_to_pdf>")
