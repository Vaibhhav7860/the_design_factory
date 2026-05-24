import json
with open('processed_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Ensure no products are uncategorized
uncat = [p for p in products if 'uncategorized' in p['categories']]
print(f"Uncategorized products: {len(uncat)}")
if uncat:
    for p in uncat[:10]:
        print(" -", p['title'])

# Look for products that might be heavily duplicated (in 5+ subcategories)
heavy = [p for p in products if len(p['subcategories']) >= 4]
print(f"\nProducts in 4+ subcategories: {len(heavy)}")
for p in heavy[:10]:
    print(" -", p['title'], "->", p['subcategories'])

# Let's check "Swim Bag"
swimbags = [p for p in products if 'swim' in p['title'].lower()]
print(f"\nSwim Bags ({len(swimbags)}):")
for p in swimbags[:5]:
    print(" -", p['title'], "->", p['categories'], p['subcategories'])

# Let's check "Dinosaur"
dinos = [p for p in products if 'dinosaur' in p['title'].lower()]
print(f"\nDinosaur products ({len(dinos)}):")
for p in dinos[:5]:
    print(" -", p['title'], "->", p['categories'], p['subcategories'])
