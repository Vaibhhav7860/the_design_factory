import csv
import json
import re

# Read the CSV file
products = []
seen_handles = set()

with open('products_export_1.csv', 'r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    
    for row in reader:
        handle = row['Handle']
        
        # Skip if we've already processed this product (variants create duplicate rows)
        if handle in seen_handles:
            continue
        
        seen_handles.add(handle)
        
        title = row['Title']
        price = float(row['Variant Price']) if row['Variant Price'] else 0
        compare_price = float(row['Variant Compare At Price']) if row['Variant Compare At Price'] else None
        image = row['Image Src']
        description = row['Body (HTML)']
        tags = row['Tags'].split(',') if row['Tags'] else []
        product_type = row['Type']
        
        # Try to determine category and subcategory from title and tags
        category = 'uncategorized'
        subcategory = ''
        
        title_lower = title.lower()
        
        # Category mapping based on product titles and types
        if any(word in title_lower for word in ['label', 'sticker']):
            category = 'labels'
            if 'rectangular' in title_lower:
                subcategory = 'rectangular-labels'
            elif 'round' in title_lower or 'circle' in title_lower:
                subcategory = 'round-labels'
            elif 'iron' in title_lower or 'iron-on' in title_lower:
                subcategory = 'iron-on-labels'
            elif 'book' in title_lower:
                subcategory = 'school-book-labels'
            elif 'transparent' in title_lower:
                subcategory = 'transparent-labels'
            elif '3d' in title_lower or 'embossed' in title_lower:
                subcategory = '3d-embossed-stickers'
            else:
                subcategory = 'mixed-shape-labels'
        
        elif any(word in title_lower for word in ['bag tag', 'bagtag']):
            category = 'school-essentials'
            subcategory = 'bag-tags'
        
        elif any(word in title_lower for word in ['sipper', 'bottle']):
            category = 'school-essentials'
            subcategory = 'sipper-bottle'
        
        elif 'lunch box' in title_lower or 'lunchbox' in title_lower:
            category = 'school-essentials'
            subcategory = 'lunch-box'
        
        elif 'sketch book' in title_lower or 'sketchbook' in title_lower:
            category = 'school-essentials'
            subcategory = 'sketch-book'
        
        elif 'pencil case' in title_lower:
            category = 'school-essentials'
            subcategory = 'pencil-case'
        
        elif 'planner' in title_lower:
            category = 'school-essentials'
            subcategory = 'rewritable-planners'
        
        elif 'back to school' in title_lower or 'school set' in title_lower:
            category = 'school-essentials'
            subcategory = 'back-to-school-label-set'
        
        elif any(word in title_lower for word in ['gift tag', 'gifttag']):
            category = 'gift-stationery'
            if '3d' in title_lower:
                subcategory = '3d-gift-tags'
            elif 'flat' in title_lower:
                subcategory = 'flat-gift-tags'
            elif 'hanging' in title_lower:
                subcategory = 'hanging-gift-tags'
            else:
                subcategory = '3d-gift-tags'
        
        elif 'money envelope' in title_lower or 'envelope' in title_lower:
            category = 'gift-stationery'
            subcategory = 'money-envelopes'
        
        elif 'gift sticker' in title_lower:
            category = 'gift-stationery'
            subcategory = 'gift-stickers'
        
        elif any(word in title_lower for word in ['duffle', 'duffel']):
            category = 'bags'
            subcategory = 'duffle-bags'
        
        elif 'jelly bag' in title_lower:
            category = 'bags'
            subcategory = 'jelly-bags'
        
        elif 'art bag' in title_lower:
            category = 'bags'
            subcategory = 'art-bags'
        
        elif 'backpack' in title_lower:
            category = 'bags'
            subcategory = 'backpacks'
        
        elif 'tote' in title_lower:
            category = 'bags'
            subcategory = 'tote-bags'
        
        elif 'swimming bag' in title_lower or 'swim bag' in title_lower:
            category = 'bags'
            subcategory = 'swimming-bags'
        
        elif 'school bag' in title_lower:
            category = 'bags'
            subcategory = 'school-bags'
        
        elif 'denim bag' in title_lower:
            category = 'bags'
            subcategory = 'denim-bags'
        
        elif 'diaper bag' in title_lower:
            category = 'bags'
            subcategory = 'baby-diaper-bag'
        
        elif 'storage' in title_lower or 'basket' in title_lower:
            category = 'organisers'
            subcategory = 'storage-basket'
        
        elif 'pouch' in title_lower or 'utility' in title_lower:
            category = 'organisers'
            subcategory = 'utility-pouches'
        
        elif 'vanity' in title_lower:
            category = 'organisers'
            subcategory = 'vanity'
        
        elif 'organiser set' in title_lower or 'organizer set' in title_lower:
            category = 'organisers'
            subcategory = 'organiser-sets'
        
        elif 'wall clock' in title_lower or 'clock' in title_lower:
            category = 'kids-accessories'
            subcategory = 'wall-clock'
        
        elif 'table mat' in title_lower or 'placemat' in title_lower:
            category = 'kids-accessories'
            subcategory = 'table-mat'
        
        elif 'towel' in title_lower:
            category = 'kids-accessories'
            subcategory = 'towel'
        
        elif 'table organiser' in title_lower or 'desk organiser' in title_lower:
            category = 'kids-accessories'
            subcategory = 'table-organiser'
        
        elif 'cap' in title_lower or 'hat' in title_lower:
            category = 'kids-accessories'
            subcategory = 'cap'
        
        elif 'apron' in title_lower:
            category = 'kids-accessories'
            subcategory = 'apron-set'
        
        elif 'neck pillow' in title_lower or 'travel pillow' in title_lower:
            category = 'kids-accessories'
            subcategory = 'neck-pillow-combo'
        
        elif 'combo' in title_lower or 'set' in title_lower:
            category = 'combos'
            if 'bag' in title_lower:
                subcategory = 'bag-combo-set'
            elif 'school' in title_lower:
                subcategory = 'school-bag-combo'
            elif 'gift' in title_lower:
                if 'adult' in title_lower:
                    subcategory = 'gift-stationery-combo-adults'
                else:
                    subcategory = 'gift-stationery-combo-kids'
            elif 'organiser' in title_lower or 'organizer' in title_lower:
                subcategory = 'organiser-sets'
            else:
                subcategory = 'back-to-school-label-set'
        
        # Create product object
        product = {
            'handle': handle,
            'title': title,
            'slug': handle,
            'price': int(price),
            'originalPrice': int(compare_price) if compare_price else int(price * 1.25),
            'image': image,
            'category': category,
            'subcategory': subcategory,
            'description': re.sub('<[^<]+?>', '', description)[:200] + '...' if description else f"Premium {title}",
            'badge': None
        }
        
        products.append(product)

# Save to JSON for review
with open('processed_products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print(f"Processed {len(products)} unique products")
print(f"\nCategory breakdown:")
categories = {}
for p in products:
    cat = p['category']
    categories[cat] = categories.get(cat, 0) + 1

for cat, count in sorted(categories.items()):
    print(f"  {cat}: {count} products")
