#!/usr/bin/env python3
"""Dependency-free smoke check for the Prism Travels static website."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

root=Path(__file__).resolve().parents[1]
pages=sorted(root.glob('*.html'))
failures=[]

class Scanner(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.local_paths=set(); self.h1=0; self.title=False
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if tag=='h1': self.h1+=1
        if tag=='title': self.title=True
        for att in ('href','src'):
            val=d.get(att,'')
            if not val or val.startswith(('#','//','mailto:','tel:','data:')):continue
            parts=urlsplit(val)
            if parts.scheme or parts.netloc:continue
            self.local_paths.add((val,parts.path))

for page in pages:
    scan=Scanner();scan.feed(page.read_text(encoding='utf-8'))
    if scan.h1!=1:failures.append(f'{page.name}: expected 1 h1, got {scan.h1}')
    if not scan.title:failures.append(f'{page.name}: missing title')
    for raw,rel in scan.local_paths:
        f=root/rel
        if not f.exists():failures.append(f'{page.name}: missing local link or asset: {raw}')

for rel in ['css/styles.css','js/site.js','assets/prism-symbol.png','assets/favicon.png','assets/landscape-fallback.svg','robots.txt']:
    if not (root/rel).exists():failures.append(f'Missing required file: {rel}')
if failures:
    print('FAIL:');print('\n'.join(' - '+x for x in failures))
    raise SystemExit(1)
print(f'PASS: {len(pages)} HTML pages; local links/assets found; 1 page heading and title each.')
