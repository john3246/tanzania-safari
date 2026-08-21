/**
 * Multilingual SEO meta for public routes (en primary + it/fr/es/de/nl).
 * Used by seoRender for SSR titles/descriptions that crawlers can index.
 */
const LOCALES = ['en', 'it', 'fr', 'es', 'de', 'nl'];

const OG_LOCALE = {
  en: 'en_US',
  it: 'it_IT',
  fr: 'fr_FR',
  es: 'es_ES',
  de: 'de_DE',
  nl: 'nl_NL'
};

/** Per-route SEO copy. Keys match logical page ids. */
const PAGE_SEO = {
  home: {
    en: {
      title: 'Private Tanzania Safari 2026 | Serengeti Prices from Arusha',
      description:
        'From $350/person/day — private Serengeti, Ngorongoro & Migration safaris from Arusha. WhatsApp +255 695 108 009 for live availability.',
      keywords:
        'tanzania safari, visit tanzania, travel to tanzania, tanzania holidays, private tanzania safari, serengeti safari, ngorongoro crater, great wildebeest migration, climb kilimanjaro, tanzania safari from arusha, safari packages tanzania, tanzania tourism, africa safari tours'
    },
    it: {
      title: 'Safari Tanzania 2026 | Tour privati | Tanzania Safari Magic',
      description:
        'Pianifica il tuo safari in Tanzania 2026 da Arusha: Serengeti, Ngorongoro, Grande Migrazione, Kilimanjaro e Zanzibar. Preventivo gratis dagli esperti.',
      keywords:
        'safari tanzania, visitare la tanzania, safari privato tanzania, safari serengeti, cratere ngorongoro, migrazione gnu, salita kilimanjaro, turismo tanzania, tour africa'
    },
    fr: {
      title: 'Safari Tanzanie 2026 | Circuits privés | Tanzania Safari Magic',
      description:
        'Planifiez votre safari en Tanzanie 2026 depuis Arusha : Serengeti, Ngorongoro, Grande Migration, Kilimandjaro et Zanzibar. Devis gratuit, experts locaux.',
      keywords:
        'safari tanzanie, visiter la tanzanie, safari privé tanzanie, safari serengeti, cratère ngorongoro, migration gnous, ascension kilimandjaro, tourisme tanzanie, safari afrique'
    },
    es: {
      title: 'Safari Tanzania 2026 | Tours privados | Tanzania Safari Magic',
      description:
        'Planifica tu safari en Tanzania 2026 desde Arusha: Serengeti, Ngorongoro, Gran Migración, Kilimanjaro y Zanzíbar. Presupuesto gratis con expertos locales.',
      keywords:
        'safari tanzania, viajar a tanzania, safari privado tanzania, safari serengeti, cráter ngorongoro, migración ñus, ascenso kilimanjaro, turismo tanzania, safaris áfrica'
    },
    de: {
      title: 'Tansania Safari 2026 | Private Touren | Tanzania Safari Magic',
      description:
        'Planen Sie Ihre Tansania-Safari 2026 ab Arusha: Serengeti, Ngorongoro, Große Migration, Kilimanjaro & Sansibar. Kostenloses Angebot von lokalen Experten.',
      keywords:
        'tansania safari, tansania reisen, private tansania safari, serengeti safari, ngorongoro krater, gnu-wanderung, kilimanjaro besteigung, tansania safari ab arusha, safari pakete tansania, tansania tourismus, afrika safari reisen'
    },
    nl: {
      title: 'Tanzania Safari 2026 | Privétours | Tanzania Safari Magic',
      description:
        'Plan uw Tanzania-safari 2026 vanuit Arusha: Serengeti, Ngorongoro, Grote Trek, Kilimanjaro & Zanzibar. Gratis offerte van lokale safari-experts.',
      keywords:
        'tanzania safari, tanzania reizen, privésafari tanzania, serengeti safari, ngorongoro krater, gnoetrek, kilimanjaro beklimmen, tanzania safari vanuit arusha, safari pakketten tanzania, tanzania toerisme, afrika safarireizen'
    }
  },
  visitTanzania: {
    en: {
      title: 'Visit Tanzania 2026 | Safari Cost, Best Time & Itineraries',
      description:
        'From $350/person/day — plan a Tanzania safari, Kilimanjaro climb or Zanzibar beach trip from Arusha. WhatsApp for live 2026 availability.',
      keywords:
        'visit tanzania, travel to tanzania, tanzania holidays, tanzania tourism, best time to visit tanzania, tanzania safari packages, africa safari tanzania, tanzania travel guide, tanzania vacation'
    },
    it: {
      title: 'Visitare la Tanzania 2026 | Safari, Kilimanjaro e Spiagge',
      description:
        'Vuoi visitare la Tanzania? Safari, salita al Kilimanjaro e spiagge di Zanzibar da Arusha. Periodo migliore, costi, visti ed esperienze top. Preventivo gratis.',
      keywords:
        'visitare tanzania, viaggio in tanzania, vacanze tanzania, turismo tanzania, quando visitare la tanzania, pacchetti safari tanzania, safari africa tanzania, guida viaggio tanzania'
    },
    fr: {
      title: 'Visiter la Tanzanie 2026 | Safaris, Kilimandjaro & Plages',
      description:
        'Envie de visiter la Tanzanie ? Safaris, Kilimandjaro et plages de Zanzibar depuis Arusha. Meilleure période, coûts et visas. Devis gratuit.',
      keywords:
        'visiter tanzanie, voyage en tanzanie, vacances tanzanie, tourisme tanzanie, meilleure période tanzanie, forfaits safari tanzanie, safari afrique tanzanie, guide voyage tanzanie'
    },
    es: {
      title: 'Visitar Tanzania 2026 | Safaris, Kilimanjaro y Playas',
      description:
        '¿Quieres visitar Tanzania? Safaris, Kilimanjaro y playas de Zanzíbar desde Arusha. Mejor época, costes y visados. Presupuesto gratis.',
      keywords:
        'visitar tanzania, viajar a tanzania, vacaciones tanzania, turismo tanzania, mejor época para visitar tanzania, paquetes safari tanzania, safari áfrica tanzania, guía de viaje tanzania'
    },
    de: {
      title: 'Tansania besuchen 2026 | Safaris, Kilimanjaro & Strandurlaub',
      description:
        'Sie möchten Tansania besuchen? Safaris, Kilimanjaro & Sansibar-Strände ab Arusha. Beste Reisezeit, Kosten, Visa & Highlights. Kostenloses Angebot.',
      keywords:
        'tansania besuchen, reise nach tansania, tansania urlaub, tansania tourismus, beste reisezeit tansania, tansania safari pakete, afrika safari tansania, tansania reiseführer'
    },
    nl: {
      title: 'Tanzania bezoeken 2026 | Safari’s, Kilimanjaro & Stranden',
      description:
        'Tanzania bezoeken? Safari’s, Kilimanjaro & Zanzibar-stranden vanuit Arusha. Beste reistijd, kosten & visa. Gratis offerte van lokale experts.',
      keywords:
        'tanzania bezoeken, reizen naar tanzania, tanzania vakantie, tanzania toerisme, beste reistijd tanzania, tanzania safaripakketten, afrika safari tanzania, tanzania reisgids'
    }
  },
  safaris: {
    en: {
      title: 'Tanzania Safari Packages 2026 | Prices & Itineraries',
      description:
        'Compare private Tanzania safari packages from $350/person/day — Serengeti, Ngorongoro, Kilimanjaro & Zanzibar. WhatsApp for live availability.',
      keywords:
        'tanzania safari packages, tanzania safari 2026, private safari tours tanzania, serengeti safari package, ngorongoro safari, kilimanjaro trek packages, africa safari packages, tanzania safari cost'
    },
    it: {
      title: 'Pacchetti safari | Tour safari Tanzania da Arusha',
      description:
        'Sfoglia pacchetti safari privati in Tanzania: migrazione Serengeti, Ngorongoro, Kilimanjaro e combo Zanzibar. Filtra per durata, destinazione e budget.',
      keywords: 'pacchetti safari tanzania, tour safari privati, safari serengeti, safari ngorongoro'
    },
    fr: {
      title: 'Forfaits safari | Circuits safari Tanzanie depuis Arusha',
      description:
        'Parcourez des forfaits safari privés en Tanzanie : migration Serengeti, Ngorongoro, Kilimandjaro et combos Zanzibar. Filtrez par durée, destination et budget.',
      keywords: 'forfaits safari tanzanie, circuits safari privés, safari serengeti, safari ngorongoro'
    },
    es: {
      title: 'Paquetes safari | Tours safari Tanzania desde Arusha',
      description:
        'Explora paquetes safari privados en Tanzania: migración Serengeti, Ngorongoro, Kilimanjaro y combos Zanzíbar. Filtra por duración, destino y presupuesto.',
      keywords: 'paquetes safari tanzania, tours safari privados, safari serengeti, safari ngorongoro'
    },
    de: {
      title: 'Safari-Pakete | Tansania-Safarireisen ab Arusha',
      description:
        'Entdecken Sie private Tansania-Safari-Pakete: Serengeti-Migration, Ngorongoro, Kilimanjaro und Bush-to-Beach-Kombis mit Sansibar. Filtern Sie nach Dauer, Ziel und Budget.',
      keywords: 'tansania safari pakete, private safarireisen tansania, serengeti safari paket, ngorongoro safari'
    },
    nl: {
      title: 'Safaripakketten | Tanzania-safarireizen vanuit Arusha',
      description:
        'Bekijk privé-safaripakketten voor Tanzania: Serengeti-trek, Ngorongoro, Kilimanjaro en bush-to-beach-combinaties met Zanzibar. Filter op duur, bestemming en budget.',
      keywords: 'tanzania safaripakketten, privésafarireizen tanzania, serengeti safari pakket, ngorongoro safari'
    }
  },
  destinations: {
    en: {
      title: 'Tanzania Destinations | Serengeti, Ngorongoro, Kilimanjaro & More',
      description:
        "Explore Tanzania's top safari destinations — Serengeti National Park, Ngorongoro Crater, Tarangire, Lake Manyara, Kilimanjaro, and Zanzibar — with local Arusha experts.",
      keywords:
        'tanzania national parks, serengeti national park, ngorongoro conservation area, kilimanjaro national park, tarangire, lake manyara, zanzibar, tanzania tourism destinations'
    },
    it: {
      title: 'Destinazioni Tanzania | Serengeti, Ngorongoro, Kilimanjaro',
      description:
        'Esplora le top destinazioni safari della Tanzania — Serengeti, Ngorongoro, Tarangire, Lago Manyara, Kilimanjaro e Zanzibar — con esperti locali di Arusha.',
      keywords: 'parchi nazionali tanzania, serengeti, ngorongoro, kilimanjaro, destinazioni turismo tanzania'
    },
    fr: {
      title: 'Destinations Tanzanie | Serengeti, Ngorongoro, Kilimandjaro',
      description:
        'Explorez les meilleures destinations safari de Tanzanie — Serengeti, Ngorongoro, Tarangire, lac Manyara, Kilimandjaro et Zanzibar — avec des experts d’Arusha.',
      keywords: 'parcs nationaux tanzanie, serengeti, ngorongoro, kilimandjaro, destinations tourisme tanzanie'
    },
    es: {
      title: 'Destinos Tanzania | Serengeti, Ngorongoro, Kilimanjaro',
      description:
        'Explora los mejores destinos safari de Tanzania — Serengeti, Ngorongoro, Tarangire, lago Manyara, Kilimanjaro y Zanzíbar — con expertos locales de Arusha.',
      keywords: 'parques nacionales tanzania, serengeti, ngorongoro, kilimanjaro, destinos turismo tanzania'
    },
    de: {
      title: 'Reiseziele Tansania | Serengeti, Ngorongoro, Kilimanjaro & mehr',
      description:
        'Entdecken Sie Tansanias beste Safari-Reiseziele — Serengeti-Nationalpark, Ngorongoro-Krater, Tarangire, Lake Manyara, Kilimanjaro und Sansibar — mit lokalen Experten aus Arusha.',
      keywords: 'tansania nationalparks, serengeti nationalpark, ngorongoro schutzgebiet, kilimanjaro nationalpark, reiseziele tansania tourismus'
    },
    nl: {
      title: 'Bestemmingen Tanzania | Serengeti, Ngorongoro, Kilimanjaro & meer',
      description:
        'Ontdek de beste safaribestemmingen van Tanzania — Serengeti National Park, Ngorongoro-krater, Tarangire, Lake Manyara, Kilimanjaro en Zanzibar — met lokale experts uit Arusha.',
      keywords: 'tanzania nationale parken, serengeti national park, ngorongoro natuurgebied, kilimanjaro national park, bestemmingen toerisme tanzania'
    }
  },
  group: {
    en: {
      title: 'Group Safaris Tanzania 2026 | Shared Dates & Prices',
      description:
        'Join a shared Tanzania group safari from Arusha — Serengeti to Ngorongoro. WhatsApp +255 695 108 009 for live 2026 departure availability.',
      keywords: 'group safari tanzania, shared safari tours, open group departure tanzania, affordable group safari'
    },
    it: {
      title: 'Safari di gruppo Tanzania | Tour condivisi a date fisse',
      description:
        'Unisciti a safari di gruppo a date fisse in Tanzania — ideale per single e coppie. Costi condivisi, guide esperte da Arusha.',
      keywords: 'safari di gruppo tanzania, tour condivisi, partenze aperte safari'
    },
    fr: {
      title: 'Safaris de groupe Tanzanie | Circuits partagés',
      description:
        'Rejoignez des safaris de groupe à dates fixes en Tanzanie — idéal pour solo et couples. Coûts partagés, guides experts d’Arusha.',
      keywords: 'safari de groupe tanzanie, circuits partagés, départs ouverts safari'
    },
    es: {
      title: 'Safaris en grupo Tanzania | Tours compartidos',
      description:
        'Únete a safaris en grupo con fechas fijas en Tanzania — ideal para solos y parejas. Costes compartidos, guías expertos desde Arusha.',
      keywords: 'safari en grupo tanzania, tours compartidos, salidas abiertas safari'
    },
    de: {
      title: 'Gruppensafaris Tansania | Geteilte Safaritouren zu festen Terminen',
      description:
        'Nehmen Sie an Gruppensafaris zu festen Terminen in Tansania teil — ideal für Alleinreisende und Paare. Geteilte Kosten, erfahrene Guides aus Arusha, Serengeti bis Ngorongoro.',
      keywords: 'gruppensafari tansania, geteilte safaritouren, offene gruppenabfahrt tansania, günstige gruppensafari'
    },
    nl: {
      title: 'Groepssafari’s Tanzania | Gedeelde safaritours op vaste data',
      description:
        'Sluit u aan bij groepssafari’s op vaste data in Tanzania — ideaal voor alleenreizigers en stellen. Gedeelde kosten, ervaren gidsen uit Arusha, Serengeti tot Ngorongoro.',
      keywords: 'groepssafari tanzania, gedeelde safaritours, open groepsvertrek tanzania, betaalbare groepssafari'
    }
  },
  kilimanjaro: {
    en: {
      title: 'Climb Kilimanjaro 2026 | Machame, Lemosho & Prices',
      description:
        'Guided Kilimanjaro climbs from Arusha — Machame, Lemosho & Marangu to Uhuru Peak. WhatsApp for 2026 dates, route fit and a live quote.',
      keywords:
        'climb kilimanjaro, kilimanjaro 2026, mount kilimanjaro, kilimanjaro climb cost, kilimanjaro trek, machame route, lemosho route, marangu route, uhuru peak, kilimanjaro from arusha'
    },
    it: {
      title: 'Sali il Kilimanjaro da Arusha | Machame, Lemosho e Marangu',
      description:
        'Trekking guidati sul Kilimanjaro da Arusha — rotte Machame, Lemosho, Marangu fino a Uhuru Peak (5.895 m). Salite private e combo salita + safari.',
      keywords: 'salire kilimanjaro, monte kilimanjaro, trekking kilimanjaro, rotta machame, uhuru peak'
    },
    fr: {
      title: 'Ascension du Kilimandjaro depuis Arusha | Machame, Lemosho',
      description:
        'Treks guidés du Kilimandjaro depuis Arusha — routes Machame, Lemosho, Marangu jusqu’à Uhuru Peak (5 895 m). Ascensions privées et combos ascension + safari.',
      keywords: 'ascension kilimandjaro, mont kilimandjaro, trek kilimandjaro, route machame, uhuru peak'
    },
    es: {
      title: 'Sube el Kilimanjaro desde Arusha | Machame, Lemosho',
      description:
        'Trekkings guiados al Kilimanjaro desde Arusha — rutas Machame, Lemosho, Marangu hasta Uhuru Peak (5.895 m). Ascensos privados y combos ascenso + safari.',
      keywords: 'subir kilimanjaro, monte kilimanjaro, trekking kilimanjaro, ruta machame, uhuru peak'
    },
    de: {
      title: 'Kilimanjaro besteigen ab Arusha | Machame, Lemosho & Marangu',
      description:
        'Geführte Kilimanjaro-Trekkings ab Arusha — Routen Machame, Lemosho, Marangu bis zum Uhuru Peak (5.895 m). Private Besteigungen und Besteigung-plus-Safari-Kombis.',
      keywords: 'kilimanjaro besteigen, mount kilimanjaro, kilimanjaro trekking, machame route, uhuru peak'
    },
    nl: {
      title: 'Kilimanjaro beklimmen vanuit Arusha | Machame, Lemosho & Marangu',
      description:
        'Begeleide Kilimanjaro-trektochten vanuit Arusha — Machame-, Lemosho- en Marangu-routes naar Uhuru Peak (5.895 m). Privébeklimmingen en beklimming-plus-safari-combinaties.',
      keywords: 'kilimanjaro beklimmen, mount kilimanjaro, kilimanjaro trektocht, machame route, uhuru peak'
    }
  },
  kilimanjaroRoutes: {
    en: {
      title: 'Kilimanjaro Routes Compared 2026 | Machame vs Lemosho',
      description:
        'Compare Kilimanjaro routes by days, difficulty and success rate. WhatsApp Our Team in Arusha for a 2026 climb quote and live availability.',
      keywords:
        'kilimanjaro routes, machame route, lemosho route, marangu route, rongai route, northern circuit, umbwe route, best kilimanjaro route, kilimanjaro route comparison'
    },
    it: {
      title: 'Rotte del Kilimanjaro | Machame, Lemosho, Marangu e altre',
      description:
        'Confronta tutte le rotte per la salita al Kilimanjaro — Machame, Lemosho, Marangu, Rongai, Northern Circuit e Umbwe — per difficoltà, giorni e tasso di successo.',
      keywords: 'rotte kilimanjaro, rotta machame, rotta lemosho, rotta marangu, migliore rotta kilimanjaro'
    },
    fr: {
      title: 'Voies du Kilimandjaro | Machame, Lemosho, Marangu et plus',
      description:
        'Comparez toutes les voies d’ascension du Kilimandjaro — Machame, Lemosho, Marangu, Rongai, Northern Circuit et Umbwe — par difficulté, jours et taux de réussite.',
      keywords: 'voies kilimandjaro, route machame, route lemosho, route marangu, meilleure voie kilimandjaro'
    },
    es: {
      title: 'Rutas del Kilimanjaro | Machame, Lemosho, Marangu y más',
      description:
        'Compara todas las rutas de ascenso al Kilimanjaro — Machame, Lemosho, Marangu, Rongai, Northern Circuit y Umbwe — por dificultad, días y tasa de éxito.',
      keywords: 'rutas kilimanjaro, ruta machame, ruta lemosho, ruta marangu, mejor ruta kilimanjaro'
    },
    de: {
      title: 'Kilimanjaro-Routen | Machame, Lemosho, Marangu & mehr',
      description:
        'Vergleichen Sie alle Kilimanjaro-Besteigungsrouten — Machame, Lemosho, Marangu, Rongai, Northern Circuit und Umbwe — nach Schwierigkeit, Tagen und Erfolgsquote.',
      keywords: 'kilimanjaro routen, machame route, lemosho route, marangu route, beste kilimanjaro route'
    },
    nl: {
      title: 'Kilimanjaro-routes | Machame, Lemosho, Marangu & meer',
      description:
        'Vergelijk alle Kilimanjaro-beklimmingsroutes — Machame, Lemosho, Marangu, Rongai, Northern Circuit en Umbwe — op moeilijkheid, dagen en slagingskans.',
      keywords: 'kilimanjaro routes, machame route, lemosho route, marangu route, beste kilimanjaro route'
    }
  },
  migrations: {
    en: {
      title: 'Great Migration Safari 2026 | Best Months & Prices',
      description:
        'Plan a Serengeti Great Migration safari — calving, Grumeti and Mara River months. WhatsApp for live herd location and 2026 availability.',
      keywords:
        'great wildebeest migration, serengeti migration safari, ndutu calving, mara river crossing, tanzania migration tours'
    },
    it: {
      title: 'Safari Grande Migrazione | Tour gnu Serengeti e Ndutu',
      description:
        'Vivi la Grande Migrazione degli gnu nel Serengeti e Ndutu — stagione dei parti, attraversamenti fluviali e predatori. Safari privati e di gruppo da Arusha.',
      keywords: 'grande migrazione gnu, safari migrazione serengeti, ndutu, attraversamento mara'
    },
    fr: {
      title: 'Safaris Grande Migration | Gnous Serengeti et Ndutu',
      description:
        'Vivez la Grande Migration des gnous au Serengeti et Ndutu — mises bas, traversées de rivières et prédateurs. Safaris privés et de groupe depuis Arusha.',
      keywords: 'grande migration gnous, safari migration serengeti, ndutu, traversée mara'
    },
    es: {
      title: 'Safaris Gran Migración | Ñus Serengeti y Ndutu',
      description:
        'Vive la Gran Migración de ñus en Serengeti y Ndutu — temporada de partos, cruces de ríos y depredadores. Safaris privados y de grupo desde Arusha.',
      keywords: 'gran migración ñus, safari migración serengeti, ndutu, cruce mara'
    },
    de: {
      title: 'Safaris zur Großen Migration | Gnu-Touren Serengeti & Ndutu',
      description:
        'Erleben Sie die Große Gnu-Wanderung in der Serengeti und in Ndutu — Kalbungssaison, Flussüberquerungen und Raubtiere. Private und Gruppen-Migrationssafaris ab Arusha.',
      keywords: 'große gnu-wanderung, serengeti migration safari, ndutu kalbung, mara flussüberquerung, tansania migration touren'
    },
    nl: {
      title: 'Safari’s Grote Trek | Gnoetours Serengeti & Ndutu',
      description:
        'Beleef de Grote Gnoetrek in de Serengeti en Ndutu — kalfseizoen, rivieroversteken en roofdieren. Privé- en groepssafari’s naar de trek vanuit Arusha.',
      keywords: 'grote gnoetrek, serengeti trek safari, ndutu kalfseizoen, mara rivieroversteek, tanzania trek tours'
    }
  },
  zanzibar: {
    en: {
      title: 'Safari + Zanzibar 2026 | Bush-to-Beach Packages & Prices',
      description:
        'Combine a Tanzania safari with Zanzibar beaches. WhatsApp +255 695 108 009 for a 2026 bush-to-beach quote and live lodge availability.',
      keywords: 'zanzibar beach holiday, bush to beach tanzania, zanzibar after safari, stone town, zanzibar packages'
    },
    it: {
      title: 'Vacanze a Zanzibar | Pacchetti bush-to-beach',
      description:
        'Aggiungi Zanzibar dopo il safari in Tanzania — spiagge di sabbia bianca, Stone Town, snorkeling e tour delle spezie. Pacchetti bush-to-beach da Arusha.',
      keywords: 'vacanze zanzibar, bush to beach tanzania, zanzibar dopo safari, stone town'
    },
    fr: {
      title: 'Séjours Zanzibar | Forfaits bush-to-beach',
      description:
        'Ajoutez Zanzibar après votre safari en Tanzanie — plages de sable blanc, Stone Town, snorkeling et tours d’épices. Forfaits bush-to-beach depuis Arusha.',
      keywords: 'séjour zanzibar, bush to beach tanzanie, zanzibar après safari, stone town'
    },
    es: {
      title: 'Vacaciones en Zanzíbar | Paquetes bush-to-beach',
      description:
        'Añade Zanzíbar tras tu safari en Tanzania — playas de arena blanca, Stone Town, snorkel y tours de especias. Paquetes bush-to-beach desde Arusha.',
      keywords: 'vacaciones zanzíbar, bush to beach tanzania, zanzíbar después safari, stone town'
    },
    de: {
      title: 'Sansibar Strandurlaub | Bush-to-Beach-Safari-Pakete',
      description:
        'Ergänzen Sie Sansibar nach Ihrer Tansania-Safari — weiße Sandstrände, Stone Town, Schnorcheln und Gewürztouren. Bush-to-Beach-Pakete ab Arusha.',
      keywords: 'sansibar strandurlaub, bush to beach tansania, sansibar nach safari, stone town, sansibar pakete'
    },
    nl: {
      title: 'Zanzibar strandvakanties | Bush-to-beach safaripakketten',
      description:
        'Voeg Zanzibar toe na uw Tanzania-safari — witte zandstranden, Stone Town, snorkelen en kruidentours. Bush-to-beach-pakketten vanuit Arusha.',
      keywords: 'zanzibar strandvakantie, bush to beach tanzania, zanzibar na safari, stone town, zanzibar pakketten'
    }
  },
  booking: {
    en: {
      title: 'Book a Tanzania Safari 2026 | Free Quote — WhatsApp Us',
      description:
        'Request a free Tanzania safari quote from Arusha. We usually reply within 2 hours on WhatsApp +255 695 108 009 — no payment to enquire.',
      keywords: 'book tanzania safari, safari quote arusha, inquire tanzania tour, private safari booking'
    },
    it: {
      title: 'Prenota un safari Tanzania | Preventivo gratis da Arusha',
      description:
        'Richiedi un preventivo gratis o prenota il tuo safari in Tanzania. Itinerari privati mid-range e luxury con guide locali. WhatsApp +255 695 108 009.',
      keywords: 'prenota safari tanzania, preventivo safari arusha, tour tanzania'
    },
    fr: {
      title: 'Réserver un safari Tanzanie | Devis gratuit depuis Arusha',
      description:
        'Demandez un devis gratuit ou réservez votre safari en Tanzanie. Itinéraires privés mid-range et luxe avec guides locaux. WhatsApp +255 695 108 009.',
      keywords: 'réserver safari tanzanie, devis safari arusha, circuit tanzanie'
    },
    es: {
      title: 'Reservar un safari Tanzania | Presupuesto gratis desde Arusha',
      description:
        'Solicita un presupuesto gratis o reserva tu safari en Tanzania. Itinerarios privados mid-range y lujo con guías locales. WhatsApp +255 695 108 009.',
      keywords: 'reservar safari tanzania, presupuesto safari arusha, tour tanzania'
    },
    de: {
      title: 'Tansania-Safari buchen | Kostenloses Angebot von Arusha-Experten',
      description:
        'Fordern Sie ein kostenloses Angebot an oder buchen Sie Ihre Tansania-Safari online. Private Mittelklasse- und Luxusrouten mit erfahrenen lokalen Guides. WhatsApp +255 695 108 009.',
      keywords: 'tansania safari buchen, safari angebot arusha, tansania tour anfrage, private safari buchung'
    },
    nl: {
      title: 'Tanzania-safari boeken | Gratis offerte van Arusha-experts',
      description:
        'Vraag een gratis offerte aan of boek uw Tanzania-safari online. Privé middenklasse- en luxereizen met ervaren lokale gidsen. WhatsApp +255 695 108 009.',
      keywords: 'tanzania safari boeken, safari offerte arusha, tanzania tour aanvraag, privésafari boeking'
    }
  },
  contact: {
    en: {
      title: 'Contact Tanzania Safari Magic | WhatsApp +255 695 108 009',
      description:
        'WhatsApp +255 695 108 009 — we usually reply within 2 hours. Free custom safari quote from Arusha. Email info@tanzaniasafarimagic.com.',
      keywords: 'contact tanzania safari, arusha safari operator, whatsapp safari tanzania'
    },
    it: {
      title: 'Contatta Tanzania Safari Magic | WhatsApp +255 695 108 009',
      description:
        'Contatta i nostri esperti safari a Arusha per un itinerario personalizzato gratis. WhatsApp +255 695 108 009 o email info@tanzaniasafarimagic.com.',
      keywords: 'contatto safari tanzania, operatore safari arusha'
    },
    fr: {
      title: 'Contact Tanzania Safari Magic | WhatsApp +255 695 108 009',
      description:
        'Contactez nos experts safari à Arusha pour un itinéraire personnalisé gratuit. WhatsApp +255 695 108 009 ou email info@tanzaniasafarimagic.com.',
      keywords: 'contact safari tanzanie, opérateur safari arusha'
    },
    es: {
      title: 'Contacto Tanzania Safari Magic | WhatsApp +255 695 108 009',
      description:
        'Contacta a nuestros expertos safari en Arusha para un itinerario personalizado gratis. WhatsApp +255 695 108 009 o email info@tanzaniasafarimagic.com.',
      keywords: 'contacto safari tanzania, operador safari arusha'
    },
    de: {
      title: 'Kontakt Tanzania Safari Magic | WhatsApp +255 695 108 009',
      description:
        'Kontaktieren Sie unsere Safari-Experten in Arusha für ein kostenloses individuelles Reiseangebot. Anruf oder WhatsApp +255 695 108 009 oder E-Mail info@tanzaniasafarimagic.com.',
      keywords: 'kontakt safari tansania, safari veranstalter arusha, whatsapp safari tansania'
    },
    nl: {
      title: 'Contact Tanzania Safari Magic | WhatsApp +255 695 108 009',
      description:
        'Neem contact op met onze safari-experts in Arusha voor een gratis reisofferte op maat. Bel of WhatsApp +255 695 108 009 of e-mail info@tanzaniasafarimagic.com.',
      keywords: 'contact safari tanzania, safari-operator arusha, whatsapp safari tanzania'
    }
  },
  about: {
    en: {
      title: 'About Tanzania Safari Magic | Arusha-Based Safari Operator',
      description:
        'Tanzania Safari Magic is a licensed Arusha safari operator specializing in private Serengeti migration tours, Ngorongoro safaris, and Zanzibar beach holidays.',
      keywords: 'tanzania safari operator, arusha tour company, licensed safari tanzania, tato safari'
    },
    it: {
      title: 'Chi siamo | Tanzania Safari Magic — Operatore safari Arusha',
      description:
        'Tanzania Safari Magic è un operatore safari con licenza a Arusha, specializzato in tour della migrazione Serengeti, safari Ngorongoro e vacanze a Zanzibar.',
      keywords: 'operatore safari tanzania, compagnia tour arusha'
    },
    fr: {
      title: 'À propos | Tanzania Safari Magic — Opérateur safari Arusha',
      description:
        'Tanzania Safari Magic est un opérateur safari licencié à Arusha, spécialisé dans les tours de migration Serengeti, safaris Ngorongoro et séjours à Zanzibar.',
      keywords: 'opérateur safari tanzanie, agence voyage arusha'
    },
    es: {
      title: 'Nosotros | Tanzania Safari Magic — Operador safari Arusha',
      description:
        'Tanzania Safari Magic es un operador safari con licencia en Arusha, especializado en tours de migración Serengeti, safaris Ngorongoro y vacaciones en Zanzíbar.',
      keywords: 'operador safari tanzania, agencia tours arusha'
    },
    de: {
      title: 'Über uns | Tanzania Safari Magic — Safari-Veranstalter aus Arusha',
      description:
        'Tanzania Safari Magic ist ein lizenzierter Safari-Veranstalter aus Arusha, spezialisiert auf private Serengeti-Migrationstouren, Ngorongoro-Safaris und Sansibar-Strandurlaube.',
      keywords: 'safari veranstalter tansania, tour anbieter arusha, lizenzierte safari tansania'
    },
    nl: {
      title: 'Over ons | Tanzania Safari Magic — Safari-operator uit Arusha',
      description:
        'Tanzania Safari Magic is een erkende safari-operator uit Arusha, gespecialiseerd in privé Serengeti-trektours, Ngorongoro-safari’s en strandvakanties op Zanzibar.',
      keywords: 'safari-operator tanzania, reisorganisatie arusha, erkende safari tanzania'
    }
  },
  blog: {
    en: {
      title: 'Tanzania Travel Blog & Safari Guides | Tanzania Safari Magic',
      description:
        'Tanzania safari travel tips, migration guides, safari costs, and itinerary ideas from Our Team in Arusha. Plan your private safari with confidence.',
      keywords:
        'tanzania safari guide, best time to visit tanzania, tanzania safari cost, great wildebeest migration, tanzania travel blog'
    },
    it: {
      title: 'Blog di viaggio Tanzania e guide safari',
      description:
        'Consigli di viaggio safari Tanzania, guide alla migrazione, costi e idee di itinerario dal nostro team a Arusha.',
      keywords: 'guida safari tanzania, periodo migliore tanzania, costi safari tanzania'
    },
    fr: {
      title: 'Blog voyage Tanzanie et guides safari',
      description:
        'Conseils de voyage safari Tanzanie, guides de migration, coûts et idées d’itinéraires de notre équipe à Arusha.',
      keywords: 'guide safari tanzanie, meilleure période tanzanie, coût safari tanzanie'
    },
    es: {
      title: 'Blog de viajes Tanzania y guías de safari',
      description:
        'Consejos de viaje safari Tanzania, guías de migración, costos e ideas de itinerario de nuestro equipo en Arusha.',
      keywords: 'guía safari tanzania, mejor época tanzania, costo safari tanzania'
    },
    de: {
      title: 'Tansania Reiseblog & Safari-Guides | Tanzania Safari Magic',
      description:
        'Reisetipps für Tansania-Safaris, Migrationsguides, Safarikosten und Routenideen von unserem Team in Arusha. Planen Sie Ihre private Safari mit Zuversicht.',
      keywords: 'tansania safari guide, beste reisezeit tansania, tansania safari kosten, große gnu-wanderung, tansania reiseblog'
    },
    nl: {
      title: 'Tanzania reisblog & safarigidsen | Tanzania Safari Magic',
      description:
        'Reistips voor Tanzania-safari’s, trekgidsen, safarikosten en routeideeën van ons team in Arusha. Plan uw privésafari met vertrouwen.',
      keywords: 'tanzania safarigids, beste reistijd tanzania, tanzania safari kosten, grote gnoetrek, tanzania reisblog'
    }
  },
  privacy: {
    en: {
      title: 'Privacy Policy | Tanzania Safari Magic',
      description: 'How Tanzania Safari Magic handles your information when you browse, enquire, or request a safari quote.'
    },
    it: {
      title: 'Informativa sulla privacy | Tanzania Safari Magic',
      description: 'Come Tanzania Safari Magic gestisce le tue informazioni quando navighi, richiedi o chiedi un preventivo safari.'
    },
    fr: {
      title: 'Politique de confidentialité | Tanzania Safari Magic',
      description: 'Comment Tanzania Safari Magic traite vos informations lorsque vous naviguez, demandez ou sollicitez un devis safari.'
    },
    es: {
      title: 'Política de privacidad | Tanzania Safari Magic',
      description: 'Cómo Tanzania Safari Magic gestiona tu información cuando navegas, consultas o solicitas un presupuesto safari.'
    },
    de: {
      title: 'Datenschutzerklärung | Tanzania Safari Magic',
      description: 'Wie Tanzania Safari Magic Ihre Informationen verarbeitet, wenn Sie stöbern, anfragen oder ein Safari-Angebot anfordern.'
    },
    nl: {
      title: 'Privacybeleid | Tanzania Safari Magic',
      description: 'Hoe Tanzania Safari Magic uw gegevens verwerkt wanneer u browst, informeert of een safari-offerte aanvraagt.'
    }
  },
  terms: {
    en: {
      title: 'Terms of Service | Tanzania Safari Magic',
      description: 'Booking terms for Tanzania Safari Magic tours, quotes, deposits, and safari services from Arusha.'
    },
    it: {
      title: 'Termini di servizio | Tanzania Safari Magic',
      description: 'Condizioni di prenotazione per tour, preventivi, depositi e servizi safari di Tanzania Safari Magic da Arusha.'
    },
    fr: {
      title: 'Conditions d’utilisation | Tanzania Safari Magic',
      description: 'Conditions de réservation pour les circuits, devis, acomptes et services safari de Tanzania Safari Magic depuis Arusha.'
    },
    es: {
      title: 'Términos de servicio | Tanzania Safari Magic',
      description: 'Condiciones de reserva para tours, presupuestos, depósitos y servicios safari de Tanzania Safari Magic desde Arusha.'
    },
    de: {
      title: 'Nutzungsbedingungen | Tanzania Safari Magic',
      description: 'Buchungsbedingungen für Touren, Angebote, Anzahlungen und Safari-Leistungen von Tanzania Safari Magic ab Arusha.'
    },
    nl: {
      title: 'Servicevoorwaarden | Tanzania Safari Magic',
      description: 'Boekingsvoorwaarden voor tours, offertes, aanbetalingen en safaridiensten van Tanzania Safari Magic vanuit Arusha.'
    }
  }
};

