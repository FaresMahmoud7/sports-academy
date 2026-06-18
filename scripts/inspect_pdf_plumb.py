import sys
import pdfplumber

def extract_pdf(file_path):
    try:
        with pdfplumber.open(file_path) as pdf:
            text = ""
            for i in range(min(2, len(pdf.pages))):
                text += pdf.pages[i].extract_text() + "\n"
            
            with open("pdf_output_plumb.txt", "w", encoding="utf-8") as f:
                f.write(text)
            print("Output written to pdf_output_plumb.txt")
    except Exception as e:
        print(f"Error reading {file_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        extract_pdf(sys.argv[1])
    else:
        print("Usage: python inspect_pdf_plumb.py <path_to_pdf>")
