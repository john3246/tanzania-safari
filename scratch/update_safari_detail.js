const fs = require('fs');

let html = fs.readFileSync('views/safari-detail.html', 'utf8');

// 1. Update fonts
html = html.replace(
  '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">',
  '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">'
);

// 2. Replace CSS block
const newCss = `<style>
.detail-layout { display: grid; grid-template-columns: repeat(12, 1fr); gap: 3rem; align-items: start; }
@media(max-width:1024px) { .detail-layout { grid-template-columns: 1fr; gap: 2rem; } }
.layout-main { grid-column: span 8; }
.layout-sidebar { grid-column: span 4; }
@media(max-width:1024px) { .layout-main, .layout-sidebar { grid-column: span 1; } }

.gallery { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 2.5rem; }
.gallery-main { grid-column: span 4; height: 480px; border-radius: 16px; overflow: hidden; position: relative; cursor: pointer; box-shadow: var(--shadow-sm); transition: transform 0.3s; }
.gallery-main:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.gallery-main img { width: 100%; height: 100%; object-fit: cover; }
.gallery-thumbs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; grid-column: span 4; }
.gallery-thumb { height: 100px; border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.3s ease; opacity: 0.8; }
.gallery-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.gallery-thumb:hover { opacity: 1; transform: translateY(-2px); box-shadow: var(--shadow-sm); }
.gallery-thumb.active { opacity: 1; outline: 3px solid var(--primary); outline-offset: -3px; }

.detail-card { background: #fff; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border: 1px solid var(--border-light); position: sticky; top: 120px; z-index: 10; }
.price-display { text-align: center; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); margin-bottom: 1.5rem; }
.price-from { font-size: 0.875rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
.price-amount { font-size: 3rem; font-weight: 800; color: var(--primary); font-family: var(--font-heading); line-height: 1.1; margin: 0.5rem 0; }
.price-per { font-size: 0.875rem; color: var(--text-muted); }
.detail-meta { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
.detail-meta-row { display: flex; align-items: center; justify-content: space-between; font-size: 0.95rem; }
.detail-meta-label { color: var(--text-muted); display: flex; align-items: center; gap: 0.75rem; }
.detail-meta-label i { color: var(--primary); width: 16px; text-align: center; font-size: 1.1rem; }
.detail-meta-value { font-weight: 600; color: var(--earth-dark); }

.tab-nav { display: flex; border-bottom: 2px solid var(--border-light); margin-bottom: 2.5rem; gap: 1rem; overflow-x: auto; scrollbar-width: none; }
.tab-nav::-webkit-scrollbar { display: none; }
.tab-btn { padding: 1rem 0; font-weight: 600; font-size: 1.05rem; color: var(--text-muted); border: none; background: none; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; white-space: nowrap; transition: var(--transition); font-family: var(--font-heading); }
.tab-btn:hover { color: var(--text-primary); }
.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }
.tab-panel { display: none; animation: fadeIn 0.4s ease; }
.tab-panel.active { display: block; }

.itinerary-timeline { position: relative; padding-left: 2rem; margin-top: 1rem; }
.itinerary-timeline::before { content: ''; position: absolute; left: 7px; top: 0; bottom: 0; width: 2px; background: var(--border-light); }
.itinerary-item { position: relative; margin-bottom: 2rem; background: #fff; padding: 1.5rem 2rem; border-radius: 12px; border: 1px solid var(--border-light); box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: var(--transition); }
.itinerary-item:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.08); border-color: var(--primary-pale); transform: translateY(-3px); }
.itinerary-item::after { content: ''; position: absolute; left: -2.35rem; top: 2rem; width: 16px; height: 16px; background: #fff; border: 3px solid var(--primary); border-radius: 50%; box-shadow: 0 0 0 4px rgba(13, 71, 161, 0.1); }
.itinerary-day { font-size: 0.85rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 0.5rem; display: flex; align-items: center; }
.itinerary-title { font-size: 1.2rem; font-weight: 700; color: var(--earth-dark); margin-bottom: 0.75rem; font-family: var(--font-heading); }
.itinerary-desc { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 1rem; }
.itinerary-meta { display: flex; gap: 1.5rem; flex-wrap: wrap; font-size: 0.875rem; color: var(--text-muted); border-top: 1px solid var(--border-light); padding-top: 1rem; }
.itinerary-meta span i { color: var(--primary); margin-right: 6px; }

.inc-exc { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; }
@media(max-width:768px) { .inc-exc { grid-template-columns: 1fr; gap: 1.5rem; } }
.inc-list li, .exc-list li { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem 0; font-size: 0.95rem; color: var(--text-secondary); border-bottom: 1px solid var(--border-light); }
.inc-list li:last-child, .exc-list li:last-child { border-bottom: none; }
.inc-list li i { color: var(--success); flex-shrink: 0; margin-top: 4px; font-size: 1.1rem; }
.exc-list li i { color: var(--error); flex-shrink: 0; margin-top: 4px; font-size: 1.1rem; }
.inc-exc h3 { font-family: var(--font-heading); font-size: 1.25rem; }

.review-card { background: #fff; border-radius: 16px; padding: 1.5rem 2rem; margin-bottom: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid var(--border-light); transition: var(--transition); }
.review-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }

.lightbox { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
.lightbox.active { display: flex; animation: fadeIn 0.3s; }
.lightbox img { max-width: 90%; max-height: 90vh; object-fit: contain; border-radius: 8px; }
.lightbox-close { position: fixed; top: 1.5rem; right: 1.5rem; background: rgba(255,255,255,0.1); border: none; color: #fff; font-size: 1.5rem; width: 48px; height: 48px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
.lightbox-close:hover { background: var(--primary); transform: rotate(90deg); }

/* Hero Overlay Gradient */
.hero-overlay { background: linear-gradient(to bottom, rgba(13, 71, 161, 0.5) 0%, rgba(13, 71, 161, 0.2) 50%, rgba(0,0,0,0.9) 100%); }
.page-hero { height: 500px; }
.page-hero-title { font-size: clamp(2.5rem, 5vw, 4rem); font-family: var(--font-heading); text-shadow: 0 4px 20px rgba(0,0,0,0.5); }
.page-hero-breadcrumb { font-size: 0.95rem; font-weight: 500; letter-spacing: 0.5px; }

/* Badges & Trust */
.trust-badges { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 2rem; padding: 1.25rem; background: var(--bg-primary); border-radius: 12px; font-size: 0.85rem; color: var(--text-secondary); }
.trust-badge-item { display: flex; align-items: center; gap: 0.75rem; }
.trust-badge-item i { color: var(--primary); font-size: 1.1rem; width: 20px; text-align: center; }

/* Mobile Sticky Booking */
.mobile-sticky-booking { display: none; }
@media(max-width: 768px) {
  .mobile-sticky-booking { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: #fff; padding: 1rem 1.5rem; box-shadow: 0 -5px 20px rgba(0,0,0,0.1); z-index: 100; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-light); }
  .mobile-sticky-booking .price { font-size: 1.25rem; font-weight: 800; color: var(--primary); }
  .mobile-sticky-booking .btn { padding: 0.75rem 1.5rem; }
  .detail-card .btn-primary { display: none; } /* Hide main CTA on mobile to prefer sticky */
}
</style>`;

