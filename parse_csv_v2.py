"""
Comprehensive CSV -> JSON product category mapper.

STRATEGY:
1. Parse CSV, group all category paths by Handle (Shopify has multiple rows per product).
2. For each product, separate festival paths from non-festival paths.
3. If a product has ONLY festival paths -> output with empty categories/subcategories 
   (so the Mongo update will CLEAR the old incorrect categorization).
4. If a product has non-festival paths -> output those as categories/subcategories.
5. Festival filtering is done on CATEGORY PATHS only, never on product title/handle.
"""

import csv
import json
import re

FESTIVAL_KEYWORDS = ["rakhi", "diwali", "christmas", "holi", "valentine"]

def slugify(text):
    if not text:
        return ""
    text = str(text).lower().strip()
    # Replace & with and
    text = text.replace('&', 'and')
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'[^\w\-]+', '', text)
    text = re.sub(r'\-\-+', '-', text)
    text = text.strip('-')
    return text

def is_festival_path(path_str):
    """Check if a CATEGORY PATH (not a product) is festival-related."""
    lower = path_str.lower()
    return any(kw in lower for kw in FESTIVAL_KEYWORDS)

def parse_path(path_str):
    """
    Parse a category path like:
      "Labels > Specialty Labels > 3D embossed stickers"  -> category=labels, subcategory=3d-embossed-stickers
      "Bags > Art bags"                                     -> category=bags, subcategory=art-bags
      "Labels"                                              -> category=labels, subcategory=None
    """
    parts = [p.strip() for p in path_str.split(">") if p.strip()]
    if len(parts) >= 3:
        # Category > Custom Heading > Sub-category
        return slugify(parts[0]), slugify(parts[2])
    elif len(parts) == 2:
        # Category > Sub-category
        return slugify(parts[0]), slugify(parts[1])
    elif len(parts) == 1:
        return slugify(parts[0]), None
    return None, None

print("=== Starting CSV parse ===")

# Step 1: Read CSV and group all category paths by Handle
handle_paths = {}  # handle -> set of raw category path strings
handle_titles = {}  # handle -> title (for logging)

with open("products_sheet_sorted_done.csv", mode='r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        handle = row.get("Handle", "").strip()
        if not handle:
            continue
        
        title = row.get("Title", "").strip()
        if title and handle not in handle_titles:
            handle_titles[handle] = title
            
        product_category_raw = row.get("Product Category", "").strip()
        if not product_category_raw:
            continue
        
        if handle not in handle_paths:
            handle_paths[handle] = set()
        
        # Split by newline (multi-category entries within a single cell)
        for line in re.split(r'\r?\n', product_category_raw):
            line = line.strip()
            if line:
                handle_paths[handle].add(line)

print(f"Found {len(handle_paths)} unique products with category data in CSV")

# Step 2: For each product, process paths
updates = []
stats = {
    "clean_products": 0,
    "pure_festival_products": 0,
    "total_paths_processed": 0,
    "festival_paths_filtered": 0,
}

for handle, paths in handle_paths.items():
    categories = set()
    subcategories = set()
    
    non_festival_paths = []
    festival_paths = []
    
    for path in paths:
        stats["total_paths_processed"] += 1
        if is_festival_path(path):
            festival_paths.append(path)
            stats["festival_paths_filtered"] += 1
        else:
            non_festival_paths.append(path)
    
    for path in non_festival_paths:
        cat, subcat = parse_path(path)
        if cat:
            categories.add(cat)
        if subcat:
            subcategories.add(subcat)
    
    if non_festival_paths:
        stats["clean_products"] += 1
    else:
        stats["pure_festival_products"] += 1
        # This product has ONLY festival paths.
        # We still add it to updates but with empty arrays,
        # so the MongoDB update will clear its old incorrect categorization.
    
    updates.append({
        "handle": handle,
        "categories": sorted(categories),
        "subcategories": sorted(subcategories),
        "is_festival_only": len(non_festival_paths) == 0,
    })

with open("csv_updates_v2.json", "w", encoding='utf-8') as f:
    json.dump(updates, f, indent=2)

print(f"\n=== Statistics ===")
print(f"Total products processed: {len(updates)}")
print(f"Clean products (have non-festival paths): {stats['clean_products']}")
print(f"Pure festival products (will be cleared): {stats['pure_festival_products']}")
print(f"Total category paths processed: {stats['total_paths_processed']}")
print(f"Festival paths filtered out: {stats['festival_paths_filtered']}")
print(f"\nExported to csv_updates_v2.json")

# Verification: print a few examples
print("\n=== Sample Clean Products ===")
for u in updates[:5]:
    if not u["is_festival_only"]:
        print(f"  {u['handle']}: cats={u['categories']}, subcats={u['subcategories']}")

print("\n=== Sample Festival-Only Products (will be cleared) ===")
festival_only = [u for u in updates if u["is_festival_only"]]
for u in festival_only[:5]:
    print(f"  {u['handle']}: cats={u['categories']}, subcats={u['subcategories']}")

# Specific verification
cap_products = [u for u in updates if 'cap' in u.get('subcategories', [])]
print(f"\n=== Products that will have 'cap' subcategory: {len(cap_products)} ===")
for u in cap_products:
    print(f"  {u['handle']}: cats={u['categories']}, subcats={u['subcategories']}")
