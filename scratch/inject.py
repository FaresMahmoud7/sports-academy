import os
import re

img_dir = r'e:\Champions Acdeamy\public\image'
files = [f for f in os.listdir(img_dir) if f.endswith('.jpeg') or f.endswith('.jpg')]

gallery_items = []
for idx, f in enumerate(files):
    url = f'/image/{f}'
    gallery_items.append(f"{{ _id: '{idx+1}', imageUrl: '{url}', caption: 'جانب من فعاليات أكاديمية الأبطال' }}")

array_str = '[\n    ' + ',\n    '.join(gallery_items) + '\n  ]'

filepath = r'e:\Champions Acdeamy\src\app\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'const \[gallery, setGallery\] = useState<GalleryItem\[\]>\(\[\]\);',
    f'const [gallery, setGallery] = useState<GalleryItem[]>({array_str});',
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Injected {len(files)} images into gallery state')
