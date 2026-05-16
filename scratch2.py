import os
path = r"c:\Users\Lenovo\OneDrive\Desktop\the_design_factory\shopify migration - Copy\mockup.html"
with open(path, "rb") as f:
    content = f.read().decode('utf-16', errors='ignore') if b'\xff\xfe' in f.read(2) else f.read().decode('utf-8', errors='ignore')

f = open(path, "r", encoding="utf-8", errors="ignore")
content = f.read()

lines = content.splitlines()
for i, line in enumerate(lines):
    if "PREMIUM" in line.upper() or "QUALITY" in line.upper() or "WOMEN" in line.upper():
        print(f"Line {i}: {line.strip()}")
