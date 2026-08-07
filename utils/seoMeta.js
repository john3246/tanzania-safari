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
      title: 'Tanzania Safari Magic | Private Safaris from Arusha 2026',
      description:
        'Book private Tanzania safaris from Arusha: Serengeti, Ngorongoro Crater, Great Migration, Kilimanjaro & Zanzibar. Local guides, free quotes, mid-range to luxury.',
      keywords:
        'tanzania safari, private tanzania safari, serengeti safari, ngorongoro crater, wildebeest migration, kilimanjaro climb, tanzania safari from arusha, safari packages tanzania, tanzania tourism, africa safari tours'
    },
    it: {
      title: 'Tanzania Safari Magic | Safari privati da Arusha 2026',
      description:
        'Prenota safari privati in Tanzania da Arusha: Serengeti, cratere Ngorongoro, Grande Migrazione, Kilimanjaro e Zanzibar. Guide locali, preventivi gratis.',
      keywords:
        'safari tanzania, safari privato tanzania, safari serengeti, cratere ngorongoro, migrazione gnu, salita kilimanjaro, turismo tanzania, tour africa'
    },
    fr: {
      title: 'Tanzania Safari Magic | Safaris privés depuis Arusha 2026',
      description:
        'Réservez des safaris privés en Tanzanie depuis Arusha : Serengeti, cratère Ngorongoro, Grande Migration, Kilimandjaro et Zanzibar. Guides locaux, devis gratuits.',
      keywords:
        'safari tanzanie, safari privé tanzanie, safari serengeti, cratère ngorongoro, migration gnous, ascension kilimandjaro, tourisme tanzanie, safari afrique'
    },
    es: {
      title: 'Tanzania Safari Magic | Safaris privados desde Arusha 2026',
      description:
        'Reserva safaris privados en Tanzania desde Arusha: Serengeti, cráter Ngorongoro, Gran Migración, Kilimanjaro y Zanzíbar. Guías locales, presupuestos gratis.',
      keywords:
        'safari tanzania, safari privado tanzania, safari serengeti, cráter ngorongoro, migración ñus, ascenso kilimanjaro, turismo tanzania, safaris áfrica'
    },
    de: {
      title: 'Tanzania Safari Magic | Private Safaris ab Arusha 2026',
      description:
        'Buchen Sie private Tansania-Safaris ab Arusha: Serengeti, Ngorongoro-Krater, Große Migration, Kilimanjaro & Sansibar. Einheimische Guides, kostenlose Angebote, Mittelklasse bis Luxus.',
      keywords:
        'tansania safari, private tansania safari, serengeti safari, ngorongoro krater, gnu-wanderung, kilimanjaro besteigung, tansania safari ab arusha, safari pakete tansania, tansania tourismus, afrika safari reisen'
    },
    nl: {
      title: 'Tanzania Safari Magic | Privésafari’s vanuit Arusha 2026',
      description:
        'Boek privésafari’s in Tanzania vanuit Arusha: Serengeti, Ngorongoro-krater, Grote Trek, Kilimanjaro & Zanzibar. Lokale gidsen, gratis offertes, middenklasse tot luxe.',
      keywords:
        'tanzania safari, privésafari tanzania, serengeti safari, ngorongoro krater, gnoetrek, kilimanjaro beklimmen, tanzania safari vanuit arusha, safari pakketten tanzania, tanzania toerisme, afrika safarireizen'
    }
  },
  safaris: {
    en: {
      title: 'Safari Packages | Tanzania Safari Tours from Arusha',
      description:
        'Browse private Tanzania safari packages: Serengeti migration, Ngorongoro, Kilimanjaro, and bush-to-beach Zanzibar combos. Filter by duration, destination, and budget.',
      keywords:
        'tanzania safari packages, private safari tours tanzania, serengeti safari package, ngorongoro safari, kilimanjaro trek packages, africa wildlife tours'
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
      title: 'Open Group Safaris Tanzania | Join Shared Safari Tours',
      description:
        'Join fixed-date group safaris in Tanzania — ideal for solo travelers and couples. Shared costs, expert guides from Arusha, Serengeti to Ngorongoro.',
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
      title: 'Climb Kilimanjaro from Arusha | Machame, Lemosho & Marangu',
      description:
        'Guided Mount Kilimanjaro treks from Arusha — Machame, Lemosho, Marangu routes to Uhuru Peak (5,895 m). Private climbs and climb + safari combos.',
      keywords:
        'climb kilimanjaro, mount kilimanjaro, kilimanjaro trek, machame route, lemosho route, marangu route, uhuru peak, kilimanjaro from arusha'
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
  migrations: {
    en: {
      title: 'Great Migration Safaris | Serengeti & Ndutu Wildebeest Tours',
      description:
        'See the Great Wildebeest Migration in Serengeti and Ndutu — calving season, river crossings, and predator action. Private and group migration safaris from Arusha.',
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
      title: 'Zanzibar Beach Holidays | Bush-to-Beach Safari Packages',
      description:
        'Add Zanzibar after your Tanzania safari — white-sand beaches, Stone Town, snorkeling, and spice tours. Bush-to-beach packages from Arusha.',
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
      title: 'Book a Tanzania Safari | Free Quote from Arusha Experts',
      description:
        'Request a free quote or book your Tanzania safari online. Private mid-range and luxury itineraries with expert local guides. WhatsApp +255 695 108 009.',
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
        'Contact our Arusha safari experts for a free custom itinerary quote. Call or WhatsApp +255 695 108 009, or email info@tanzaniasafarimagic.com.',
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
