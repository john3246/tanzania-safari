async function loadPost() {
    const slug = window.location.pathname.split('/').pop();
    const container = document.getElementById('postContainer');
    
    try {
        const { data } = await API.get('/blog/' + slug);
        if (!data) {
            container.innerHTML = '<h2 class="text-center">Post not found</h2>';
            return;
        }

        document.title = `${data.post_title} | Tanzania Safari Blog`;
        if (window.SafariSEO) {
            SafariSEO.applyPageSeo({
                title: `${data.post_title} | Tanzania Safari Magic Blog`.slice(0, 70),
                description: (data.excerpt || data.meta_description || data.post_content || '')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .slice(0, 160),
                image: data.featured_image_url
            });
        } else {
            let meta = document.querySelector('meta[name="description"]');
            if (meta && data.excerpt) meta.setAttribute('content', data.excerpt.slice(0, 160));
        }
        container.innerHTML = `
            <div class="post-header">
                <span class="post-category">${data.category_name || 'Safari Guide'}</span>
                <h1 class="post-title">${data.post_title}</h1>
                <div class="post-meta">
                    <span><i class="far fa-calendar"></i> ${fmtDate(data.published_at)}</span>
                    <span><i class="far fa-user"></i> By ${data.author_name || 'Admin'}</span>
                    <span><i class="far fa-eye"></i> ${data.views_count || 0} views</span>
                </div>
            </div>
            
            <div class="post-featured-img">
                <img src="${imgSrc(data.featured_image_url, '/images/blog-placeholder.jpg')}" alt="${data.post_title}" loading="lazy" decoding="async">
            </div>
            
            <div class="post-content">
                ${data.post_content}
            </div>
            
            <div class="post-footer">
                <div class="post-tags">
                    <!-- Tags could go here -->
                </div>
                <div class="post-share">
                    <a href="#" class="share-btn"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" class="share-btn"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="share-btn"><i class="fab fa-whatsapp"></i></a>
                </div>
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<h2 class="text-center">Error loading post</h2>';
    }
}

function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function imgSrc(src, fallback = '/images/optimized/balloon.webp') {
    if (!src) return fallback;
    if (src.startsWith('http')) return src;
    return src.startsWith('/') ? src : '/' + src;
}

loadPost();
