/**
 * Public captions for experience photos — tour activities, never filenames.
 */
const TOUR_LABEL_BY_KEY = {
  'balloon': 'Hot Air Balloon',
  'boat zanzibar': 'Dhow Cruise',
  'chui hunting': 'Private Game Drive',
  'chui juu yamti': 'Big Cat Safari',
  'chui resting': 'Afternoon Game Drive',
  'chui stuning': 'Luxury Game Drive',
  'chui': 'Wilderness Safari',
  'climbing mountain': 'Kilimanjaro Trek',
  'faru attack': 'Crater Floor Drive',
  'faru': 'Conservation Safari',
  'flamingo': 'Lake Manyara',
  'kiboko': 'Hippo Pool Stop',
  'kifaru': 'Black Rhino Safari',
  'kundi simba': 'Pride Country Drive',
  'leopard wayowing': 'Evening Game Drive',
  'lion hunt': 'Predator Safari',
  'lion son': 'Family Safari',
  'mbugani': 'Ngorongoro Safari',
  'nyumbu 2': 'Calving Season',
  'nyumbu': 'Herd Migration',
  'on top on mount lion': 'Kopje Picnic',
  'punda mlia': 'Plains Game Drive',
  'scaterd nyumbu': 'Great Migration',
  'serengeti chui': 'Serengeti Wilderness',
  'simba on grass': 'Dawn Game Drive',
  'starting crossing the river': 'River Crossing',
  'swalaa': 'Savannah Drive',
  'tembo 2': 'Wildlife Safari',
  'tembo mkubwa': 'Elephant Country',
  'tembo sere': 'Serengeti Game Drive',
  'tembo': 'Waterhole Stop',
  'tour car': '4x4 Game Drive',
  'tumbili': 'Bush Walk',
  'twiga crossing road': 'Safari Transfer',
  'twiga eating': 'Tarangire Safari',
  'twiga': 'Acacia Country',
  'wamasai': 'Cultural Visit',
  'zanzibar sunset': 'Island Sunset',
  'zebra 2': 'Open Plains',
  'zebra serengeti': 'Grassland Drive',
  'ziwa': 'Lakeside Safari',
  'beute of black and white on grass': 'Plains Game Drive',
  'beauty of black and white on grass': 'Plains Game Drive',
  'is you try or left behind': 'Predator Safari',
  'if you try or left behind': 'Predator Safari',
  'some time we need a break': 'Bush Rest Stop',
  'sometimes we need a break': 'Bush Rest Stop',
  'the beaute of power': 'Big Five Safari',
  'the beauty of power': 'Big Five Safari',
  'the sacrifise': 'Migration Crossing',
  'the sacrifice': 'Migration Crossing',
  'we are standby to save you': 'Guided Rescue Drive',
  'we are standing by to save you': 'Guided Safari',
  'the ecosystem': 'Habitat Safari',
  'the elephant': 'Elephant Country',
  'the humbleness': 'Quiet Game Drive',
  'the king of fresh water': 'Hippo Pool Stop',
  'the life trap': 'River Safari',
  'the nature': 'Wilderness Walk',
  'the risk': 'Adventure Safari'
};

const TOUR_FALLBACKS = [
  'Game Drive',
  'Wildlife Safari',
  'Cultural Visit',
  'Bush Breakfast',
  'Walking Safari',
  'Scenic Transfer',
  'Island Excursion',
  'Mountain Trek'
];

function experienceTitleKey(raw) {
  return String(raw || '')
    .replace(/\.[^.]+$/, '')
    .replace(/%20/gi, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function fallbackTourLabel(key) {
  let hash = 0;
  const s = String(key || '');
  for (let i = 0; i < s.length; i += 1) hash = (hash + s.charCodeAt(i) * (i + 1)) % TOUR_FALLBACKS.length;
  return TOUR_FALLBACKS[hash] || 'Game Drive';
}

function tagFromExperienceFile(filename) {
  const key = experienceTitleKey(filename);
  return TOUR_LABEL_BY_KEY[key] || fallbackTourLabel(key);
}

module.exports = { tagFromExperienceFile, experienceTitleKey, TOUR_LABEL_BY_KEY };
