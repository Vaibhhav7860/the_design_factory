"""
Comprehensive analysis of current product categorization vs. what it should be.
Outputs:
1. Products currently miscategorized
2. Products missing from subcategories they should be in
3. Products appearing in irrelevant subcategories
"""
import csv
import json
import re

# ─── Load current products.js data ───────────────────────────────────────────
with open('processed_products.json', 'r', encoding='utf-8') as f:
    current_products = json.load(f)

# Build lookup by handle/slug
current_by_slug = {}
for p in current_products:
    current_by_slug[p.get('slug') or p.get('handle')] = p

# ─── Load CSV data ───────────────────────────────────────────────────────────
handle_data = {}
with open('products_export_1.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        handle = row['Handle']
        if handle not in handle_data:
            title = row['Title'].strip() if row['Title'] else ''
            tags = row['Tags'].strip() if row['Tags'] else ''
            if title:
                handle_data[handle] = {'title': title, 'tags': tags}

# ─── Print current category assignments ──────────────────────────────────────
print("=" * 100)
print("CURRENT CATEGORIZATION ANALYSIS")
print("=" * 100)

# Group products by their current categories/subcategories
from collections import defaultdict

cat_subcat_products = defaultdict(lambda: defaultdict(list))
for p in current_products:
    cats = p.get('categories', [])
    subcats = p.get('subcategories', [])
    # Old format compatibility
    if not cats and p.get('category'):
        cats = [p['category']]
    if not subcats and p.get('subcategory'):
        subcats = [p['subcategory']]
    
    for cat in cats:
        for subcat in subcats:
            cat_subcat_products[cat][subcat].append(p['title'])

print("\nCurrent distribution:")
for cat in sorted(cat_subcat_products.keys()):
    print(f"\n{'─' * 80}")
    print(f"CATEGORY: {cat}")
    for subcat in sorted(cat_subcat_products[cat].keys()):
        prods = cat_subcat_products[cat][subcat]
        print(f"  └─ {subcat}: {len(prods)} products")
        for title in sorted(prods)[:5]:
            print(f"       • {title}")
        if len(prods) > 5:
            print(f"       ... and {len(prods) - 5} more")

# ─── Identify problem areas ─────────────────────────────────────────────────

print("\n\n" + "=" * 100)
print("PROBLEM IDENTIFICATION")
print("=" * 100)

# 1. Swim bags categorized under "organisers > utility-pouches" instead of "bags > swimming-bags"
print("\n--- SWIM BAGS incorrectly in organisers/utility-pouches ---")
for p in current_products:
    if 'swim' in p['title'].lower():
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 2. Products with "set" or "combo" in the name
print("\n--- Products with 'set' in title (check combo categorization) ---")
for p in current_products:
    t = p['title'].lower()
    if 'set' in t or 'combo' in t:
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 3. Jelly bags categorized
print("\n--- JELLY BAGS categorization ---")
for p in current_products:
    if 'jelly' in p['title'].lower():
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 4. Meal planner / weekly planner (should be decor-dining or play-learn, not kids-accessories)
print("\n--- PLANNERS categorization ---")
for p in current_products:
    if 'planner' in p['title'].lower():
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 5. Felt hangings
print("\n--- FELT HANGINGS / BUNTINGS categorization ---")
for p in current_products:
    t = p['title'].lower()
    if 'felt' in t or 'bunting' in t or 'hanging' in t or 'ornament' in t:
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 6. Travel set products
print("\n--- TRAVEL SET products ---")
for p in current_products:
    if 'travel' in p['title'].lower():
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 7. Vanity products
print("\n--- VANITY products ---")
for p in current_products:
    if 'vanity' in p['title'].lower():
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 8. Towel products
print("\n--- TOWEL products ---")
for p in current_products:
    if 'towel' in p['title'].lower():
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 9. Money envelopes
print("\n--- MONEY ENVELOPE products ---")
for p in current_products:
    if 'envelope' in p['title'].lower():
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 10. Gift tags (flat vs 3D vs hanging)
print("\n--- GIFT TAG / NOTECARD products ---")
for p in current_products:
    t = p['title'].lower()
    if 'gift tag' in t or 'gifttag' in t or 'notecard' in t or 'note card' in t:
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 11. Bag Tags
print("\n--- BAG TAG products ---")
for p in current_products:
    t = p['title'].lower()
    if 'bag tag' in t or 'bagtag' in t:
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 12. Neck Pillow products
print("\n--- NECK PILLOW products ---")
for p in current_products:
    t = p['title'].lower()
    if 'neck pillow' in t or 'travel pillow' in t or 'pillow' in t:
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 13. Cap products
print("\n--- CAP products ---")
for p in current_products:
    t = p['title'].lower()
    if t.startswith('cap ') or 'cap -' in t or t == 'cap':
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 14. Apron products
print("\n--- APRON products ---")
for p in current_products:
    if 'apron' in p['title'].lower():
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 15. Storage basket
print("\n--- STORAGE BASKET products ---")
for p in current_products:
    if 'storage' in p['title'].lower() or 'basket' in p['title'].lower():
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 16. Reward charts
print("\n--- REWARD CHART / RESPONSIBILITY CHART products ---")
for p in current_products:
    t = p['title'].lower()
    if 'reward' in t or 'responsibility' in t or 'responsibilty' in t or 'daily check' in t:
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 17. Uncategorized products
print("\n--- UNCATEGORIZED products ---")
for p in current_products:
    cats = p.get('categories', [p.get('category', '')])
    if not cats or cats == ['uncategorized'] or p.get('category') == 'uncategorized':
        print(f"  {p['title']}")

# 18. School Bag products
print("\n--- SCHOOL BAG products ---")
for p in current_products:
    t = p['title'].lower()
    if 'school bag' in t:
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 19. Back to school / label set
print("\n--- BACK TO SCHOOL / LABEL SET products ---")
for p in current_products:
    t = p['title'].lower()
    if 'back to school' in t or 'label set' in t or 'school set' in t:
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 20. Gift hamper / stationery set
print("\n--- GIFT HAMPER / STATIONERY SET products ---")
for p in current_products:
    t = p['title'].lower()
    if 'hamper' in t or 'gift stationery' in t:
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")

# 21. Adult products
print("\n--- ADULT-specific products ---")
for p in current_products:
    t = p['title'].lower()
    if 'adult' in t or 'grown up' in t or 'grownup' in t:
        cats = p.get('categories', [p.get('category', '')])
        subcats = p.get('subcategories', [p.get('subcategory', '')])
        print(f"  {p['title']}: categories={cats}, subcategories={subcats}")
