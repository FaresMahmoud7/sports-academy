import sys
sys.stdout.reconfigure(encoding='utf-8')
import re
import pdfplumber

def find_missing_player(file_path):
    print("Extracting text from PDF...")
    all_text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            all_text += page.extract_text() + "\n"

    lines = all_text.split('\n')
    
    # Let's extract all numbers that could be indices
    # Or just look for lines ending with a number from 1 to 173
    indices_found = []
    for line in lines:
        if re.search(r'\b\d{14}\b', line):
            parts = line.split()
            try:
                # the index is usually the last token
                idx = int(parts[-1])
                indices_found.append(idx)
            except:
                pass
                
    missing = set(range(1, 174)) - set(indices_found)
    print("Missing indices based on \d{14} search:", missing)
    
    # Now let's print the lines around the missing index
    for missing_idx in missing:
        for i, line in enumerate(lines):
            # If line ends with " {missing_idx}"
            if line.endswith(f" {missing_idx}") or line.strip() == str(missing_idx):
                print(f"Found line for missing index {missing_idx}:")
                print(lines[i-1])
                print(line)
                print(lines[i+1] if i+1 < len(lines) else "")

if __name__ == "__main__":
    find_missing_player(sys.argv[1])
