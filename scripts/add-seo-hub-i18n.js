const fs = require('fs');
const path = 'public/locales';
const hub = {
  seoHubTitle: {
    en: 'Tanzania safari tourism from Arusha',
    it: 'Turismo safari in Tanzania da Arusha',
    fr: 'Tourisme safari en Tanzanie depuis Arusha',
    es: 'Turismo safari en Tanzania desde Arusha'
  },
  seoHubP1: {
    en: 'Tanzania Safari Magic is your local gateway to Tanzania tourism: private Serengeti safaris, Ngorongoro Crater game drives, Great Wildebeest Migration tours, Mount Kilimanjaro climbs, and Zanzibar beach holidays — all planned from Arusha with licensed guides.',
    it: 'Tanzania Safari Magic è la tua porta locale al turismo in Tanzania: safari privati nel Serengeti, game drive nel cratere Ngorongoro, tour della Grande Migrazione, salite al Kilimanjaro e vacanze a Zanzibar — tutto pianificato da Arusha con guide con licenza.',
    fr: 'Tanzania Safari Magic est votre porte d’entrée locale au tourisme en Tanzanie : safaris privés au Serengeti, game drives au cratère Ngorongoro, tours de la Grande Migration, ascensions du Kilimandjaro et séjours à Zanzibar — le tout planifié depuis Arusha avec des guides licenciés.',
    es: 'Tanzania Safari Magic es tu puerta local al turismo en Tanzania: safaris privados en Serengeti, game drives en el cráter Ngorongoro, tours de la Gran Migración, ascensos al Kilimanjaro y vacaciones en Zanzíbar — todo planificado desde Arusha con guías licenciados.'
  },
  seoHubLinks: {
    en: 'Explore <a href="/safaris">safari packages</a>, <a href="/destinations/serengeti-national-park">Serengeti National Park</a>, <a href="/destinations/ngorongoro-conservation-area">Ngorongoro</a>, <a href="/kilimanjaro">Kilimanjaro treks</a>, <a href="/migrations">migration safaris</a>, <a href="/zanzibar">Zanzibar extensions</a>, and our <a href="/blog/tanzania-safari">Tanzania safari guide</a> — or <a href="/booking">request a free quote</a>.',
    it: 'Esplora i <a href="/safaris">pacchetti safari</a>, <a href="/destinations/serengeti-national-park">Parco Nazionale Serengeti</a>, <a href="/destinations/ngorongoro-conservation-area">Ngorongoro</a>, <a href="/kilimanjaro">trekking Kilimanjaro</a>, <a href="/migrations">safari migrazione</a>, <a href="/zanzibar">estensioni Zanzibar</a> e la nostra <a href="/blog/tanzania-safari">guida safari Tanzania</a> — o <a href="/booking">richiedi un preventivo gratis</a>.',
    fr: 'Explorez les <a href="/safaris">forfaits safari</a>, le <a href="/destinations/serengeti-national-park">parc national du Serengeti</a>, <a href="/destinations/ngorongoro-conservation-area">Ngorongoro</a>, les <a href="/kilimanjaro">treks Kilimandjaro</a>, les <a href="/migrations">safaris migration</a>, les <a href="/zanzibar">extensions Zanzibar</a> et notre <a href="/blog/tanzania-safari">guide safari Tanzanie</a> — ou <a href="/booking">demandez un devis gratuit</a>.',
    es: 'Explora <a href="/safaris">paquetes safari</a>, <a href="/destinations/serengeti-national-park">Parque Nacional Serengeti</a>, <a href="/destinations/ngorongoro-conservation-area">Ngorongoro</a>, <a href="/kilimanjaro">trekkings Kilimanjaro</a>, <a href="/migrations">safaris de migración</a>, <a href="/zanzibar">extensiones Zanzíbar</a> y nuestra <a href="/blog/tanzania-safari">guía safari Tanzania</a> — o <a href="/booking">solicita un presupuesto gratis</a>.'
  }
};

for (const lang of ['en', 'it', 'fr', 'es', 'de', 'nl']) {
  const f = `${path}/${lang}.json`;
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  j.home = j.home || {};
  for (const [k, v] of Object.entries(hub)) j.home[k] = v[lang];
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n');
  console.log(lang, 'ok');
}
