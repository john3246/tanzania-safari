/**
 * In-memory SSR fragments so HTML is never blocked on Postgres.
 * First byte goes out immediately; the cache refreshes in the background.
 */
const ssr = require('./ssrContent');

const FALLBACK_DESTINATIONS = [
  {
    park_name: 'Serengeti National Park',
    park_slug: 'serengeti-national-park',
    featured_image_url: '/images/optimized/serengeti-national-park.webp',
    short_description: 'Endless plains, Big Cats and the Great Wildebeest Migration.'
  },
  {
    park_name: 'Ngorongoro Conservation Area',
    park_slug: 'ngorongoro-conservation-area',
    featured_image_url: '/images/optimized/ngorongoro-conservation-area.webp',
    short_description: 'A collapsed volcano packed with lions, elephants and black rhino.'
  },
  {
    park_name: 'Tarangire National Park',
    park_slug: 'tarangire-national-park',
    featured_image_url: '/images/optimized/tarangire-national-park.webp',
    short_description: 'Baobabs, huge elephant herds and easy game viewing from Arusha.'
  },
  {
    park_name: 'Zanzibar',
    park_slug: 'zanzibar',
    featured_image_url: '/images/optimized/zanzibar.webp',
    short_description: 'Spice island beaches to pair with a northern-circuit safari.'
  }
];

const FALLBACK_PACKAGES = [
  {
    package_name: 'Serengeti & Ngorongoro Safari',
    package_slug: '',
    card_href: '/safaris',
    featured_image_url: '/images/optimized/serengeti-national-park.webp',
    duration_days: 6,
    short_description: 'Private northern-circuit safari with expert guides from Arusha.'
  },
  {
    package_name: 'Great Migration Safari',
    package_slug: '',
    card_href: '/safaris',
    featured_image_url: '/images/optimized/mbugani.webp',
    duration_days: 8,
    short_description: 'Follow the wildebeest through Serengeti and the Mara River region.'
  },
  {
    package_name: 'Kilimanjaro Climb',
    package_slug: '',
    card_href: '/kilimanjaro',
    featured_image_url: '/images/optimized/balloon.webp',
    duration_days: 7,
    short_description: 'Machame, Lemosho or Marangu routes with experienced mountain crews.'
  },
  {
    package_name: 'Safari & Zanzibar',
    package_slug: '',
    card_href: '/safaris',
    featured_image_url: '/images/optimized/zanzibar.webp',
    duration_days: 10,
    short_description: 'Bush-to-beach: Serengeti game drives then Zanzibar beaches.'
  }
];

const TTL_MS = 60 * 1000;
const store = {
  home: { featured: FALLBACK_PACKAGES, destinations: FALLBACK_DESTINATIONS, t: 0 },
  safaris: { packages: FALLBACK_PACKAGES, t: 0 },
  destinations: { destinations: FALLBACK_DESTINATIONS, t: 0 }
};
const inflight = {};

function isFresh(entry) {
  return entry && entry.t > 0 && Date.now() - entry.t < TTL_MS;
}

async function refreshHome() {
  if (inflight.home) return inflight.home;
  inflight.home = (async () => {
    try {
      const [featured, destinations] = await Promise.all([
        ssr.fetchFeaturedPackages(6),
        ssr.fetchDestinations(4)
      ]);
      store.home = {
        featured: (featured && featured.length) ? featured : store.home.featured,
        destinations: (destinations && destinations.length) ? destinations : store.home.destinations,
        t: Date.now()
      };
    } catch (err) {
      console.warn('[ssrCache] home', err.message);
    } finally {
      inflight.home = null;
    }
  })();
  return inflight.home;
}

async function refreshSafaris() {
  if (inflight.safaris) return inflight.safaris;
  inflight.safaris = (async () => {
    try {
      const packages = await ssr.fetchPackages(24);
      store.safaris = { packages: (packages && packages.length) ? packages : store.safaris.packages, t: Date.now() };
    } catch (err) {
      console.warn('[ssrCache] safaris', err.message);
    } finally {
      inflight.safaris = null;
    }
  })();
  return inflight.safaris;
}

async function refreshDestinations() {
  if (inflight.destinations) return inflight.destinations;
  inflight.destinations = (async () => {
    try {
      const destinations = await ssr.fetchDestinations(24);
      store.destinations = { destinations: (destinations && destinations.length) ? destinations : store.destinations.destinations, t: Date.now() };
    } catch (err) {
      console.warn('[ssrCache] destinations', err.message);
    } finally {
      inflight.destinations = null;
    }
  })();
  return inflight.destinations;
}

function getHome() {
  if (!isFresh(store.home)) refreshHome().catch(() => {});
  return store.home;
}

function getSafaris() {
  if (!isFresh(store.safaris)) refreshSafaris().catch(() => {});
  return store.safaris;
}

function getDestinations() {
  if (!isFresh(store.destinations)) refreshDestinations().catch(() => {});
  return store.destinations;
}

function warm() {
  refreshHome().catch(() => {});
  refreshSafaris().catch(() => {});
  refreshDestinations().catch(() => {});
}

module.exports = { getHome, getSafaris, getDestinations, warm, refreshHome };
