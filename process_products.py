import csv
import json
import re

# ─────────────────────────────────────────────────────────────────────────────
# PASS 1: Read all rows, group by handle
#   - First row with a non-empty Title is the "primary" row
#   - All rows (including secondary) may have an Image Src → gallery images
# ─────────────────────────────────────────────────────────────────────────────
handle_data = {}  # handle → { primary_row, images: [] }

with open('products_export_1.csv', 'r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        handle = row['Handle']
        img = row['Image Src'].strip() if row['Image Src'] else ''

        if handle not in handle_data:
            handle_data[handle] = {'primary': None, 'images': []}

        # A "primary" row has a non-empty Title
        if row['Title'].strip() and handle_data[handle]['primary'] is None:
            handle_data[handle]['primary'] = row

        # Collect every non-empty image URL for this handle
        if img:
            handle_data[handle]['images'].append(img)

# ─────────────────────────────────────────────────────────────────────────────
# PASS 2: Categorize each product and build the product object
# ─────────────────────────────────────────────────────────────────────────────

def categorize(title, tags_str):
    """
    Return (category, subcategory) by matching title keywords.
    Falls back to tags if title match fails.
    """
    t = title.lower()
    tags = [tag.strip().lower() for tag in tags_str.split(',')] if tags_str else []

    # ── Labels ──────────────────────────────────────────────────────────────
    if any(word in t for word in ['label', 'sticker']):
        if 'rectangular' in t:
            return 'labels', 'rectangular-labels'
        elif 'round' in t or 'circle' in t:
            return 'labels', 'round-labels'
        elif 'iron' in t or 'iron-on' in t:
            return 'labels', 'iron-on-labels'
        elif 'book' in t:
            return 'labels', 'school-book-labels'
        elif 'transparent' in t:
            return 'labels', 'transparent-labels'
        elif '3d' in t or 'embossed' in t:
            return 'labels', '3d-embossed-stickers'
        else:
            return 'labels', 'mixed-shape-labels'

    # ── School Essentials ────────────────────────────────────────────────────
    elif any(word in t for word in ['bag tag', 'bagtag']):
        return 'school-essentials', 'bag-tags'
    elif any(word in t for word in ['sipper', 'bottle']):
        return 'school-essentials', 'sipper-bottle'
    elif 'lunch box' in t or 'lunchbox' in t:
        return 'school-essentials', 'lunch-box'
    elif 'sketch book' in t or 'sketchbook' in t:
        return 'school-essentials', 'sketch-book'
    elif 'pencil case' in t:
        return 'school-essentials', 'pencil-case'
    elif 'planner' in t and 'meal' not in t:
        return 'school-essentials', 'rewritable-planners'
    elif 'back to school' in t or 'school set' in t:
        return 'school-essentials', 'back-to-school-label-set'
    elif 'ring folder' in t:
        return 'school-essentials', 'ring-folders'
    elif 'expandable folder' in t:
        return 'school-essentials', 'expandable-folders'

    # ── Gift Stationery ──────────────────────────────────────────────────────
    elif any(word in t for word in ['gift tag', 'gifttag', 'notecard', 'note card']):
        if '3d' in t:
            return 'gift-stationery', '3d-gift-tags'
        elif 'flat' in t:
            return 'gift-stationery', 'flat-gift-tags'
        elif 'hanging' in t:
            return 'gift-stationery', 'hanging-gift-tags'
        else:
            return 'gift-stationery', '3d-gift-tags'
    elif 'money envelope' in t or ('envelope' in t and 'adult' not in t):
        return 'gift-stationery', 'money-envelopes'
    elif 'gift sticker' in t:
        return 'gift-stationery', 'gift-stickers'
    elif 'gift hamper' in t or 'hamper' in t:
        return 'gift-stationery', 'gift-stationery-sets'

    # ── Bags ─────────────────────────────────────────────────────────────────
    elif any(word in t for word in ['duffle', 'duffel']):
        return 'bags', 'duffle-bags'
    elif 'jelly bag' in t:
        return 'bags', 'jelly-bags'
    elif 'art bag' in t:
        return 'bags', 'art-bags'
    elif 'backpack' in t:
        return 'bags', 'backpacks'
    elif 'tote' in t:
        return 'bags', 'tote-bags'
    elif 'swimming bag' in t or 'swim bag' in t:
        return 'bags', 'swimming-bags'
    elif 'school bag' in t:
        return 'bags', 'school-bags'
    elif 'denim bag' in t:
        return 'bags', 'denim-bags'
    elif 'diaper bag' in t:
        return 'bags', 'baby-diaper-bag'

    # ── Organisers ───────────────────────────────────────────────────────────
    elif 'storage' in t or 'basket' in t:
        return 'organisers', 'storage-basket'
    elif 'pouch' in t or 'utility' in t:
        return 'organisers', 'utility-pouches'
    elif 'vanity' in t:
        return 'organisers', 'vanity'
    elif 'organiser set' in t or 'organizer set' in t:
        return 'organisers', 'organiser-sets'
    elif 'reward chart' in t:
        return 'organisers', 'reward-charts'
    elif 'daily checklist' in t or 'responsibility chart' in t or 'responsibilty chart' in t or 'daily check' in t:
        return 'organisers', 'reward-charts'
    elif 'meal planner' in t or 'weekly planner' in t or 'weekly meal' in t:
        return 'kids-accessories', 'table-organiser'
    elif 'christmas ornament' in t or 'ornament' in t or 'felt' in t or 'hanging' in t or 'bunting' in t:
        return 'kids-accessories', 'felt-hangings'
    elif 'activity' in t or 'sorting' in t or 'matching' in t:
        return 'organisers', 'sorting-activities'

    # ── Kids Accessories ─────────────────────────────────────────────────────
    elif 'wall clock' in t or 'clock' in t:
        return 'kids-accessories', 'wall-clock'
    elif 'table mat' in t or 'placemat' in t:
        return 'kids-accessories', 'table-mat'
    elif 'towel' in t:
        return 'kids-accessories', 'towel'
    elif 'table organiser' in t or 'desk organiser' in t or 'penstand' in t or 'pen stand' in t:
        return 'kids-accessories', 'table-organiser'
    elif 'cap' in t or 'hat' in t:
        return 'kids-accessories', 'cap'
    elif 'apron' in t:
        return 'kids-accessories', 'apron-set'
    elif 'neck pillow' in t or 'travel pillow' in t:
        return 'kids-accessories', 'neck-pillow-combo'

    # ── Accessories & Gifts (Rakhi) ──────────────────────────────────────────
    elif 'rakhi' in t or 'raksha' in t:
        return 'accessories-gifts', 'rakhi'
    elif 'bracelet' in t and 'charm' in t:
        return 'accessories-gifts', 'rakhi'

    # ── Combos ──────────────────────────────────────────────────────────────
    elif 'combo' in t or 'set' in t:
        if 'bag' in t:
            return 'combos', 'bag-combo-set'
        elif 'school' in t:
            return 'combos', 'school-bag-combo'
        elif 'gift' in t:
            if 'adult' in t:
                return 'combos', 'gift-stationery-combo-adults'
            else:
                return 'combos', 'gift-stationery-combo-kids'
        elif 'organiser' in t or 'organizer' in t:
            return 'combos', 'organiser-sets'
        else:
            return 'combos', 'back-to-school-label-set'

    # Fallback: try tags
    for tag in tags:
        if 'label' in tag:
            return 'labels', 'mixed-shape-labels'
        if 'bag' in tag:
            return 'bags', 'duffle-bags'

    return 'uncategorized', ''


# ─────────────────────────────────────────────────────────────────────────────
# Build product list
# ─────────────────────────────────────────────────────────────────────────────
products = []

for handle, data in handle_data.items():
    row = data['primary']
    if row is None:
        # No primary row (edge case — skip)
        continue

    title = row['Title'].strip()
    price_raw = row['Variant Price']
    compare_raw = row['Variant Compare At Price']
    description = row['Body (HTML)'] or ''
    tags_str = row['Tags'] or ''

    price = float(price_raw) if price_raw else 0
    compare_price = float(compare_raw) if compare_raw else None

    # De-duplicate images while preserving order
    seen = set()
    images = []
    for img in data['images']:
        if img and img not in seen:
            seen.add(img)
            images.append(img)

    category, subcategory = categorize(title, tags_str)

    product = {
        'handle': handle,
        'title': title,
        'slug': handle,
        'price': int(price),
        'originalPrice': int(compare_price) if compare_price else int(price * 1.25),
        'image': images[0] if images else '',
        'images': images,  # Full gallery
        'category': category,
        'subcategory': subcategory,
        'description': re.sub('<[^<]+?>', '', description)[:200] + '...' if description else f'Premium {title}',
        'badge': None,
    }

    products.append(product)

# ─────────────────────────────────────────────────────────────────────────────
# Save to JSON for review
# ─────────────────────────────────────────────────────────────────────────────
with open('processed_products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print(f'Processed {len(products)} products')

# Category breakdown
print('\nCategory breakdown:')
cat_counts = {}
for p in products:
    c = p['category']
    cat_counts[c] = cat_counts.get(c, 0) + 1

for cat, count in sorted(cat_counts.items()):
    print(f'  {cat}: {count}')

# Uncategorized detail
uncategorized = [p for p in products if p['category'] == 'uncategorized']
if uncategorized:
    print(f'\nSTILL UNCATEGORIZED ({len(uncategorized)}):')
    for p in uncategorized:
        print(f'  - {p["title"]}')

# Image stats
with_gallery = [p for p in products if len(p['images']) > 1]
print(f'\nProducts with multiple images: {len(with_gallery)}')
max_imgs = max(len(p["images"]) for p in products)
print(f'Max images on a single product: {max_imgs}')
