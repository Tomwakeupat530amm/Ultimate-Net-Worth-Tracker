import os
import re

directory = r"c:\Users\minhn\OneDrive\Desktop\Ultimate Excel Net Worth Tracker\net-worth-tracker-web\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find .toLocaleString() and replace with .toLocaleString('en-US')
    new_content = re.sub(r'\.toLocaleString\(\s*\)', ".toLocaleString('en-US')", content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
