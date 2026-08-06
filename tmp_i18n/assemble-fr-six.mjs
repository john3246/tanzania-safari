import fs from 'fs';
import path from 'path';

const WA =
  'https://wa.me/255695108009?text=Hi%20Tanzania%20Safari%20Magic%20team%2C%20I%20want%20help%20planning%20a%20Tanzania%20safari.';

const outDir = 'public/locales/fr/guides';
const workDir = 'tmp_i18n/fr_work';
fs.mkdirSync(outDir, { recursive: true });

const guides = {
  'best-time-to-visit-tanzania': {
    slug: 'best-time-to-visit-tanzania',
    title: 'Meilleure période pour visiter la Tanzanie 2026 : guide safari mois par mois',
    meta_title: 'Meilleure période Tanzanie 2026 | Saison sèche, migration et plage',
    meta_description:
      'Meilleurs mois pour un safari en Tanzanie : faune de saison sèche, calendrier de la Grande Migration, valeur en saison verte, timing Kilimandjaro et Zanzibar. Planifiez avec Tanzania Safari Magic à Arusha.',
    excerpt:
      'Calendrier safari Tanzanie mois par mois — saison sèche vs verte, temps forts migration, choix de parcs, fréquentation, coûts, Kilimandjaro et Zanzibar — de Notre équipe à Arusha.',
    category_name: 'Guides safari',
    faqs: [
      {
        q: 'Quel est le meilleur mois global pour un safari en Tanzanie ?',
        a: 'Juin–octobre offre l\'observation classique de saison sèche et (en semaines de pointe) le drame de la migration sur la rivière Mara. Janvier–mars est exceptionnel pour la mise bas au sud du Serengeti. Le « meilleur » dépend de si vous priorisez les traversées, les veaux, les paysages plus verts ou le rapport qualité-prix.',
      },
      {
        q: 'La saison des pluies est-elle une mauvaise période pour venir ?',
        a: 'Pas toujours. Les petites pluies et les intersaisons des grandes pluies peuvent signifier des décors luxuriants, moins de véhicules et des tarifs lodges plus doux. Certaines routes deviennent plus dures et les troupeaux de migration se déplacent — Notre équipe conçoit des itinéraires qui fonctionnent encore.',
      },
      {
        q: 'Quand partir pour la Grande Migration ?',
        a: 'Janvier–mars pour la mise bas (sud/Ndutu) ; environ mai–juin pour Grumeti/corridor ouest ; juillet–octobre pour les traversées de la rivière Mara au nord du Serengeti. Voir notre guide migration dédié pour le détail région par région.',
      },
      {
        q: 'Quand Zanzibar est-elle la meilleure après un safari ?',
        a: 'Juin–octobre et janvier–février sont des fenêtres plage populaires. Les mois d\'intersaison peuvent offrir des hôtels plus calmes. Nous alignons les nuits sur l\'île avec votre dernier jour safari et les correspondances depuis Arusha ou le Kilimandjaro.',
      },
      {
        q: 'Quelle est la meilleure période pour gravir le Kilimandjaro ?',
        a: 'Les fenêtres plutôt sèches autour de janvier–mars et juin–octobre sont couramment préférées. Nous planifions les jours de trek autour de votre safari pour que récupération et transferts restent réalistes.',
      },
    ],
  },
  'ngorongoro-crater': {
    slug: 'ngorongoro-crater',
    title: 'Guide safari cratère du Ngorongoro 2026 | Faune et visites d\'une journée',
    meta_title: 'Guide cratère du Ngorongoro 2026 | Safari Big Five depuis Arusha',
    meta_description:
      'Planifiez un safari au cratère du Ngorongoro : faune (Big Five et rhinocéros noir), meilleure période, combien de jours, conseils fond du cratère, logique des frais, et itinéraires privés de Tanzania Safari Magic.',
    excerpt:
      'Planifiez une visite d\'une journée au cratère du Ngorongoro ou un séjour sur le rebord — faune Big Five, chances de rhinocéros noir, climat, meilleurs mois, logique des frais, et itinéraires privés depuis Arusha.',
    category_name: 'Guides safari',
    faqs: [
      {
        q: 'Peut-on voir les Big Five dans le cratère du Ngorongoro ?',
        a: 'Oui — lion, léopard, éléphant, buffle et rhinocéros noir sont tous présents sur le fond du cratère. Les observations de rhino ne sont jamais garanties, mais Ngorongoro reste l\'une des meilleures chances de rhino en journée de Tanzanie sur un circuit nord classique.',
      },
      {
        q: 'Combien de jours faut-il pour Ngorongoro ?',
        a: 'La plupart des hôtes font une journée complète sur le fond du cratère dans un safari multi-parcs. Une nuit sur le rebord à Karatu ou sur le rebord du cratère facilite la descente tôt. Deux journées cratère sont rarement nécessaires sauf si la photographie est la priorité.',
      },
      {
        q: 'Ngorongoro est-il cher par rapport aux autres parcs ?',
        a: 'Les frais de conservation et de cratère figurent parmi les postes les plus élevés d\'un circuit nord. Réservez avec un opérateur local à Arusha pour que les devis incluent clairement les frais actuels — voir notre guide des coûts safari Tanzanie pour les fourchettes de planification.',
      },
      {
        q: 'Dois-je dormir sur le rebord du cratère ou à Karatu ?',
        a: 'Les lodges du rebord offrent le trajet le plus court vers la route de descente et des vues spectaculaires. Les lodges de Karatu coûtent généralement moins et s\'associent bien aux journées Tarangire ou lac Manyara. Notre équipe fait correspondre le style de lodge à votre budget et au rythme de l\'itinéraire.',
      },
      {
        q: 'Ngorongoro est-il sûr pour les familles ?',
        a: 'Oui lorsque vous voyagez avec un guide agréé en 4x4 toit ouvert, restez dans le véhicule sur le fond, et suivez les règles du parc. Nous concevons régulièrement des journées cratère familiales avec un timing de pique-nique flexible.',
      },
    ],
  },
  'zanzibar-guide': {
    slug: 'zanzibar-guide',
    title: 'Guide Zanzibar 2026 : plages, île aux épices et extensions safari',
    meta_title: 'Guide Zanzibar 2026 | Plages, tours épices et extensions safari',
    meta_description:
      'Planifiez Zanzibar après votre safari en Tanzanie : meilleures plages (Kendwa, Nungwi, Paje), Stone Town, tours épices, Jozani, coûts, et comment combiner avec le Serengeti depuis Arusha.',
    excerpt:
      'Un guide pratique de Zanzibar pour les voyageurs safari — meilleures plages, Stone Town, tours épices, vie marine, coûts, et comment ajouter l\'île aux épices après Serengeti ou Ngorongoro.',
    category_name: 'Guides safari',
    faqs: [
      {
        q: 'Combien de jours passer à Zanzibar après un safari ?',
        a: 'La plupart des hôtes s\'en sortent bien avec 3–5 nuits plage après un safari du circuit nord. Les lunes de miel et premiers visiteurs préfèrent souvent 5–7 nuits pour mixer Stone Town, une visite épices et un stretch plage plus calme.',
      },
      {
        q: 'Quelle est la meilleure zone de plage à Zanzibar ?',
        a: 'Nungwi et Kendwa conviennent à la baignade et aux couchers de soleil sur la côte nord ; Paje et le sud-est excellent pour le kitesurf et une vibe plus détendue. Notre équipe fait correspondre la côte à votre saison, confort de marée et style d\'hôtel.',
      },
      {
        q: 'Puis-je combiner Serengeti avec Zanzibar ?',
        a: 'Oui — c\'est notre formule « Tanzanie complète » la plus demandée. Terminez les game drives au Serengeti ou Ngorongoro, puis volez via Arusha ou Kilimanjaro vers Zanzibar pour des jours de récupération plage.',
      },
      {
        q: 'Quelle est la meilleure période pour visiter Zanzibar ?',
        a: 'Les mois secs (environ juin–octobre et janvier–février) sont populaires pour les journées plage. Les périodes d\'intersaison peuvent signifier des tarifs plus doux. Associez le timing à notre guide meilleure période Tanzanie si vous poursuivez aussi la Grande Migration.',
      },
    ],
  },
  'dest-serengeti-national-park': {
    slug: 'serengeti-national-park',
    title: 'Guide safari parc national du Serengeti | Grande Migration | Tanzania Safari Magic',
    h1: 'Guide safari parc national du Serengeti',
    meta_description:
      'Planifiez un safari Serengeti avec Tanzania Safari Magic à Arusha. Plaines UNESCO, Grande Migration des gnous, grands félins, meilleure période par région, coûts et forfaits privés. Devis gratuit +255 695 108 009.',
    faqs: [
      {
        q: 'Où se trouve le parc national du Serengeti ?',
        a: 'Le parc national du Serengeti se situe dans le nord de la Tanzanie, au nord-ouest de Ngorongoro. Il couvre environ 14 763 km² de plaines, woodland et rivières, et borde le Maasai Mara kenyan au nord.',
      },
      {
        q: 'Le Serengeti est-il un site du patrimoine mondial UNESCO ?',
        a: 'Oui. Le Serengeti a été inscrit au patrimoine mondial UNESCO en 1981 pour ses paysages de savane exceptionnels et la Grande Migration des gnous, zèbres et gazelles.',
      },
      {
        q: 'Quelle est la meilleure période pour visiter le Serengeti pour la Grande Migration ?',
        a: 'Cela dépend de ce que vous voulez : mise bas (jan–mar) au sud Serengeti / Ndutu ; traversées Grumeti (mai–juin) dans le corridor ouest ; traversées de la rivière Mara (juil–oct) au nord du Serengeti. Seronera central est fort pour les prédateurs toute l\'année.',
      },
      {
        q: 'Combien de jours faut-il au Serengeti ?',
        a: 'La plupart des premiers hôtes restent 3–5 nuits au Serengeti (souvent dans un circuit nord de 6–8 jours avec Ngorongoro). Les voyages focus migration peuvent ajouter des nuits au nord ou au sud pour suivre les troupeaux.',
      },
      {
        q: 'Puis-je combiner Serengeti avec Ngorongoro ?',
        a: 'Oui — et nous le recommandons. Le Serengeti offre l\'échelle et le drame de la migration ; Ngorongoro offre une faune dense du cratère avec de fortes chances de rhinocéros noir. Demandez-nous un itinéraire combiné privé depuis Arusha.',
      },
    ],
  },
  'dest-ngorongoro-conservation-area': {
    slug: 'ngorongoro-conservation-area',
    title: 'Guide safari cratère du Ngorongoro | Circuits depuis Arusha | Tanzania Safari Magic',
    h1: 'Guide safari parc national du cratère du Ngorongoro',
    meta_description:
      'Planifiez un safari au cratère du Ngorongoro avec Tanzania Safari Magic à Arusha. Caldeira UNESCO, Big Five et rhinocéros noir, meilleure période, coûts, excursions d\'une journée et forfaits privés. Devis gratuit +255 695 108 009.',
    faqs: [
      {
        q: 'Où se trouve le cratère du Ngorongoro ?',
        a: 'Le cratère du Ngorongoro se situe dans le nord de la Tanzanie, dans la zone de conservation du Ngorongoro, à environ 180 km à l\'ouest d\'Arusha sur le circuit safari nord près du parc national du Serengeti.',
      },
      {
        q: 'Ngorongoro est-il un site du patrimoine mondial UNESCO ?',
        a: 'Oui. La zone de conservation du Ngorongoro a été inscrite au patrimoine mondial UNESCO en 1979 pour sa beauté naturelle, sa biodiversité, son archéologie (y compris la gorge d\'Olduvai) et la culture masaï vivante.',
      },
      {
        q: 'Quelle est la meilleure période pour visiter le cratère du Ngorongoro ?',
        a: 'Les mois secs de juin à octobre offrent généralement l\'observation la plus claire. Ngorongoro livre encore de fortes observations toute l\'année parce que de nombreux animaux restent à l\'intérieur de la caldeira.',
      },
      {
        q: 'Peut-on dormir à l\'intérieur du cratère du Ngorongoro ?',
        a: 'Les nuits ne sont pas autorisées sur le fond du cratère. Les hôtes dorment sur le rebord du cratère ou les hauts plateaux proches et descendent pour des game drives de jour avec un opérateur agréé.',
      },
      {
        q: 'Le cratère du Ngorongoro vaut-il la visite ?',
        a: 'Oui. La forte densité de faune dans une caldeira compacte rend les observations Big Five — y compris le rhinocéros noir — plus fiables que dans de nombreux grands parcs. C\'est un temps fort de presque chaque itinéraire du nord de la Tanzanie que nous construisons depuis Arusha.',
      },
    ],
  },
  'dest-mount-kilimanjaro-national-park': {
    slug: 'mount-kilimanjaro-national-park',
    title: 'Guide parc national du Kilimandjaro | Ascension et trek | Tanzania Safari Magic',
    h1: 'Parc national du Kilimandjaro — grimpez le plus haut sommet d\'Afrique',
    meta_description:
      'Grimpez le mont Kilimandjaro (5 895 m) avec Tanzania Safari Magic. Parc UNESCO, itinéraires Machame, Lemosho et Marangu, meilleure période, coûts, et combos safari + trek depuis Arusha. Devis gratuit.',
    faqs: [
      {
        q: 'Quelle est la hauteur du mont Kilimandjaro ?',
        a: 'Uhuru Peak sur Kibo culmine à 5 895 mètres (19 341 ft) — le point le plus haut d\'Afrique et la plus haute montagne isolée du monde. Le parc national du Kilimandjaro protège le sommet et la forêt montagnarde environnante.',
      },
      {
        q: 'Le Kilimandjaro est-il un site du patrimoine mondial UNESCO ?',
        a: 'Oui. L\'UNESCO a inscrit le parc national du Kilimandjaro en 1987 (critère vii) pour sa forme volcanique exceptionnelle, son sommet enneigé et son isolement au-dessus de la savane. Le parc couvre environ 75 575 ha après les extensions forestières.',
      },
      {
        q: 'Faut-il une expérience d\'alpinisme technique ?',
        a: 'Aucune corde ni compétence d\'alpinisme n\'est requise sur les itinéraires de trek standards — le Kilimandjaro est souvent appelé « l\'Everest de tout le monde ». La forme, une acclimatation lente et un guide agréé (obligatoire selon les règles TANAPA) comptent bien plus que l\'aptitude technique.',
      },
      {
        q: 'Quelle est la meilleure période pour gravir le Kilimandjaro ?',
        a: 'Les fenêtres sèches de pointe sont janvier–mi-mars et juin–octobre. Janvier–février a souvent des vues plus claires au sommet ; juillet–septembre est le plus fréquenté. Les grandes pluies d\'avril–mai et les petites pluies de novembre signifient des sentiers plus boueux et moins de grimpeurs.',
      },
      {
        q: 'Quel itinéraire Kilimandjaro est le meilleur ?',
        a: 'Machame (6–7 jours) est l\'itinéraire panoramique « Whiskey » le plus populaire. Lemosho / Northern Circuit (7–9 jours) offrent une meilleure acclimatation et des sentiers plus calmes. Marangu (5–6 jours) a l\'hébergement en refuges. Umbwe est plus raide et pour des trekkeurs en forme et expérimentés.',
      },
      {
        q: 'Puis-je combiner le Kilimandjaro avec un safari ?',
        a: 'Oui — et beaucoup d\'hôtes le font. Trekkez le Kilimandjaro d\'abord (ou après), puis ajoutez Serengeti, Ngorongoro, Tarangire, ou une extension plage à Zanzibar. Demandez à Tanzania Safari Magic à Arusha un itinéraire privé ascension + safari.',
      },
      {
        q: 'Où est le parc et comment y aller depuis Arusha ?',
        a: 'Le parc national du Kilimandjaro est dans la région du Kilimandjaro près de Moshi, à environ 300 km au sud de l\'équateur. Le siège du parc est à Marangu (~44 km de Moshi, ~86 km de l\'aéroport international du Kilimandjaro). Nous organisons les transferts depuis Arusha ou JRO.',
      },
    ],
  },
};

let written = 0;
for (const [fileBase, meta] of Object.entries(guides)) {
  let html = fs.readFileSync(path.join(workDir, `${fileBase}.fr.html`), 'utf8');
  html = html.replaceAll('${AUTHOR.whatsapp}', WA);
  // Also normalize any leftover variant WA texts to the required URL
  html = html.replace(
    /https:\/\/wa\.me\/255695108009\?text=[^"'\s]*/g,
    WA
  );

  const obj = { ...meta, html };
  // Preserve key order similar to EN: put html before faqs
  const ordered = {};
  for (const k of ['slug', 'title', 'meta_title', 'h1', 'meta_description', 'excerpt', 'category_name', 'html', 'faqs']) {
    if (obj[k] !== undefined) ordered[k] = obj[k];
  }

  const outPath = path.join(outDir, `${fileBase}.json`);
  fs.writeFileSync(outPath, JSON.stringify(ordered, null, 2) + '\n', 'utf8');
  written++;
  console.log('wrote', outPath);
}

console.log('files_written', written);

// Verify all parse
let ok = 0;
for (const f of Object.keys(guides)) {
  JSON.parse(fs.readFileSync(path.join(outDir, `${f}.json`), 'utf8'));
  ok++;
}
console.log('valid_json', ok);
