document.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('expLightbox');
  const inner = document.getElementById('expLightboxInner');
  const closeBtn = document.getElementById('expLightboxClose');
  if (!box || !inner) return;

  function openItem(src, type) {
    inner.innerHTML = '';
    if (type === 'video') {
      const v = document.createElement('video');
      v.src = src;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      inner.appendChild(v);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Safari gallery';
      inner.appendChild(img);
    }
    box.hidden = false;
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    inner.innerHTML = '';
    box.classList.remove('open');
    box.hidden = true;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('#experienceGallery .gallery-item').forEach((btn) => {
    btn.addEventListener('click', () => openItem(btn.getAttribute('data-src'), btn.getAttribute('data-type')));
  });
  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });
  box.addEventListener('click', (e) => {
    if (e.target === box) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
});
