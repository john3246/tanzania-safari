async function loadBlog() {
    const container = document.getElementById('blogContainer');
    try {
        const { data } = await API.get('/blog');
        if (!data || data.length === 0) {
            container.innerHTML = '<p class="text-center" style="padding:4rem;color:var(--text-muted)">No blog posts yet. Stay tuned!</p>';
            return;
        }

        const featured = data[0];
        const rest = data.slice(1);

        let html = `
        <div class="featured-post">
            <div class="featured-post-img">
                <img src="${imgSrc(featured.featured_image_url, '/images/blog-placeholder.jpg')}" alt="${featured.post_title}" loading="lazy" decoding="async">
            </div>
            <div class="featured-post-body">
                <span class="featured-badge">Featured Post</span>
                <h2 class="post-title" style="font-size:2rem;margin-bottom:1rem">${featured.post_title}</h2>
                <p class="blog-card-excerpt">${featured.post_excerpt}</p>
                <div class="blog-card-meta">
                    <span><i class="far fa-calendar"></i> ${fmtDate(featured.published_at)}</span>
                    <span><i class="far fa-user"></i> ${featured.author_name || 'Admin'}</span>
                </div>
                <a href="/blog/${featured.post_slug}" class="btn btn-primary" style="margin-top:1.5rem">Read Full Story</a>
            </div>
        </div>
        <div class="blog-grid">
            ${rest.map(post => `
                <div class="blog-card">
                    <div class="blog-card-img">
                        <img src="${imgSrc(post.featured_image_url, '/images/blog-placeholder.jpg')}" alt="${post.post_title}" loading="lazy" decoding="async">
                    </div>
                    <div class="blog-card-body">
                        <div class="blog-card-meta">
                            <span>${fmtDate(post.published_at)}</span>
                            <span>${post.category_name || 'Safari'}</span>
                        </div>
                        <h3 class="blog-card-title">${post.post_title}</h3>
                        <p class="blog-card-excerpt">${post.post_excerpt}</p>
                        <a href="/blog/${post.post_slug}" class="blog-card-link">Read More <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            `).join('')}
        </div>
        `;
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<p class="text-center" style="padding:4rem;color:var(--error)">Failed to load blog posts. Please try again later.</p>';
    }
}

function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function imgSrc(src, fallback = '/images/placeholder.jpeg') {
    if (!src) return fallback;
    if (src.startsWith('http')) return src;
    return src.startsWith('/') ? src : '/' + src;
}

loadBlog();
