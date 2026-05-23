import csv

f = open('products_export_1.csv', 'r', encoding='utf-8')
r = csv.DictReader(f)

seen_handles = set()
uncategorized = []

for row in r:
    handle = row['Handle']
    if handle in seen_handles:
        continue
    seen_handles.add(handle)
    
    title = row['Title']
    pcat = row['Product Category'].strip() if row['Product Category'] else ''
    title_lower = title.lower()
    
    # Reproduce the current logic to find what falls through
    category = 'uncategorized'
    
    if any(word in title_lower for word in ['label', 'sticker']):
        category = 'labels'
    elif any(word in title_lower for word in ['bag tag', 'bagtag']):
        category = 'school-essentials'
    elif any(word in title_lower for word in ['sipper', 'bottle']):
        category = 'school-essentials'
    elif 'lunch box' in title_lower or 'lunchbox' in title_lower:
        category = 'school-essentials'
    elif 'sketch book' in title_lower or 'sketchbook' in title_lower:
        category = 'school-essentials'
    elif 'pencil case' in title_lower:
        category = 'school-essentials'
    elif 'planner' in title_lower:
        category = 'school-essentials'
    elif 'back to school' in title_lower or 'school set' in title_lower:
        category = 'school-essentials'
    elif any(word in title_lower for word in ['gift tag', 'gifttag']):
        category = 'gift-stationery'
    elif 'money envelope' in title_lower or 'envelope' in title_lower:
        category = 'gift-stationery'
    elif 'gift sticker' in title_lower:
        category = 'gift-stationery'
    elif any(word in title_lower for word in ['duffle', 'duffel']):
        category = 'bags'
    elif 'jelly bag' in title_lower:
        category = 'bags'
    elif 'art bag' in title_lower:
        category = 'bags'
    elif 'backpack' in title_lower:
        category = 'bags'
    elif 'tote' in title_lower:
        category = 'bags'
    elif 'swimming bag' in title_lower or 'swim bag' in title_lower:
        category = 'bags'
    elif 'school bag' in title_lower:
        category = 'bags'
    elif 'denim bag' in title_lower:
        category = 'bags'
    elif 'diaper bag' in title_lower:
        category = 'bags'
    elif 'storage' in title_lower or 'basket' in title_lower:
        category = 'organisers'
    elif 'pouch' in title_lower or 'utility' in title_lower:
        category = 'organisers'
    elif 'vanity' in title_lower:
        category = 'organisers'
    elif 'organiser set' in title_lower or 'organizer set' in title_lower:
        category = 'organisers'
    elif 'wall clock' in title_lower or 'clock' in title_lower:
        category = 'kids-accessories'
    elif 'table mat' in title_lower or 'placemat' in title_lower:
        category = 'kids-accessories'
    elif 'towel' in title_lower:
        category = 'kids-accessories'
    elif 'table organiser' in title_lower or 'desk organiser' in title_lower:
        category = 'kids-accessories'
    elif 'cap' in title_lower or 'hat' in title_lower:
        category = 'kids-accessories'
    elif 'apron' in title_lower:
        category = 'kids-accessories'
    elif 'neck pillow' in title_lower or 'travel pillow' in title_lower:
        category = 'kids-accessories'
    elif 'combo' in title_lower or 'set' in title_lower:
        category = 'combos'
    
    if category == 'uncategorized':
        uncategorized.append((title, pcat))

print(f"Total uncategorized: {len(uncategorized)}")
print(f"\nUncategorized products and their CSV 'Product Category':")
for title, pcat in uncategorized:
    print(f"  {title}")
    print(f"    CSV Category: {pcat if pcat else '(empty)'}")
