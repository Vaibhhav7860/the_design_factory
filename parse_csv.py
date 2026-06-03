import csv
import json
import re

FESTIVAL_KEYWORDS = ["rakhi", "diwali", "christmas", "holi", "valentine"]

def slugify(text):
    if not text:
        return ""
    text = str(text).lower().strip()
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'[^\w\-]+', '', text)
    text = re.sub(r'\-\-+', '-', text)
    text = text.strip('-')
    return text

skipped_count = 0

print("Starting to parse products_sheet_sorted_done.csv...")

updates = []

with open("products_sheet_sorted_done.csv", mode='r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        handle = row.get("Handle", "").strip()
        product_category_raw = row.get("Product Category", "").strip()
        title = row.get("Title", "").strip()
        
        if not handle or not product_category_raw:
            continue
            
        row_text_lower = f"{handle} {product_category_raw} {title}".lower()
        
        is_festival = any(keyword in row_text_lower for keyword in FESTIVAL_KEYWORDS)
        if is_festival:
            skipped_count += 1
            continue
            
        new_categories = set()
        new_subcategories = set()
        
        # Split by newline
        category_lines = [line.strip() for line in re.split(r'\r?\n', product_category_raw) if line.strip()]
        
        for line in category_lines:
            parts = [p.strip() for p in line.split(">") if p.strip()]
            if len(parts) == 3:
                # e.g. Labels > Specialty Labels > 3D embossed stickers
                new_categories.add(slugify(parts[0]))
                new_subcategories.add(slugify(parts[2]))
            elif len(parts) == 2:
                # e.g. Bags > Art bags
                new_categories.add(slugify(parts[0]))
                new_subcategories.add(slugify(parts[1]))
            elif len(parts) == 1:
                new_categories.add(slugify(parts[0]))
                
        if new_categories or new_subcategories:
            updates.append({
                "handle": handle,
                "categories": list(new_categories),
                "subcategories": list(new_subcategories)
            })

with open("csv_updates.json", "w", encoding='utf-8') as f:
    json.dump(updates, f, indent=2)

print(f"Exported {len(updates)} valid product updates to csv_updates.json")
print(f"Skipped {skipped_count} products due to festival keywords")
