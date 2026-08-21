/**
 * Tanzania safari lodges by route / location.
 * Used on /accommodation and on every itinerary overnight block.
 */
(function (global) {
  'use strict';

  var REGIONS = [
    {
      id: 'arusha',
      name: 'Arusha',
      blurb: 'Gateway hotels before and after your northern-circuit safari — close to JRO and Arusha Airport.',
      image: '/images/optimized/arusha-national-park.webp',
      keywords: ['arusha', 'jro', 'kilimanjaro airport', 'moshi'],
      lodges: [
        {
          name: 'Gran Meliá Arusha',
          level: 'luxury',
          website: 'https://www.melia.com/en/hotels/tanzania/arusha/gran-melia-arusha',
          image: '/images/accommodation/gran-melia-arusha.webp',
          description: 'Five-star hotel on Simeon Road with Mount Meru views, spa, infinity pool and The Grill restaurant — a polished first or last night in Arusha between Kilimanjaro and the safari parks.'
        },
        {
          name: 'Four Points by Sheraton Arusha',
          level: 'luxury',
          website: 'https://www.marriott.com/en-us/hotels/jrofp-four-points-arusha/overview/',
          image: '/images/accommodation/four-points-by-sheraton-arusha.webp',
          description: 'Contemporary Marriott hotel in central Arusha with a pool, gym and reliable rooms — a practical luxury stop 45 minutes from Kilimanjaro International Airport.'
        },
        {
          name: 'Kibo Palace Hotel',
          level: 'luxury',
          website: 'https://www.kibopalacehotel.com/',
          description: 'Named after Kilimanjaro’s Kibo peak. A modern luxury hotel about 45 minutes from JRO and a short walk from Arusha’s business district, banking and hospitals.'
        },
        {
          name: 'Mount Meru Hotel',
          level: 'luxury',
          website: 'https://www.mountmeruhotel.co.tz/',
          image: '/images/accommodation/mount-meru-hotel.webp',
          description: '178 rooms and suites in landscaped gardens facing Mount Meru and the golf club, with two restaurants, a pool, gym and large meeting spaces. 45 minutes from JRO and 20 minutes from Arusha Airport.'
        },
        {
          name: 'Legendary Lodge',
          level: 'luxury',
          website: 'https://www.elewana.com/lodges/legendary-lodge',
          image: '/images/accommodation/legendary-lodge.webp',
          description: 'Twelve garden cottages on a century-old coffee estate at the foot of Mount Meru. Fireplaces, verandas and a garden spa make it a quiet safari start or end, about 15 minutes from Arusha Airport.'
        },
        {
          name: 'Ayo Sophia Wildlife Villa',
          level: 'luxury',
          website: 'https://ayosophia.com/',
          description: 'Private villa-style stay on Arusha’s outskirts with wildlife-garden grounds — a secluded alternative to town hotels for couples and small families arriving or departing safari.'
        },
        {
          name: 'Laba Mama Simba',
          level: 'mid',
          website: 'https://labamamasimba.com/',
          description: 'Warm mid-range lodge on the Arusha side of the northern circuit, used as a comfortable overnight before Tarangire or after the last park day.'
        },
        {
          name: 'Arusha Planet Lodge',
          level: 'mid',
          website: 'https://www.arushaplanetlodge.com/',
          description: 'Garden lodge in Arusha with ensuite rooms, a pool and easy road links to both airports — a well-priced first or last night on classic safaris.'
        },
        {
          name: 'Forest Hill Hotel',
          level: 'mid',
          website: 'https://www.foresthillarusha.com/',
          description: 'Hillside hotel above Arusha with forested grounds, a pool and mountain views — a calmer mid-range base than staying in the city centre.'
        },
        {
          name: 'Under the Shade Safari Lodge',
          level: 'mid',
          website: 'https://www.undertheshadesafarilodge.com/',
          description: 'Shaded garden lodge for safari arrivals and departures, with simple ensuite rooms and a relaxed atmosphere after a long flight into JRO.'
        },
        {
          name: 'Njiro Legacy Hotel',
          level: 'mid',
          website: 'https://njirolegacyhotel.com/',
          description: 'Mid-range hotel in Arusha’s Njiro area — convenient for shops and restaurants, and a practical overnight before the drive to Tarangire or Manyara.'
        }
      ]
    },
    {
      id: 'tarangire',
      name: 'Tarangire National Park',
      blurb: 'Baobab country — stay inside the park or on the wildlife corridor for early elephant game drives.',
      image: '/images/optimized/tarangire-national-park.webp',
      keywords: ['tarangire'],
      lodges: [
        {
          name: 'Tarangire Sopa Lodge',
          level: 'luxury',
          website: 'https://sopalodges.com/tarangire-sopa-lodge/',
          image: '/images/accommodation/tarangire-sopa-lodge.webp',
          description: '75-suite lodge inside Tarangire, built among rocky outcrops with elephant-inspired architecture, a circular island pool and frequent wildlife on the lawns. About 2.5 hours from Arusha or 20 minutes from Kuro airstrip.'
        },
        {
          name: 'Tarangire Safari Lodge',
          level: 'luxury',
          website: 'https://www.tarangiresafarilodge.com/',
          description: 'Family-owned since 1985, this classic lodge sits on a bluff with panoramic views over the Tarangire River — one of the park’s best locations for elephants and sunset game viewing from camp.'
        },
        {
          name: 'The Whisper Tarangire',
          level: 'luxury',
          website: 'https://thewhisper.co.tz/',
          description: 'Small luxury camp on the Tarangire wildlife corridor, designed for quiet nights and private game-drive access without the feel of a large hotel lodge.'
        },
        {
          name: 'Serian Tarangire Camp',
          level: 'luxury',
          website: 'https://www.acaciacollection.com/',
          description: 'Exclusive Acacia Collection / Serian camp in Tarangire country — intimate tents, guiding-led days and a bush setting aimed at travellers who want fewer rooms and more wilderness.'
        },
        {
          name: 'Kuro Treetops',
          level: 'luxury',
          website: 'https://www.nomad-tanzania.com/camps/kuro-treetops',
          description: 'Nomad Tanzania’s raised treetop camp in southern Tarangire. Sleep among baobabs with walkways above the bush — a remote, high-end stay close to Kuro airstrip.'
        },
        {
          name: 'Mpingo Ridge Camp',
          level: 'luxury',
          website: 'https://www.asiliaafrica.com/camps-lodges/mpingo-ridge/',
          description: 'Asilia’s ridge-top camp looking over Tarangire’s baobab woodland. Luxury tents, a pool and strong guiding — one of the park’s most scenic luxury bases.'
        },
        {
          name: 'Nyikani Tarangire Camp',
          level: 'mid',
          website: 'https://www.nyikanicamps.com/',
          description: 'Comfortable Nyikani tented camp on the Tarangire circuit — en-suite safari tents, communal dining and an easy game-drive start into elephant country.'
        },
        {
          name: 'Tarangire Elephant Springs',
          level: 'mid',
          website: 'https://karibucamps.com/',
          image: '/images/accommodation/tarangire-elephant-springs.webp',
          description: 'Karibu Camps property near natural springs used by elephants. Mid-range tents with a classic bush-camp layout for travellers who want wildlife close to camp.'
        },
        {
          name: "Ang'ata Tarangire",
          level: 'mid',
          website: 'https://angatacamps.com/',
          image: '/images/accommodation/angata-tarangire.webp',
          description: 'Ang’ata’s Tarangire camp combines canvas tents with ensuite bathrooms and a friendly mess tent — a reliable mid-range overnight on the northern circuit.'
        },
        {
          name: 'Siringit Tarangire Camp',
          level: 'mid',
          website: 'https://siringitcamps.com/',
          description: 'Tented camp on the Tarangire side of the circuit with a straightforward safari-camp feel — good for groups and classic two-night Tarangire stays.'
        },
        {
          name: 'Safari Haven Tarangire',
          level: 'mid',
          website: 'https://safarihaven.co.tz/',
          description: 'Safari Haven’s Tarangire camp: en-suite tents and a relaxed dining area, used as a mid-range alternative when park-inside lodges are full in peak season.'
        },
        {
          name: 'Tarangire Simba Lodge',
          level: 'mid',
          website: 'https://tarangiresimbalodge.com/',
          description: 'Lodge-style rooms near Tarangire with a pool and restaurant — a solid mid-range base when you want brick-and-mortar rooms rather than canvas.'
        },
        {
          name: 'Tarangire Greenland Retreat',
          level: 'mid',
          website: 'https://www.google.com/search?q=Tarangire+Greenland+Retreat',
          description: 'Quiet retreat-style camp on the Tarangire periphery, used for overflow nights and travellers who prefer a smaller, greener setting outside the busiest lodge belt.'
        },
        {
          name: 'Osunyai Lamarkau Private Camp',
          level: 'luxury',
          website: 'https://www.google.com/search?q=Osunyai+Lamarkau+Private+Camp+Tarangire',
          description: 'Private Tarangire camp for exclusive-use bookings — fewer tents, dedicated staff and a wilderness feel aimed at families or small groups who want the park to themselves.'
        }
      ]
    },
    {
      id: 'karatu',
      name: 'Karatu & Ngorongoro Highlands',
      blurb: 'Cool highland lodges between Tarangire, Lake Manyara and the crater — ideal for crater-eve overnights.',
      image: '/images/optimized/ngorongoro-conservation-area.webp',
      keywords: ['karatu', 'highlands', 'farm of dream', 'coffee lodge'],
      lodges: [
        {
          name: 'The Retreat at Ngorongoro',
          level: 'luxury',
          website: 'https://theretreatatngorongoro.com/',
          description: 'Luxury highland lodge above Karatu with spa facilities, refined rooms and cool-climate gardens — a restful night before the early crater descent.'
        },
        {
          name: 'Oldeani Ngorongoro Mountain Lodge',
          level: 'luxury',
          website: 'https://www.melia.com/en/hotels/tanzania/ngorongoro/oldeani-mountain-lodge',
          description: 'Meliá’s mountain lodge on the Oldeani highlands, with hotel-level rooms, dining and views toward the Ngorongoro forests — a five-star Karatu alternative to crater-rim properties.'
        },
        {
          name: 'Farm of Dreams Lodge',
          level: 'mid',
          website: 'https://www.farmofdreamslodge.com/',
          image: '/images/accommodation/farm-of-dreams-lodge.webp',
          description: 'Family-run farm lodge in Karatu with cottages in coffee and garden country. Hearty meals, a pool and a genuine highland welcome — a favourite mid-range crater-eve stay.'
        },
        {
          name: 'Bougainvillea Safari Lodge',
          level: 'mid',
          website: 'https://www.bougainvilleasafarilodge.com/',
          description: 'Karatu garden lodge named for its flowering grounds. Comfortable rooms, a pool and an easy drive to the Ngorongoro gate the next morning.'
        },
        {
          name: 'Marera Valley Lodge',
          level: 'mid',
          website: 'https://www.mareravalleylodge.com/',
          description: 'Valley lodge outside Karatu with spacious rooms, a pool and views over the highlands — a quiet mid-range base between Manyara and the crater.'
        },
        {
          name: 'Ngorongoro Coffee Lodge',
          level: 'mid',
          website: 'https://ngorongorocoffeelodge.com/',
          description: 'Coffee-estate lodge in the Karatu highlands. Rooms among the trees, farm-to-table dining and a practical location for crater day trips.'
        },
        {
          name: 'Karatu Simba Lodge',
          level: 'mid',
          website: 'https://karatusimbalodge.com/',
          image: '/images/accommodation/karatu-simba-lodge.webp',
          description: 'Straightforward 3-star lodge in Karatu town with ensuite rooms and a restaurant — a value overnight on the road between Tarangire and Ngorongoro.'
        }
      ]
    },
    {
      id: 'lake-manyara',
      name: 'Lake Manyara & Mto wa Mbu',
      blurb: 'Rift Valley lodges near Lake Manyara and the cultural town of Mto wa Mbu.',
      image: '/images/optimized/balloon.webp',
      keywords: ['manyara', 'mto wa mbu', 'mto wa', 'rift valley', 'maramboi', 'burunge'],
      lodges: [
        {
          name: 'Mawe Mawe Manyara Lodge',
          level: 'luxury',
          website: 'https://www.mawemawe.com/',
          description: 'Luxury Rift Valley lodge above Lake Manyara with stone-and-thatch architecture, a pool and escarpment views — a stylish night after tree-climbing lions and flamingos.'
        },
        {
          name: 'Maramboi Tented Lodge',
          level: 'luxury',
          website: 'https://www.tanganyikawildernesscamps.com/camps/maramboi-tented-lodge/',
          image: '/images/accommodation/maramboi-tented-lodge.webp',
          description: 'Tanganyika Wilderness Camps tented lodge on the wildlife corridor between Tarangire and Manyara. Large en-suite tents, a pool and frequent zebra and wildebeest on the plains in front of camp.'
        },
        {
          name: 'Burunge Tented Lodge',
          level: 'mid',
          website: 'https://www.burungetentedlodge.com/',
          description: 'Tented lodge overlooking Lake Burunge, west of Tarangire. Canvas rooms, a pool and sunset views — a popular mid-range link between Tarangire and the Rift Valley.'
        },
        {
          name: 'Africa Safari Rift Valley',
          level: 'mid',
          website: 'https://africasafaricamps.com/',
          description: 'Africa Safari Camps lodge in the Manyara / Mto wa Mbu area — practical rooms, a pool and a convenient stop on cultural visits and park days along the Rift.'
        },
        {
          name: 'Manyara Secret Lodge',
          level: 'mid',
          website: 'https://manyarasecret.com/',
          description: 'Smaller Manyara-area lodge with a quieter, hideaway feel — used when you want a mid-range night close to the lake without a large camp atmosphere.'
        }
      ]
    },
    {
      id: 'central-serengeti',
      name: 'Central Serengeti (Seronera)',
      blurb: 'Year-round wildlife in the Seronera Valley — the classic heart of a Tanzania safari.',
      image: '/images/optimized/serengeti-national-park.webp',
      keywords: ['central serengeti', 'seronera', 'serengeti'],
      lodges: [
        {
          name: 'Four Seasons Safari Lodge Serengeti',
          level: 'luxury',
          website: 'https://www.fourseasons.com/serengeti/',
          image: '/images/accommodation/four-seasons-safari-lodge-serengeti.webp',
          description: 'Iconic luxury lodge on elevated walkways beside an active watering hole in central Serengeti. Infinity pool, spa, balloon safaris and suites where elephants often drink at dawn below your balcony.'
        },
        {
          name: 'Meliá Serengeti Lodge',
          level: 'luxury',
          website: 'https://www.melia.com/en/hotels/tanzania/serengeti/melia-serengeti-lodge',
          description: 'Full-service Meliá lodge in the Seronera area with hotel rooms, restaurants, a pool and spa — five-star comfort in the year-round wildlife heart of the park.'
        },
        {
          name: 'Serengeti Serena Safari Lodge',
          level: 'luxury',
          website: 'https://www.serenahotels.com/serengeti',
          description: 'Hilltop Serena lodge with thatched rondavels looking over the central Serengeti plains. A classic luxury stay with a pool, restaurant and easy access to Seronera game drives.'
        },
        {
          name: 'Elewana Serengeti Pioneer Camp',
          level: 'luxury',
          website: 'https://www.elewana.com/lodges/serengeti-pioneer-camp',
          image: '/images/accommodation/elewana-serengeti-pioneer-camp.webp',
          description: 'Elewana’s tented pioneer camp on a rocky kopje in central Serengeti. Explorer-era décor, luxury canvas and superb views — a characterful alternative to large hotel lodges.'
        },
        {
          name: 'Signature Luxury Serengeti Tented Camp',
          level: 'luxury',
          website: 'https://www.signatureluxurycollection.com/',
          description: 'Luxury tented camp in the Seronera region with spacious canvas suites and a high staff-to-guest ratio — built for travellers who want five-star tents rather than a hotel block.'
        },
        {
          name: 'Nyota Luxury Lodge',
          level: 'luxury',
          website: 'https://nyotalodge.com/',
          image: '/images/accommodation/nyota-luxury-lodge.webp',
          description: 'Nyota (“star”) luxury lodge in the Serengeti with stylish rooms, a pool and night-sky viewing — a boutique overnight in big-cat country.'
        },
        {
          name: 'Into Wild Africa Safari Lodge',
          level: 'mid',
          website: 'https://intowild.africa/',
          description: 'Mid-range safari lodge aimed at classic Serengeti game-drive days — ensuite rooms or tents, communal meals and a practical Seronera-area location.'
        },
        {
          name: 'Safari Haven Camp',
          level: 'mid',
          website: 'https://safarihaven.co.tz/',
          description: 'Safari Haven’s central Serengeti camp: comfortable tents, bush dining and a friendly campfire atmosphere for mid-range itineraries.'
        },
        {
          name: 'Friend of Serengeti Camp',
          level: 'mid',
          website: 'https://www.google.com/search?q=Friend+Serengeti+Camp',
          description: 'Smaller tented camp in the central Serengeti used as a value overnight when larger lodges are booked out in peak migration months.'
        },
        {
          name: 'Mbuni Serengeti Camp',
          level: 'mid',
          website: 'https://www.google.com/search?q=Mbuni+Serengeti+Camp',
          description: 'Mbuni (ostrich) tented camp on the central plains — a simple, well-placed mid-range base for Seronera lions, leopards and year-round resident game.'
        }
      ]
    },
    {
      id: 'northern-serengeti',
      name: 'Northern Serengeti & Mara River',
      blurb: 'Remote camps near the Mara River for July–October crossings and quiet big-cat country.',
      image: '/images/optimized/8-day-northern-serengeti-mara-river-crossing.webp',
      keywords: ['northern serengeti', 'mara river', 'kogatende', 'lamai'],
      directory: 'https://www.africanmeccasafaris.com/travel-guide/tanzania/accommodation/serengeti/northern',
      lodges: [
        {
          name: 'Serengeti Ark Safari Lodge',
          level: 'luxury',
          website: 'https://www.google.com/search?q=Serengeti+Ark+Safari+Lodge',
          description: 'Luxury northern Serengeti lodge positioned for the July–October Mara River season, with hotel-style rooms and short drives to crossing viewpoints.'
        },
        {
          name: 'Malaika Luxury Lodge',
          level: 'luxury',
          website: 'https://www.google.com/search?q=Malaika+Luxury+Lodge+Serengeti',
          description: 'Malaika (“angel”) luxury lodge in the far north — spacious rooms, a pool and a remote setting for migration crossings and quiet big-cat country.'
        },
        {
          name: 'Mara Mara Tented Lodge',
          level: 'luxury',
          website: 'https://maramaratentedlodge.com/',
          description: 'Tented luxury lodge near the Mara River and Kogatende. Designed around the crossing season, with ensuite canvas suites and river-proximity game drives.'
        },
        {
          name: 'Safari Haven Migration Camp',
          level: 'mid',
          website: 'https://safarihaven.co.tz/',
          description: 'Mobile-style Safari Haven camp that follows the northern migration. Mid-range tents close to the herds when they mass on the Mara River in the dry season.'
        },
        {
          name: 'Tanzania Bush Camp',
          level: 'mid',
          website: 'https://www.google.com/search?q=Tanzania+Bush+Camp+Serengeti',
          description: 'Classic bush camp in the northern Serengeti — canvas, campfire dining and a no-frills wilderness overnight for travellers chasing the crossings on a mid-range budget.'
        },
        {
          name: 'Serengeti Mara River Camp',
          level: 'mid',
          website: 'https://www.google.com/search?q=Serengeti+Mara+River+Camp',
          description: 'Tented camp within reach of the Mara River crossings. A practical mid-range base for July–October, with early starts to the main crossing points.'
        },
        {
          name: 'Nyikani Migration Camp',
          level: 'mid',
          website: 'https://www.nyikanicamps.com/',
          description: 'Nyikani’s seasonal migration camp in the north. Comfortable tents and a camp layout that moves with (or near) the herds during river-crossing months.'
        }
      ]
    },
    {
      id: 'southern-serengeti',
      name: 'Southern Serengeti & Ndutu',
      blurb: 'Calving-season camps (December–March) on the Ndutu plains and southern short-grass country.',
      image: '/images/optimized/serengeti-national-park.webp',
      keywords: ['ndutu', 'southern serengeti', 'calving'],
      directory: 'https://www.africanmeccasafaris.com/travel-guide/tanzania/accommodation/serengeti/southern',
      lodges: [
        {
          name: 'Ndutu Safari Lodge',
          level: 'luxury',
          website: 'https://www.ndutu.com/',
          description: 'Long-established lodge on the Ndutu woodlands, famous with photographers in calving season (December–March). Stone cottages, a pool and resident wildlife on the soda-lake plains.'
        },
        {
          name: 'Lake Masek Tented Lodge',
          level: 'luxury',
          website: 'https://www.tanganyikawildernesscamps.com/',
          description: 'Tanganyika Wilderness Camps tented lodge beside Lake Masek in the Ndutu area. Large tents, a pool and front-row access to the southern calving grounds in green season.'
        },
        {
          name: 'Ang\'ata Ndutu Camp',
          level: 'mid',
          website: 'https://angatacamps.com/',
          image: '/images/accommodation/angata-ndutu-camp.webp',
          description: 'Seasonal Ang’ata camp on the Ndutu plains. Mid-range en-suite tents for the wildebeest calving and predator action from December through March.'
        },
        {
          name: 'Nyikani Ndutu Camp',
          level: 'mid',
          website: 'https://www.nyikanicamps.com/',
          description: 'Nyikani’s Ndutu camp for the southern short-grass season — comfortable canvas, communal meals and game drives among thousands of newborn wildebeest.'
        }
      ]
    },
    {
      id: 'western-serengeti',
      name: 'Western Serengeti',
      blurb: 'Grumeti and western corridor camps for the May–July river crossings and quieter plains.',
      image: '/images/optimized/serengeti-national-park.webp',
      keywords: ['western serengeti', 'grumeti'],
      directory: 'https://www.africanmeccasafaris.com/travel-guide/tanzania/accommodation/serengeti/western',
      lodges: [
        {
          name: 'andBeyond Grumeti Serengeti Tented Camp',
          level: 'luxury',
          website: 'https://www.andbeyond.com/places-to-stay/africa/tanzania/serengeti-national-park/andbeyond-grumeti-serengeti-river-lodge/',
          image: '/images/accommodation/andbeyond-grumeti-serengeti-tented-camp.webp',
          description: 'andBeyond’s luxury tented camp on the Grumeti River in the western corridor. Intimate tents, exceptional guiding and a prime seat for the May–July river crossings.'
        },
        {
          name: 'Mbalageti Serengeti',
          level: 'luxury',
          website: 'https://www.mbalageti.com/',
          description: 'Hilltop lodge in the western Serengeti with thatched suites, a pool and wide views over the Mbalageti valley — a comfortable luxury base away from the central crowds.'
        },
        {
          name: 'Serengeti Safari Camp',
          level: 'mid',
          website: 'https://www.google.com/search?q=Western+Serengeti+safari+camp',
          description: 'Mid-range tented camp in the western corridor, used for Grumeti-season itineraries when you want canvas closer to the herds without a five-star price.'
        }
      ]
    },
    {
      id: 'ngorongoro',
      name: 'Ngorongoro Crater Rim',
      blurb: 'Rim lodges for the shortest descent into the crater — or nearby highland camps with crater views.',
      image: '/images/optimized/ngorongoro-conservation-area.webp',
      keywords: ['ngorongoro', 'crater rim', 'crater'],
      lodges: [
        {
          name: 'Ngorongoro Serena Safari Lodge',
          level: 'luxury',
          website: 'https://www.serenahotels.com/ngorongoro',
          image: '/images/accommodation/ngorongoro-serena-safari-lodge.webp',
          description: 'Built into the crater rim itself, Serena’s rooms look down into Ngorongoro. The shortest possible descent at dawn, a heated property in the highland cold, and one of Tanzania’s most famous lodge views.'
        },
        {
          name: 'Meliá Ngorongoro Lodge',
          level: 'luxury',
          website: 'https://www.melia.com/en/hotels/tanzania/ngorongoro/melia-ngorongoro-lodge',
          description: 'Meliá luxury lodge on the Ngorongoro highlands with hotel amenities, spa-level comfort and a crater-access location — a five-star alternative to the classic rim hotels.'
        },
        {
          name: 'Ngorongoro Crater Rim Lodge',
          level: 'luxury',
          website: 'https://www.google.com/search?q=Ngorongoro+Crater+Rim+Lodge',
          description: 'Luxury stay on or just off the crater rim, positioned for an early descent into the caldera. Expect highland temperatures, crater views and a quiet night before a full day on the crater floor.'
        },
        {
          name: "Ang'ata Ngorongoro Camp",
          level: 'mid',
          website: 'https://angatacamps.com/',
          image: '/images/accommodation/angata-ngorongoro-camp.webp',
          description: 'Ang’ata’s Ngorongoro-area tented camp — en-suite canvas in the highlands, a practical mid-range night when rim hotels are full or priced for peak season.'
        },
        {
          name: 'Embalakai Ngorongoro Camp',
          level: 'luxury',
          website: 'https://www.embalakai.com/',
          description: 'Embalakai’s luxury tented camp near Ngorongoro with spacious suites, a refined mess tent and a wilderness setting — crater days without sleeping in a large hotel block.'
        },
        {
          name: 'Ngorongoro Tortilis Camp',
          level: 'mid',
          website: 'https://www.tanganyikawildernesscamps.com/camps/ngorongoro-tortilis-camp/',
          description: 'Tanganyika Wilderness Camps tented camp named for the umbrella acacias. Mid-range to upper-mid canvas, a pool and a convenient highland location for crater game drives.'
        },
        {
          name: 'Nabi Baobab Luxury Lodge',
          level: 'luxury',
          website: 'https://www.google.com/search?q=Nabi+Baobab+Luxury+Lodge+Ngorongoro',
          description: 'Luxury lodge in the Ngorongoro highlands with baobab-country architecture — a boutique overnight combining crater access with a quieter, design-led stay.'
        },
        {
          name: 'Hhando Coffee Lodge',
          level: 'mid',
          website: 'https://hhandocoffeelodge.com/',
          image: '/images/accommodation/hhando-coffee-lodge.webp',
          description: 'Coffee-farm lodge on the Karatu / Ngorongoro side. Garden rooms, estate tours and a cooler climate — a friendly mid-range night before or after the crater.'
        }
      ]
    },
    {
      id: 'lake-natron',
      name: 'Lake Natron',
      blurb: 'Rift Valley camps beneath Ol Doinyo Lengai — flamingos, waterfalls and volcano landscapes.',
      image: '/images/experience/ol-doinyo-lengai-volcano.webp',
      keywords: ['natron', 'lengai', 'ol doinyo', 'oldonyo'],
      lodges: [
        {
          name: 'Lake Natron Tented Camp',
          level: 'mid',
          website: 'https://www.google.com/search?q=Lake+Natron+Tented+Camp',
          description: 'Tented camp on the Lake Natron flats beneath Ol Doinyo Lengai. Basic-to-comfortable canvas for flamingo walks, waterfalls and an optional night ascent of the volcano.'
        },
        {
          name: 'Africa Safari Lake Natron',
          level: 'mid',
          website: 'https://africasafaricamps.com/',
          description: 'Africa Safari Camps property at Lake Natron — rooms or tents with a pool, used on cultural and landscape itineraries that add Lengai and the soda lake to the northern circuit.'
        },
        {
          name: 'Ngare Sero Lake Natron Camp',
          level: 'luxury',
          website: 'https://www.google.com/search?q=Ngare+Sero+Lake+Natron',
          description: 'Ngare Sero’s Natron camp: a more comfortable, lodge-quality stay on the alkaline lake, with guiding for flamingos, waterfalls and the Rift Valley escarpment.'
        }
      ]
    },
    {
      id: 'lake-eyasi',
      name: 'Lake Eyasi',
      blurb: 'Quiet cultural camps for Hadzabe and Datoga visits on the Rift Valley floor.',
      image: '/images/experience/glad-of-africa-guides.webp',
      keywords: ['eyasi', 'hadzabe', 'datoga'],
      lodges: [
        {
          name: 'Kisima Ngeda Tented Camp',
          level: 'mid',
          website: 'https://www.google.com/search?q=Kisima+Ngeda+Lake+Eyasi',
          description: 'Palm-shaded tented camp on Lake Eyasi, long used as the base for Hadzabe hunter-gatherer walks and Datoga blacksmith visits on the Rift Valley floor.'
        },
        {
          name: 'Tindiga Tented Camp',
          level: 'mid',
          website: 'https://www.google.com/search?q=Tindiga+Tented+Camp+Eyasi',
          description: 'Simple tented camp near Lake Eyasi for cultural overnights — an early start with Hadzabe communities and a quiet night away from the main park lodges.'
        }
      ]
    }
  ];

  var REGION_BY_ID = {};
  REGIONS.forEach(function (r) {
    REGION_BY_ID[r.id] = r;
  });

  function inferRegion(title, description, accommodation) {
    var text = [title, description, accommodation]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!text) return null;

    var ordered = [
      'lake-natron',
      'lake-eyasi',
      'northern-serengeti',
      'southern-serengeti',
      'western-serengeti',
      'central-serengeti',
      'tarangire',
      'lake-manyara',
      'karatu',
      'ngorongoro',
      'arusha'
    ];
    for (var i = 0; i < ordered.length; i++) {
      var region = REGION_BY_ID[ordered[i]];
      if (!region) continue;
      for (var k = 0; k < region.keywords.length; k++) {
        if (text.indexOf(region.keywords[k]) !== -1) return region;
      }
    }
    return null;
  }

  function lodgesFor(region, opts) {
    opts = opts || {};
    var list = (region && region.lodges) || [];
    var luxury = list.filter(function (l) { return l.level === 'luxury'; });
    var mid = list.filter(function (l) { return l.level !== 'luxury'; });
    var combo = [];
    var li = 0;
    var mi = 0;
    while (combo.length < (opts.limit || 4) && (li < luxury.length || mi < mid.length)) {
      if (li < luxury.length) combo.push(luxury[li++]);
      if (combo.length >= (opts.limit || 4)) break;
      if (mi < mid.length) combo.push(mid[mi++]);
    }
    return combo;
  }

  function lodgeImage(lodge, region) {
    return (lodge && lodge.image) || (region && region.image) || '';
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderOvernight(item, t, escapeHtml) {
    var escape = escapeHtml || esc;
    var tr = typeof t === 'function' ? t : function (k) { return k; };
    var region = inferRegion(item.title, item.description, item.accommodation);
    var lodges = region ? lodgesFor(region, { limit: 4 }) : [];
    var html = '<div class="itin-stay">';
    html += '<div class="itin-stay-label"><i class="fas fa-bed"></i> ' + escape(tr('accom.overnight')) + '</div>';
    if (item.accommodation) {
      html += '<p class="itin-stay-named">' + escape(item.accommodation) + '</p>';
    } else if (region) {
      html += '<p class="itin-stay-named">' + escape(tr('accom.overnightIn')) + ' ' + escape(region.name) + '</p>';
    }
    if (lodges.length) {
      html += '<p class="itin-stay-note">' + escape(tr('accom.comboNote')) + '</p>';
      html += '<ul class="itin-stay-lodges">';
      lodges.forEach(function (lodge) {
        var level = lodge.level === 'luxury' ? tr('accom.luxury') : tr('accom.midrange');
        html +=
          '<li><a href="' +
          escape(lodge.website) +
          '" target="_blank" rel="noopener noreferrer">' +
          escape(lodge.name) +
          '</a> <span class="itin-stay-level">' +
          escape(level) +
          '</span></li>';
      });
      html += '</ul>';
      if (region) {
        html +=
          '<a class="itin-stay-all" href="/accommodation#' +
          escape(region.id) +
          '">' +
          escape(tr('accom.seeAllIn')) +
          ' ' +
          escape(region.name) +
          ' →</a>';
      }
    }
    html += '</div>';
    return html;
  }

  global.TSM_ACCOM = {
    REGIONS: REGIONS,
    inferRegion: inferRegion,
    lodgesFor: lodgesFor,
    lodgeImage: lodgeImage,
    renderOvernight: renderOvernight
  };
})(typeof window !== 'undefined' ? window : globalThis);
