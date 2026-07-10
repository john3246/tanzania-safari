const fs = require('fs');
let code = fs.readFileSync('public/js/safari-detail.js', 'utf8');

const newCode = `
async function loadSafariDetails(slug) {
    try {
        const result = await API.getPackageBySlug(slug);
        if (result && result.success && result.data) {
            currentSafari = result.data;
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('detailContent').style.display = 'block';
            renderSafariDetails(result.data);
            updatePageTitle(result.data.package_name);
            await loadRelatedSafaris(result.data.category_slug, result.data.package_id);
        } else {
            document.getElementById('loadingState').style.display = 'none';
            showError('Safari package not found');
        }
    } catch (error) {
        console.error('Error loading safari details:', error);
        document.getElementById('loadingState').innerHTML = '<p style="color:var(--error)">Failed to load details.</p>';
    }
}

function renderSafariDetails(safari) {
    const heroImg = document.getElementById('heroImg');
    if(heroImg) heroImg.src = imgSrc(safari.featured_image_url || safari.image_urls?.[0], '/images/placeholder.jpeg');
    
    const heroTitle = document.getElementById('heroTitle');
    if(heroTitle) heroTitle.textContent = safari.package_name;
    
    const breadcrumbName = document.getElementById('breadcrumbName');
    if(breadcrumbName) breadcrumbName.textContent = safari.package_name;
    
    const heroBadge = document.getElementById('heroBadge');
    if(heroBadge) {
        let badges = [];
        if(safari.is_featured) badges.push('<span class="badge" style="background:var(--accent);color:#fff"><i class="fas fa-star"></i> Featured</span>');
        badges.push('<span class="badge" style="background:var(--primary);color:#fff"><i class="fas fa-tag"></i> ' + escapeHtml(safari.category_name || 'Safari') + '</span>');
        heroBadge.innerHTML = badges.join(' ');
    }
    
    const packageDesc = document.getElementById('packageDescription');
    if(packageDesc) packageDesc.innerHTML = '<h2 style="font-family:var(--font-heading);margin-bottom:1rem">About this Safari</h2><p style="color:var(--text-secondary);line-height:1.7">' + escapeHtml(safari.detailed_description || safari.short_description || '') + '</p>';
    
    const packageHighlights = document.getElementById('packageHighlights');
    if(packageHighlights && safari.highlights) {
        let hl = Array.isArray(safari.highlights) ? safari.highlights : safari.highlights.split('\\n');
        packageHighlights.innerHTML = '<h3 style="font-family:var(--font-heading);margin:1.5rem 0 1rem 0;">Highlights</h3><ul style="list-style:none;padding:0">' + 
            hl.map(h => '<li style="margin-bottom:0.5rem;color:var(--earth-dark)"><i class="fas fa-check-circle" style="color:var(--primary);margin-right:0.5rem"></i>' + escapeHtml(h) + '</li>').join('') + '</ul>';
    }
    
    const packageDest = document.getElementById('packageDestinations');
    if(packageDest && safari.destinations && safari.destinations.length > 0) {
        packageDest.innerHTML = '<h3 style="font-family:var(--font-heading);margin-bottom:1rem;margin-top:2rem;">Destinations Visited</h3>' + 
            safari.destinations.map(d => '<span class="badge" style="background:var(--bg-secondary);color:var(--primary);padding:0.5rem 1rem;border-radius:20px;margin-right:0.5rem;font-size:0.9rem;display:inline-block;margin-bottom:0.5rem"><i class="fas fa-map-marker-alt" style="margin-right:0.5rem"></i>' + escapeHtml(d.park_name || d) + '</span>').join('');
    }
    
    const galleryEl = document.getElementById('gallery');
    if(galleryEl) galleryEl.innerHTML = buildGallery(safari.image_urls || [safari.featured_image_url]);
    
    const itineraryList = document.getElementById('itineraryList');
    if(itineraryList) itineraryList.innerHTML = renderItinerary(safari.itinerary);
    
    const includesList = document.getElementById('includesList');
    if(includesList) includesList.innerHTML = (safari.inclusions || []).map(i => '<li style="margin-bottom:0.75rem;display:flex;align-items:center;gap:0.75rem;color:var(--text-secondary)"><i class="fas fa-check" style="color:var(--success)"></i> ' + escapeHtml(i) + '</li>').join('');
    
    const excludesList = document.getElementById('excludesList');
    if(excludesList) excludesList.innerHTML = (safari.exclusions || []).map(i => '<li style="margin-bottom:0.75rem;display:flex;align-items:center;gap:0.75rem;color:var(--text-secondary)"><i class="fas fa-times" style="color:var(--error)"></i> ' + escapeHtml(i) + '</li>').join('');
    
    const reviewsList = document.getElementById('reviewsList');
    if(reviewsList) {
        if(safari.reviews && safari.reviews.length > 0) {
            reviewsList.innerHTML = safari.reviews.map(r => '<div style="background:#fff;border:1px solid var(--border-light);padding:1.5rem;border-radius:12px;margin-bottom:1rem"><div style="color:var(--warning);margin-bottom:0.5rem">' + Array(5).fill().map((_,i)=>'<i class="fas fa-star' + (i<r.rating?'':'-o') + '"></i>').join('') + '</div><h4 style="margin:0 0 0.5rem 0;color:var(--earth-dark)">' + escapeHtml(r.review_title || 'Great Safari') + '</h4><p style="color:var(--text-secondary);font-size:0.95rem">' + escapeHtml(r.comment) + '</p><div style="font-size:0.85rem;color:var(--text-muted);margin-top:1rem">' + escapeHtml(r.first_name) + ' - ' + new Date(r.created_at).toLocaleDateString() + '</div></div>').join('');
        } else {
            reviewsList.innerHTML = '<p style="color:var(--text-muted)">No reviews yet.</p>';
        }
    }
    
    renderCard(safari);
}
`;

const startIndex = code.indexOf('async function loadSafariDetails(slug) {');
const endIndex = code.indexOf('function renderItinerary(items) {');

if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + newCode + '\n' + code.substring(endIndex);
    fs.writeFileSync('public/js/safari-detail.js', code);
    console.log('Successfully updated safari-detail.js with heroBadge and highlights');
} else {
    console.log('Failed to find start or end index.', startIndex, endIndex);
}
