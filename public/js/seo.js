/**
 * Site-wide SEO helpers — meta tags, Open Graph, Twitter, JSON-LD, canonical.
 * Safe to call multiple times; updates existing tags instead of duplicating.
 */
(function (global) {
    const SITE_NAME = 'Tanzania Safari Magic';
    const DEFAULT_DESC =
        'Experience authentic Tanzania safari tours. Witness the Great Migration, climb Kilimanjaro, and explore pristine national parks with expert local guides.';
    const DEFAULT_IMAGE = '/images/hero.jpg';
    const SITE_URL = (typeof window !== 'undefined' && window.location.origin)
        ? window.location.origin
        : 'https://tanzaniasafarimagic.com';

    function upsertMeta(attr, key, content) {
        if (!content) return;
        let el = document.head.querySelector(`meta[${attr}="${key}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, key);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    }

    function upsertLink(rel, href) {
        if (!href) return;
        let el = document.head.querySelector(`link[rel="${rel}"]`);
        if (!el) {
            el = document.createElement('link');
            el.setAttribute('rel', rel);
            document.head.appendChild(el);
        }
        el.setAttribute('href', href);
    }

    function absoluteUrl(pathOrUrl) {
        if (!pathOrUrl) return SITE_URL + DEFAULT_IMAGE;
        if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
        return SITE_URL + (pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl);
    }

    function setJsonLd(id, data) {
        let script = document.getElementById(id);
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = id;
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(data);
    }

    function applySEO(options = {}) {
        const title = options.title || document.title || SITE_NAME;
        const description = options.description
            || (document.querySelector('meta[name="description"]') || {}).content
            || DEFAULT_DESC;
        const image = absoluteUrl(options.image || DEFAULT_IMAGE);
        const url = options.url || window.location.href.split('?')[0].split('#')[0];
        const type = options.type || 'website';
        const keywords = options.keywords
            || 'Tanzania safari, Serengeti, Kilimanjaro, Ngorongoro, African safari tours, wildlife safari, Zanzibar';

        document.title = title;

        upsertMeta('name', 'description', description);
        upsertMeta('name', 'keywords', keywords);
        upsertMeta('name', 'robots', options.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
        upsertMeta('name', 'author', SITE_NAME);
        upsertMeta('name', 'theme-color', '#263E22');

        upsertLink('canonical', url);

        upsertMeta('property', 'og:site_name', SITE_NAME);
        upsertMeta('property', 'og:title', title);
        upsertMeta('property', 'og:description', description);
        upsertMeta('property', 'og:url', url);
        upsertMeta('property', 'og:type', type);
        upsertMeta('property', 'og:image', image);
        upsertMeta('property', 'og:locale', 'en_US');

        upsertMeta('name', 'twitter:card', 'summary_large_image');
        upsertMeta('name', 'twitter:title', title);
        upsertMeta('name', 'twitter:description', description);
        upsertMeta('name', 'twitter:image', image);

        if (options.jsonLd) {
            setJsonLd('seo-jsonld-page', options.jsonLd);
        }
    }

    function injectOrganizationSchema() {
        setJsonLd('seo-jsonld-org', {
            '@context': 'https://schema.org',
            '@type': ['TravelAgency', 'TouristInformationCenter'],
            name: SITE_NAME,
            url: SITE_URL,
            logo: absoluteUrl('/images/logo.png'),
            image: absoluteUrl(DEFAULT_IMAGE),
            description: DEFAULT_DESC,
            email: 'info@tanzaniasafarimagic.com',
            telephone: '+255695108009',
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Arusha',
                addressCountry: 'TZ'
            },
            sameAs: [
                'https://facebook.com/tanzaniasafarimagic',
                'https://instagram.com/tanzaniasafarimagic',
                'https://twitter.com/tanzaniasafarimagic',
                'https://youtube.com/tanzaniasafarimagic'
            ],
            areaServed: {
                '@type': 'Country',
                name: 'Tanzania'
            },
            priceRange: '$$'
        });

        setJsonLd('seo-jsonld-website', {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
            potentialAction: {
                '@type': 'SearchAction',
                target: SITE_URL + '/safaris?q={search_term_string}',
                'query-input': 'required name=search_term_string'
            }
        });
    }

    function tourProductSchema(tour) {
        if (!tour) return null;
        return {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: tour.name || tour.package_name,
            description: tour.description || tour.short_description || tour.package_description,
            image: absoluteUrl(tour.image || tour.featured_image_url || tour.image_url || DEFAULT_IMAGE),
            url: window.location.href.split('?')[0],
            brand: { '@type': 'Brand', name: SITE_NAME },
            offers: tour.price || tour.price_usd ? {
                '@type': 'Offer',
                priceCurrency: 'USD',
                price: String(tour.price || tour.price_usd),
                availability: 'https://schema.org/InStock',
                url: window.location.href.split('?')[0]
            } : undefined
        };
    }

    function articleSchema(post) {
        if (!post) return null;
        return {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.post_title || post.title,
            description: post.post_excerpt || post.meta_description || post.description,
            image: absoluteUrl(post.featured_image_url || post.image || DEFAULT_IMAGE),
            datePublished: post.published_at || post.created_at,
            dateModified: post.updated_at || post.published_at || post.created_at,
            author: {
                '@type': 'Person',
                name: post.author_name || SITE_NAME
            },
            publisher: {
                '@type': 'Organization',
                name: SITE_NAME,
                logo: { '@type': 'ImageObject', url: absoluteUrl('/images/logo.png') }
            },
            mainEntityOfPage: window.location.href.split('?')[0]
        };
    }

    function placeSchema(dest) {
        if (!dest) return null;
        return {
            '@context': 'https://schema.org',
            '@type': 'TouristAttraction',
            name: dest.name || dest.park_name,
            description: dest.description || dest.short_description || dest.seo_description,
            image: absoluteUrl(dest.image || dest.featured_image_url || DEFAULT_IMAGE),
            url: window.location.href.split('?')[0],
            address: {
                '@type': 'PostalAddress',
                addressCountry: 'TZ',
                addressRegion: dest.region || 'Tanzania'
            }
        };
    }

    global.SafariSEO = {
        apply: applySEO,
        injectOrganizationSchema,
        tourProductSchema,
        articleSchema,
        placeSchema,
        absoluteUrl,
        SITE_NAME,
        DEFAULT_DESC
    };
})(typeof window !== 'undefined' ? window : globalThis);
