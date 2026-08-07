/**
 * Tanzania Safari Magic — Shared SEO helpers
 * Meta tags, JSON-LD schemas, FAQ blocks, thin-content noindex.
 */
(function (global) {
    const SITE = {
        name: 'Tanzania Safari Magic',
        url: 'https://tanzaniasafarimagic.com',
        phone: '+255695108009',
        email: 'info@tanzaniasafarimagic.com',
        logo: 'https://tanzaniasafarimagic.com/images/logo.png',
        defaultImage: 'https://tanzaniasafarimagic.com/images/hero.jpg',
        address: {
            street: 'Arusha',
            locality: 'Arusha',
            region: 'Arusha Region',
            country: 'TZ'
        },
        geo: { lat: -3.3869, lng: 36.6830 }
    };

    function ensureMeta(attr, key, content) {
        if (!content) return;
        let el = document.querySelector(`meta[${attr}="${key}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, key);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    }

    function ensureLink(rel, href) {
        let el = document.querySelector(`link[rel="${rel}"]`);
        if (!el) {
            el = document.createElement('link');
            el.setAttribute('rel', rel);
            document.head.appendChild(el);
        }
        el.setAttribute('href', href);
    }

    function setTitle(title) {
        document.title = title;
        ensureMeta('property', 'og:title', title);
        ensureMeta('name', 'twitter:title', title);
    }

    function setDescription(desc) {
        const clean = String(desc || '').replace(/\s+/g, ' ').trim().slice(0, 160);
        ensureMeta('name', 'description', clean);
        ensureMeta('property', 'og:description', clean);
        ensureMeta('name', 'twitter:description', clean);
        const metaDesc = document.getElementById('metaDesc');
        if (metaDesc) metaDesc.setAttribute('content', clean);
    }

    function setCanonical(url) {
        ensureLink('canonical', url || window.location.href.split('?')[0]);
    }

    function setRobots(content) {
        ensureMeta('name', 'robots', content);
    }

    function setNoIndexFollow() {
        setRobots('noindex, follow');
    }

    function setOgImage(url) {
        const abs = absoluteUrl(url || SITE.defaultImage);
        ensureMeta('property', 'og:image', abs);
        ensureMeta('name', 'twitter:image', abs);
        ensureMeta('name', 'twitter:card', 'summary_large_image');
    }

    function absoluteUrl(url) {
        if (!url) return SITE.defaultImage;
        if (url.startsWith('http')) return url;
        return SITE.url + (url.startsWith('/') ? url : '/' + url);
    }

    function injectJsonLd(id, data) {
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement('script');
            el.type = 'application/ld+json';
            el.id = id;
            document.head.appendChild(el);
        }
        el.textContent = JSON.stringify(data);
    }

    function localBusinessSchema() {
        return {
            '@context': 'https://schema.org',
            '@type': ['TravelAgency', 'TouristInformationCenter', 'LocalBusiness'],
            '@id': SITE.url + '/#organization',
            name: SITE.name,
            url: SITE.url,
            logo: SITE.logo,
            image: SITE.defaultImage,
            telephone: SITE.phone,
            email: SITE.email,
            address: {
                '@type': 'PostalAddress',
                streetAddress: SITE.address.street,
                addressLocality: SITE.address.locality,
                addressRegion: SITE.address.region,
                addressCountry: SITE.address.country
            },
            geo: {
                '@type': 'GeoCoordinates',
                latitude: SITE.geo.lat,
                longitude: SITE.geo.lng
            },
            areaServed: [
                { '@type': 'Country', name: 'Tanzania' },
                { '@type': 'Continent', name: 'Africa' },
                { '@type': 'Place', name: 'Serengeti National Park' },
                { '@type': 'Place', name: 'Ngorongoro Conservation Area' },
                { '@type': 'Place', name: 'Mount Kilimanjaro' },
                { '@type': 'Place', name: 'Mount Meru' },
                { '@type': 'Place', name: 'Zanzibar' },
                { '@type': 'Place', name: 'Arusha' }
            ],
            sameAs: [
                'https://facebook.com/tanzaniasafarimagic',
                'https://instagram.com/tanzaniasafarimagic',
                'https://wa.me/255695108009'
            ],
            priceRange: '$$-$$$',
            knowsAbout: [
                'Tanzania safari',
                'visit Tanzania',
                'Tanzania holidays',
                'Tanzania tourism',
                'Africa safari',
                'Serengeti National Park',
                'Serengeti migration',
                'Ngorongoro Crater',
                'Great Wildebeest Migration',
                'Mount Kilimanjaro',
                'climb Kilimanjaro',
                'Mount Meru',
                'Zanzibar beach',
                'Zanzibar beach holidays',
                'private safari Tanzania',
                'group safari Tanzania',
                'Private safari from Arusha'
            ]
        };
    }

    function durationToISO(days) {
        const d = parseInt(days, 10);
        if (!d || d < 1) return undefined;
        return `P${d}D`;
    }

    function touristTripSchema(safari) {
        const images = [];
        if (safari.featured_image_url) images.push(absoluteUrl(safari.featured_image_url));
        if (Array.isArray(safari.image_urls)) {
            safari.image_urls.forEach(u => images.push(absoluteUrl(u)));
        }
        if (!images.length) images.push(SITE.defaultImage);

        const itinerary = Array.isArray(safari.itinerary) ? safari.itinerary : [];
        const schema = {
            '@context': 'https://schema.org',
            '@type': ['TouristTrip', 'Product'],
            name: safari.package_name,
            description: safari.short_description || safari.detailed_description || '',
            image: images,
            url: SITE.url + '/safaris/' + (safari.package_slug || ''),
            provider: {
                '@type': 'TravelAgency',
                name: SITE.name,
                url: SITE.url,
                telephone: SITE.phone
            },
            touristType: 'Safari travelers',
            offers: {
                '@type': 'Offer',
                url: SITE.url + '/booking?package=' + (safari.package_slug || ''),
                priceCurrency: 'USD',
                price: Number(safari.base_price_usd || safari.price || 0),
                availability: 'https://schema.org/InStock',
                eligibleRegion: 'Worldwide'
            }
        };

        const iso = durationToISO(safari.duration_days);
        if (iso) schema.duration = iso;

        if (itinerary.length) {
            schema.itinerary = {
                '@type': 'ItemList',
                itemListElement: itinerary.map((day, i) => ({
                    '@type': 'ListItem',
                    position: i + 1,
                    name: day.title || `Day ${day.day_number || i + 1}`,
                    description: day.description || ''
                }))
            };
        }

        if (safari.avg_rating > 0) {
            schema.aggregateRating = {
                '@type': 'AggregateRating',
                ratingValue: Number(safari.avg_rating).toFixed(1),
                reviewCount: safari.review_count || safari.reviews?.length || 1,
                bestRating: 5
            };
        }

        return schema;
    }

    function faqSchema(faqs) {
        return {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: (faqs || []).filter(f => f && f.q && f.a).map(f => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: f.a
                }
            }))
        };
    }

    // Alias matching the server-side helper name (utils/seoRender.js).
    function faqPageSchema(faqs) {
        return faqSchema(faqs);
    }

    function seoT(key, vars) {
        if (global.TSM_i18n && typeof global.TSM_i18n.t === 'function') {
            const val = global.TSM_i18n.t(key, vars);
            if (val && val !== key) return val;
        }
        return null;
    }

    function defaultSafariFaqs(safari) {
        const name = safari.package_name || 'this safari';
        const days = safari.duration_days || 'multi-day';
        const fromLocale = [1, 2, 3, 4, 5].map((n) => {
            const q = seoT('seoFaqs.q' + n, { name, days });
            const a = seoT('seoFaqs.a' + n, { name, days });
            if (q && a) return { q, a };
            return null;
        }).filter(Boolean);
        if (fromLocale.length) return fromLocale;

        return [
            {
                q: `What is the best time to do ${name}?`,
                a: `The best time for most northern Tanzania safaris is during the dry seasons (June–October and January–February), when wildlife viewing is excellent. The Great Migration timing depends on the month — ask us for the current herd location when you inquire.`
            },
            {
                q: `What is included in the ${days}-day Tanzania safari package?`,
                a: `Typical inclusions are park fees, game drives in a 4x4 safari vehicle, professional guide, accommodation as listed, and meals as specified in the itinerary. Flights, visas, travel insurance, tips, and personal expenses are usually excluded — confirm on the Inclusions tab or via WhatsApp.`
            },
            {
                q: 'Do I need a visa for Tanzania?',
                a: 'Most international visitors require a Tanzania tourist visa (often available on arrival or e-visa). Requirements vary by nationality — check the official immigration site or ask our Arusha team for guidance before travel.'
            },
            {
                q: 'How much should I tip on a Tanzania safari?',
                a: 'Common tipping guidelines are about $10–20 USD per day for your safari guide/driver, plus hotel and lodge staff tips as appropriate. Your guide can advise based on group size and camp policies.'
            },
            {
                q: 'Can I customize this itinerary or add Zanzibar?',
                a: `Yes. Tanzania Safari Magic specializes in private and bespoke itineraries from Arusha. We can adjust ${name}, add a bush-to-beach Zanzibar extension, or design a custom route. Message us on WhatsApp at +255 695 108 009 for a free quote.`
            }
        ];
    }

    function renderFaqSection(container, faqs) {
        if (!container || !faqs?.length) return;
        const heading = seoT('seoFaqs.heading') || 'Safari FAQs';
        const intro = seoT('seoFaqs.intro') || 'Answers to common questions travelers ask before booking.';
        container.innerHTML = `
            <h2 style="font-family:var(--font-heading);margin:2.5rem 0 1rem;font-size:1.5rem">${escapeHtml(heading)}</h2>
            <p style="color:var(--text-muted);margin-bottom:1.25rem;font-size:.95rem">${escapeHtml(intro)}</p>
            <div class="seo-faq-list">
                ${faqs.map((f, i) => `
                    <details class="seo-faq-item" ${i === 0 ? 'open' : ''}>
                        <summary>${escapeHtml(f.q)}</summary>
                        <div class="seo-faq-a">${escapeHtml(f.a)}</div>
                    </details>
                `).join('')}
            </div>
        `;
        injectJsonLd('faq-jsonld', faqSchema(faqs));
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function applyPageSeo({ title, description, image, noindex, type, keywords, canonical }) {
        if (title) setTitle(title);
        if (description) setDescription(description);
        setCanonical(canonical);
        setOgImage(image);
        ensureMeta('property', 'og:url', (canonical || window.location.href).split('?')[0]);
        ensureMeta('property', 'og:type', type || 'website');
        ensureMeta('property', 'og:site_name', SITE.name);
        const ogLocales = { en: 'en_US', it: 'it_IT', fr: 'fr_FR', es: 'es_ES', de: 'de_DE', nl: 'nl_NL' };
        let lang = 'en';
        try {
            if (global.TSM_i18n && typeof global.TSM_i18n.getLanguage === 'function') {
                lang = global.TSM_i18n.getLanguage() || 'en';
            }
        } catch (_) {}
        ensureMeta('property', 'og:locale', ogLocales[lang] || 'en_US');
        if (keywords) ensureMeta('name', 'keywords', keywords);
        if (noindex) setNoIndexFollow();
        else setRobots('index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    function breadcrumbSchema(items) {
        return {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: (items || []).map((it, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: it.name,
                item: absoluteUrl(it.url)
            }))
        };
    }

    function websiteSchema() {
        return {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE.name,
            url: SITE.url,
            potentialAction: {
                '@type': 'SearchAction',
                target: SITE.url + '/safaris?q={search_term_string}',
                'query-input': 'required name=search_term_string'
            }
        };
    }

    function initGlobalSchemas() {
        injectJsonLd('localbusiness-jsonld', localBusinessSchema());
        injectJsonLd('website-jsonld', websiteSchema());
    }

    function imgAttrs(src, alt, w, h) {
        const width = w || 800;
        const height = h || 600;
        return `src="${src}" alt="${escapeHtml(alt || '')}" width="${width}" height="${height}" loading="lazy" decoding="async"`;
    }

    // Expose
    global.SafariSEO = {
        SITE,
        setTitle,
        setDescription,
        setCanonical,
        setRobots,
        setNoIndexFollow,
        setOgImage,
        applyPageSeo,
        injectJsonLd,
        localBusinessSchema,
        touristTripSchema,
        faqSchema,
        faqPageSchema,
        defaultSafariFaqs,
        renderFaqSection,
        initGlobalSchemas,
        breadcrumbSchema,
        websiteSchema,
        imgAttrs,
        absoluteUrl,
        durationToISO
    };
})(window);
