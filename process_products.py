import csv
import json
import re
import os
import html

# ─────────────────────────────────────────────────────────────────────────────
# PASS 1: Read all rows, group by handle
# ─────────────────────────────────────────────────────────────────────────────
handle_data = {}

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
# PASS 2: Categorize each product into MULTIPLE categories/subcategories
# ─────────────────────────────────────────────────────────────────────────────

def categorize_multi(title, tags_str):
    t = title.lower()
    tags = [tag.strip().lower() for tag in tags_str.split(',')] if tags_str else []
    all_text = t + ' ' + ' '.join(tags)

    categories = set()
    subcategories = set()

    is_adult = 'adult' in t or 'adults' in t or 'grown up' in t

    # 1. LABELS
    if any(word in all_text for word in ['label', 'sticker']):
        categories.add('labels')
        if 'rectangular' in t:
            subcategories.add('rectangular-labels')
        elif 'round' in t or 'circle' in t:
            subcategories.add('round-labels')
        elif 'iron' in t or 'iron-on' in t:
            subcategories.add('iron-on-labels')
            categories.add('school-essentials')
            subcategories.add('iron-on-labels-clothes')
        elif 'book' in t:
            subcategories.add('school-book-labels')
            categories.add('school-essentials')
        elif 'transparent' in t:
            subcategories.add('transparent-labels')
        elif '3d' in t or 'embossed' in t:
            subcategories.add('3d-embossed-stickers')
        elif 'gift tag' not in t and 'notecard' not in t:
            subcategories.add('mixed-shape-labels')
            categories.add('school-essentials')
            subcategories.add('name-labels')

    # 2. SCHOOL ESSENTIALS & TRAVEL ESSENTIALS
    if any(word in t for word in ['bag tag', 'bagtag']):
        if is_adult:
            categories.update(['adults-corner', 'travel-essentials'])
            subcategories.update(['bag-tags-adults'])
        else:
            categories.update(['school-essentials', 'travel-essentials'])
            subcategories.update(['bag-tags', 'bag-tags-kids'])
    if 'sipper' in t or 'bottle' in t:
        categories.add('school-essentials')
        subcategories.add('sipper-bottle')
    if 'lunch box' in t or 'lunchbox' in t:
        categories.add('school-essentials')
        subcategories.add('lunch-box')
    if 'sketch book' in t or 'sketchbook' in t:
        categories.add('school-essentials')
        subcategories.add('sketch-book')
    if 'pencil case' in t:
        categories.add('school-essentials')
        subcategories.add('pencil-case')
    if 'planner' in t and 'meal' not in t:
        categories.update(['school-essentials', 'play-learn'])
        subcategories.add('rewritable-planners')
    if 'back to school' in t or 'school set' in t:
        categories.update(['school-essentials', 'combos'])
        subcategories.add('back-to-school-label-set')
    if 'ring folder' in t:
        categories.add('school-essentials')
        subcategories.add('ring-folders')
    if 'expandable folder' in t:
        categories.add('school-essentials')
        subcategories.add('expandable-folders')

    # 3. GIFT STATIONERY & ADULTS CORNER
    if any(word in t for word in ['gift tag', 'gifttag', 'notecard', 'note card']):
        categories.add('gift-stationery')
        if is_adult:
            categories.add('adults-corner')
            if 'flat' in t:
                subcategories.add('flat-gift-tags-adults')
                subcategories.add('flat-gift-tags')
            else:
                subcategories.add('3d-gift-tags-adults')
                subcategories.add('3d-gift-tags')
        else:
            if '3d' in t:
                subcategories.add('3d-gift-tags')
            elif 'flat' in t:
                subcategories.add('flat-gift-tags')
            elif 'hanging' in t:
                subcategories.add('hanging-gift-tags')
            else:
                subcategories.add('3d-gift-tags')
    if 'money envelope' in t or ('envelope' in t and not is_adult):
        if is_adult:
            categories.update(['adults-corner', 'gift-stationery'])
            subcategories.update(['money-envelopes-adults', 'money-envelopes'])
        else:
            categories.add('gift-stationery')
            subcategories.add('money-envelopes')
    if 'envelope' in t and is_adult:
        categories.update(['adults-corner', 'gift-stationery'])
        subcategories.update(['money-envelopes-adults', 'money-envelopes'])
    if 'gift sticker' in t:
        categories.add('gift-stationery')
        subcategories.add('gift-stickers')
    if 'gift hamper' in t or ('hamper' in t and 'rakhi' not in t):
        categories.add('combos')
        if is_adult:
            subcategories.add('gift-stationery-combo-adults')
            categories.add('adults-corner')
        else:
            subcategories.add('gift-stationery-combo-kids')
            categories.add('gift-stationery')
            subcategories.add('gift-stationery-sets')

    # 4. BAGS
    if 'duffle' in t or 'duffel' in t:
        categories.add('bags')
        subcategories.add('duffle-bags')
    if 'jelly bag' in t:
        categories.add('bags')
        subcategories.add('jelly-bags')
    if 'art bag' in t:
        categories.add('bags')
        subcategories.add('art-bags')
    if 'backpack' in t:
        categories.add('bags')
        subcategories.add('backpacks')
    if 'tote' in t:
        categories.add('bags')
        subcategories.add('tote-bags')
    if 'swimming bag' in t or 'swim bag' in t:
        categories.add('bags')
        subcategories.add('swimming-bags')
        if 'pouch' in t:
            categories.add('travel-essentials')
            subcategories.add('multipurpose-pouches')
    if 'school bag' in t:
        categories.add('bags')
        subcategories.add('school-bags')
        if 'combo' in t or 'set' in t:
            categories.add('combos')
            subcategories.add('school-bag-combo')
    if 'denim bag' in t:
        categories.add('bags')
        subcategories.add('denim-bags')
    if 'diaper bag' in t:
        categories.add('bags')
        subcategories.add('baby-diaper-bag')

    # 5. ORGANISERS
    if ('storage' in t or 'basket' in t) and 'gift' not in t:
        categories.update(['organisers', 'decor-dining'])
        subcategories.add('storage-basket')
    if ('pouch' in t or 'utility' in t) and 'swim' not in t:
        categories.update(['organisers', 'travel-essentials'])
        subcategories.update(['utility-pouches', 'multipurpose-pouches'])
    if 'vanity' in t:
        categories.update(['organisers', 'travel-essentials'])
        subcategories.add('vanity')
    if 'organiser set' in t or 'organizer set' in t:
        categories.update(['organisers', 'combos'])
        subcategories.add('organiser-sets')
    if 'reward chart' in t or 'daily checklist' in t or 'responsibility chart' in t or 'responsibilty chart' in t or 'daily check' in t:
        categories.update(['organisers', 'play-learn'])
        subcategories.add('reward-charts')
    if 'activity' in t or 'sorting' in t or 'matching' in t:
        categories.update(['organisers', 'play-learn'])
        subcategories.add('sorting-activities')

    # 6. DECOR & DINING / KIDS ACCESSORIES
    if 'meal planner' in t or 'weekly planner' in t or 'weekly meal' in t:
        categories.add('decor-dining')
        subcategories.add('meal-planner')
    if 'christmas ornament' in t or 'ornament' in t or 'felt' in t or 'hanging' in t or 'bunting' in t:
        categories.update(['decor-dining', 'kids-accessories'])
        subcategories.update(['felt-hangings-buntings', 'felt-hangings'])
    if 'wall clock' in t or 'clock' in t:
        categories.update(['decor-dining', 'kids-accessories'])
        subcategories.add('wall-clock')
    if 'table mat' in t or 'placemat' in t:
        categories.update(['decor-dining', 'kids-accessories'])
        subcategories.add('table-mat')
    if 'table organiser' in t or 'desk organiser' in t or 'penstand' in t or 'pen stand' in t:
        categories.update(['kids-accessories', 'accessories-gifts'])
        subcategories.update(['table-organiser', 'wooden-organisers'])
    if 'cap' in t or 'hat' in t:
        categories.update(['kids-accessories', 'accessories-gifts'])
        subcategories.update(['cap', 'caps'])
    if 'apron' in t:
        categories.update(['kids-accessories', 'accessories-gifts'])
        subcategories.update(['apron-set', 'apron-sets'])
    if 'neck pillow' in t or 'travel pillow' in t:
        categories.update(['kids-accessories', 'travel-essentials'])
        subcategories.update(['neck-pillow-combo', 'neck-pillow-set'])
    
    # Towels
    if 'towel' in t:
        if is_adult:
            categories.update(['adults-corner', 'accessories-gifts'])
            subcategories.update(['towels', 'towels-adults'])
        else:
            categories.update(['kids-accessories', 'accessories-gifts'])
            subcategories.update(['towel', 'towels'])

    # Accessories & Gifts
    if 'rakhi' in t or 'raksha' in t or ('bracelet' in t and 'charm' in t):
        categories.add('accessories-gifts')
        subcategories.add('rakhi')

    # Travel Essentials Additions
    if 'travel organiser' in t or 'travel organizer' in t:
        categories.add('travel-essentials')
        subcategories.add('travel-organisers')
    if 'mix n match' in t or 'mix and match' in t or 'travel set' in t:
        categories.add('travel-essentials')
        subcategories.add('mix-match-sets')
        categories.add('combos')
        subcategories.add('back-to-school-label-set')

    # Combos Additions
    if 'combo' in t or 'set' in t:
        if 'bag' in t:
            categories.add('combos')
            subcategories.add('bag-combo-set')

    # THEMES
    theme_mapping = {
        'animal': 'animals', 'safari': 'animals', 'jungle': 'animals',
        'dino': 'dino', 'dinosaur': 'dino',
        'unicorn': 'unicorn',
        'space': 'space', 'astronaut': 'space', 'rocket': 'space',
        'princess': 'princess', 'fairy': 'princess',
        'mermaid': 'favourite-characters', # actually mermaid can be favourite-characters
        'superhero': 'superheroes', 'spiderman': 'superheroes', 'avengers': 'superheroes', 'marvel': 'superheroes', 'batman': 'superheroes',
        'transport': 'transport', 'car': 'transport', 'train': 'transport', 'airplane': 'transport', 'truck': 'transport',
        'underwater': 'underwater',
        'peppa': 'favourite-characters', 'cocomelon': 'favourite-characters', 'harry potter': 'favourite-characters',
        'minnie': 'favourite-characters', 'mickey': 'favourite-characters', 'barbie': 'favourite-characters'
    }
    
    for kw, theme in theme_mapping.items():
        if kw in t or kw in tags:
            categories.add('themes')
            subcategories.add(theme)
            
    if 'boy' in t and 'cute' in t:
        categories.add('themes')
        subcategories.add('cute-lil-boy')
    if 'girl' in t and 'cute' in t:
        categories.add('themes')
        subcategories.add('cute-lil-girl')

    # Fallbacks if completely empty
    if not categories:
        for tag in tags:
            if 'label' in tag and 'gift' not in tag and 'gift' not in t:
                categories.update(['labels', 'school-essentials'])
                subcategories.update(['mixed-shape-labels', 'name-labels'])
            if 'bag' in tag and 'swim' not in tag and 'swim' not in t:
                categories.add('bags')
                subcategories.add('duffle-bags')
    
    if not categories:
        categories.add('uncategorized')

    return list(categories), list(subcategories)


