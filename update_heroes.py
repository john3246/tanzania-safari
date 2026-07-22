import os
import re
import glob

views_dir = 'C:/Users/john/tanzania_safari/views'
files = glob.glob(os.path.join(views_dir, '*.html'))

slideshow_html = '''
  <div class="hero-slideshow">
    <div class="hero-slide active" style="background-image: url('/images/optimized/mount-kilimanjaro-national-park.webp');">
      <span class="hero-hook-word">Kilimanjaro</span>
    </div>
    <div class="hero-slide" style="background-image: url('/images/optimized/wamasai.webp');">
      <span class="hero-hook-word">Culture</span>
    </div>
    <div class="hero-slide" style="background-image: url('/images/optimized/balloon.webp');">
      <span class="hero-hook-word">Adventure</span>
    </div>
    <div class="hero-slide" style="background-image: url('/images/optimized/mbugani.webp');">
      <span class="hero-hook-word">Wildlife</span>
    </div>
  </div>
'''

for file in files:
    if file.endswith('index.html') or file.endswith('404.html'):
        continue
        
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace everything between <section class="page-hero"> and <div class="page-hero-content">
    # Note: safaris.html might have style tags before it, or other things.
    pattern = re.compile(r'(<section class="page-hero"[^>]*>)\s*.*?(<div class="page-hero-content")', re.DOTALL)
    
    if pattern.search(content):
        new_content = pattern.sub(r'\1' + slideshow_html + r'\2', content)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