html = html.replace(/<style>[\s\S]*?<\/style>/, newCss);

// 3. Update structure inside detailContent
const oldDetailLayout = \`<div class="detail-layout">
        <!-- Main content -->
        <div>
          <div class="tab-nav">\`;

const newDetailLayout = \`<div class="detail-layout">
        <!-- Main content -->
        <div class="layout-main">
          <div class="gallery" id="gallery"></div>
          
          <div class="tab-nav">\`;

html = html.replace(oldDetailLayout, newDetailLayout);

// Move gallery inside layout-main
html = html.replace(\`<div class="gallery" id="gallery"></div>
      <div class="detail-layout">\`, \`<div class="detail-layout">\`);

// Update the booking card class
html = html.replace(\`<!-- Booking card -->
        <div class="detail-card">\`, \`<!-- Booking card -->
        <div class="layout-sidebar">
          <div class="detail-card">\`);

// Close layout-sidebar div and add mobile sticky
html = html.replace(\`</div>
      </div>
    </div>
    <div id="notFound"\`, \`</div>
        </div>
      </div>
      
      <!-- Mobile Sticky Booking CTA -->
      <div class="mobile-sticky-booking" id="mobileStickyBooking" style="display:none;">
        <div>
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">From</div>
          <div class="price" id="mobilePrice">$0</div>
        </div>
        <a href="/booking" id="mobileBookBtn" class="btn btn-primary">Book Now</a>
      </div>

    </div>
    <div id="notFound"\`);

// Add trust badges below Ask a Question button
const oldAskBtn = \`<a href="/contact" class="btn btn-outline btn-block"><i class="fas fa-comments"></i> Ask a Question</a>
          <div style="margin-top:1.5rem;padding:1rem;background:var(--bg-secondary);border-radius:var(--radius-md);font-size:.8125rem;color:var(--text-muted);text-align:center">
            <i class="fas fa-lock" style="color:var(--primary)"></i> Secure booking · Free cancellation available
          </div>\`;

const newAskBtn = \`<a href="/contact" class="btn btn-outline btn-block"><i class="fas fa-comments"></i> Ask a Question</a>
          <div class="trust-badges">
            <div class="trust-badge-item"><i class="fas fa-lock"></i> Secure SSL Booking</div>
            <div class="trust-badge-item"><i class="fas fa-calendar-check"></i> Free Cancellation Available</div>
            <div class="trust-badge-item"><i class="fas fa-star"></i> Verified Operator</div>
          </div>\`;

html = html.replace(oldAskBtn, newAskBtn);

fs.writeFileSync('views/safari-detail.html', html, 'utf8');
console.log('Updated safari-detail.html');