# ─────────────────────────────────────────────────────────────────────────────
# Build product list
# ─────────────────────────────────────────────────────────────────────────────
products = []

for handle, data in handle_data.items():
    row = data['primary']
    if row is None:
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

    cats, subcats = categorize_multi(title, tags_str)

    clean_desc = ''
    if description:
        # Unescape HTML entities (e.g., &lt;p&gt; to <p>) first, then strip tags
        clean_desc = html.unescape(description)
        clean_desc = re.sub('<[^<]+?>', '', clean_desc).strip()
    
    product = {
        'id': handle,
        'slug': handle,
        'title': title,
        'price': int(price),
        'images': images,
        'description': clean_desc if clean_desc else f'Premium {title}',
        'badge': None,
        'categories': sorted(cats),
        'subcategories': sorted(subcats),
    }
    
    if compare_price and compare_price > price:
        product['originalPrice'] = int(compare_price)
    
    products.append(product)

# Save processed json
with open('processed_products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print(f'Processed {len(products)} products into processed_products.json')


# ─────────────────────────────────────────────────────────────────────────────
# Generate src/data/products.js
# ─────────────────────────────────────────────────────────────────────────────

lines = []
lines.append('// Auto-generated from products_export_1.csv')
lines.append(f'// Total products: {len(products)}')
lines.append('')
lines.append('export const products = [')

for i, p in enumerate(products):
    comma = '' if i == len(products) - 1 else ','
    entry = json.dumps(p, ensure_ascii=False, indent=2)
    
    # We want to keep the output structure clean and similar to existing products.js
    # We can just write it directly.
    # To fix formatting slightly, we indent by 2 spaces inside the array
    entry_lines = entry.split('\\n')
    entry_str = '\\n'.join('  ' + line if j > 0 else '  ' + line for j, line in enumerate(entry_lines))
    
    # Replace \/ with / if json.dumps escapes it (ensure_ascii=False usually doesn't, but let's be safe)
    entry_str = entry.replace("\\/", "/")
    
    indented_entry = []
    for j, line in enumerate(entry_str.split('\n')):
        if j == 0:
            indented_entry.append('  ' + line)
        else:
            indented_entry.append('  ' + line)
    
    # Better approach for indenting:
    lines.append('  ' + entry_str.replace('\n', '\n  ') + comma)

lines.append('];')
lines.append('')
lines.append('export function getProductsByCategory(categorySlug) {')
lines.append('  return products.filter((p) => p.categories && p.categories.includes(categorySlug));')
lines.append('}')
lines.append('')
lines.append('export function getProductsBySubcategory(categorySlug, subcategorySlug) {')
lines.append('  return products.filter(')
lines.append('    (p) => p.categories && p.categories.includes(categorySlug) && p.subcategories && p.subcategories.includes(subcategorySlug)')
lines.append('  );')
lines.append('}')
lines.append('')
lines.append('export function getRelatedProducts(productSlug, limit = 4) {')
lines.append('  const product = products.find((p) => p.slug === productSlug);')
lines.append('  if (!product) return [];')
lines.append('  const primaryCat = product.categories?.[0];')
lines.append('  return products')
lines.append('    .filter((p) => p.slug !== productSlug && p.categories?.includes(primaryCat))')
lines.append('    .slice(0, limit);')
lines.append('}')
lines.append('')
lines.append('export function getAllCategories() {')
lines.append('  const cats = new Set();')
lines.append('  products.forEach(p => {')
lines.append('    if (p.categories) p.categories.forEach(c => cats.add(c));')
lines.append('  });')
lines.append('  return Array.from(cats);')
lines.append('}')
lines.append('')
lines.append('export function getAllSubcategories(categorySlug) {')
lines.append('  const subcats = new Set();')
lines.append('  products')
lines.append('    .filter(p => p.categories && p.categories.includes(categorySlug))')
lines.append('    .forEach(p => {')
lines.append('      if (p.subcategories) p.subcategories.forEach(s => subcats.add(s));')
lines.append('    });')
lines.append('  return Array.from(subcats);')
lines.append('}')
lines.append('')
lines.append('export function getProductBySlug(slug) {')
lines.append('  return products.find((p) => p.slug === slug);')
lines.append('}')
lines.append('')

output = '\n'.join(lines)

with open('src/data/products.js', 'w', encoding='utf-8') as f:
    f.write(output)

print(f'Successfully wrote src/data/products.js')
