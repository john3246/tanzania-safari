import os
import re

file = 'C:/Users/john/tanzania_safari/views/safari-detail.html'
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

with open(file, 'r', encoding='utf-8') as f:
    content = f.read()
    
# Replace everything between <div id="safariHero"...> and <div class="page-hero-content">
pattern = re.compile(r'(<div id="safariHero"[^>]*>)\s*.*?(<div class="page-hero-content")', re.DOTALL)

if pattern.search(content):
    new_content = pattern.sub(r'\1' + slideshow_html + r'\2', content)
    with open(file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updated {file}")