function normalizeLang(lang) {
  const l = String(lang || 'en').toLowerCase().slice(0, 2);
  return LOCALES.includes(l) ? l : 'en';
}

function getPageSeo(pageKey, lang = 'en') {
  const page = PAGE_SEO[pageKey];
  if (!page) return null;
  const l = normalizeLang(lang);
  return page[l] || page.en;
}

function parseLangFromRequest(req) {
  if (!req) return 'en';
  const q = req.query && req.query.lang;
  if (q && LOCALES.includes(String(q).toLowerCase())) return String(q).toLowerCase();
  const cookie = req.headers && req.headers.cookie;
  if (cookie) {
    const m = String(cookie).match(/(?:^|;\s*)tsm_lang=([a-z]{2})/i);
    if (m && LOCALES.includes(m[1].toLowerCase())) return m[1].toLowerCase();
  }
  const accept = req.headers && req.headers['accept-language'];
  if (accept) {
    const preferred = String(accept)
      .split(',')
      .map((p) => p.trim().slice(0, 2).toLowerCase());
    for (const code of preferred) {
      if (LOCALES.includes(code)) return code;
    }
  }
  return 'en';
}

/**
 * Build absolute alternate URLs for hreflang (path + optional ?lang=).
 * English (x-default) stays clean without ?lang= for strongest ranking URL.
 */
function buildHreflangLinks(canonicalPath, siteUrl) {
  const base = String(siteUrl || '').replace(/\/$/, '');
  const path = !canonicalPath || canonicalPath === '/' ? '' : canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  const clean = `${base}${path || ''}` || base;
  return LOCALES.map((lang) => ({
    hreflang: lang,
    href: lang === 'en' ? clean : `${clean}${clean.includes('?') ? '&' : '?'}lang=${lang}`
  })).concat([{ hreflang: 'x-default', href: clean }]);
}

module.exports = {
  LOCALES,
  OG_LOCALE,
  PAGE_SEO,
  getPageSeo,
  parseLangFromRequest,
  buildHreflangLinks,
  normalizeLang
};
