"""
Generates src/data/products.js from processed_products.json
"""
import json

with open('processed_products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

lines = []
lines.append('// Auto-generated from processed_products.json')
lines.append(f'// Total products: {len(products)}')
lines.append('')
lines.append('export const products = [')

for i, p in enumerate(products):
    comma = '' if i == len(products) - 1 else ','
    # Escape backtick/dollar signs for safety in JSON serialization
    entry = json.dumps(p, ensure_ascii=False, indent=2)
    lines.append(f'  {entry}{comma}')

lines.append('];')
lines.append('')
lines.append('export function getProductBySlug(slug) {')
lines.append('  return products.find((p) => p.slug === slug);')
lines.append('}')
lines.append('')
lines.append('export function getProductsByCollection(collection) {')
lines.append('  return products.filter((p) => p.collection === collection);')
lines.append('}')
lines.append('')
lines.append('export function getProductsByCategory(categorySlug) {')
lines.append('  return products.filter((p) => p.category === categorySlug);')
lines.append('}')
lines.append('')
lines.append('export function getProductsBySubcategory(categorySlug, subcategorySlug) {')
lines.append('  return products.filter(')
lines.append('    (p) => p.category === categorySlug && p.subcategory === subcategorySlug')
lines.append('  );')
lines.append('}')
lines.append('')
lines.append('export function getRelatedProducts(productSlug, limit = 4) {')
lines.append('  const product = products.find((p) => p.slug === productSlug);')
lines.append('  if (!product) return [];')
lines.append('  return products')
lines.append('    .filter((p) => p.slug !== productSlug && p.category === product.category)')
lines.append('    .slice(0, limit);')
lines.append('}')
lines.append('')
lines.append('export function getAllCategories() {')
lines.append('  const categories = new Set();')
lines.append('  products.forEach(p => categories.add(p.category));')
lines.append('  return Array.from(categories);')
lines.append('}')
lines.append('')
lines.append('export function getAllSubcategories(categorySlug) {')
lines.append('  const subcategories = new Set();')
lines.append('  products')
lines.append('    .filter(p => p.category === categorySlug)')
lines.append('    .forEach(p => subcategories.add(p.subcategory));')
lines.append('  return Array.from(subcategories);')
lines.append('}')
lines.append('')

output = '\n'.join(lines)

with open('src/data/products.js', 'w', encoding='utf-8') as f:
    f.write(output)

print(f'Written src/data/products.js ({len(products)} products, {len(output)} bytes)')
