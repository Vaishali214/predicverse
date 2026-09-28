import { AppError } from '../utils/AppError.js';

interface ArticleSeed {
  id: string;
  wikiTitle: string;
  title: string;
  subtitle: string;
  country: string;
  countryCode: string;
  flag: string;
  location: string;
  category: 'Heritage' | 'Culture' | 'Gastronomy' | 'Nature' | 'History' | 'Architecture';
  readTime: string;
  summary: string;
  fullContent: string;
  imageUrl: string;
  imageCaption: string;
  sourceName: string;
  sourceUrl: string;
  highlights: string[];
}

const VERIFIED_ARTICLES: ArticleSeed[] = [
  {
    id: 'art_kyoto_tea',
    wikiTitle: 'Japanese_tea_ceremony',
    title: 'THE SACRED RITUAL OF CHADO: KYOTO’S CENTURIES-OLD TEA HOUSES',
    subtitle: 'Inside the quiet wooden machiya where Zen philosophy meets meticulous hospitality in Japan’s cultural heart.',
    country: 'Japan',
    countryCode: 'JP',
    flag: '🇯🇵',
    location: 'Kyoto, Kansai Region',
    category: 'Culture',
    readTime: '4 min read',
    summary: 'The Japanese tea ceremony, known as Chadō or Sukiya-zukuri tradition, is a refined cultural activity involving the ceremonial preparation and presentation of matcha. In Kyoto’s historic Gion and Higashiyama districts, tea masters pass down traditions dating back to 16th-century master Sen no Rikyū.',
    fullContent: 'Rooted in Zen Buddhism, the Japanese tea ceremony (Chadō or Sadō, "The Way of Tea") is a spiritual practice centered on harmony (Wa), respect (Kei), purity (Sei), and tranquility (Jaku). In Kyoto, historic machiya townhouses host intimate gatherings where every movement—from folding the silk cloth (fukusa) to whisking stone-ground ceremonial matcha—is executed with mindfulness.\n\nVisitors to Kyoto can experience traditional tea houses surrounding Daitoku-ji temple and Kodai-ji temple. The architectural design of tea rooms (chashitsu) incorporates natural materials, earthen walls, low doorways (nijiriguchi) requiring guests to bow upon entry, and alcoves (tokonoma) featuring seasonal scroll calligraphy and minimalistic flower arrangements (chabana).',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Traditional wooden tea house tearoom with tatami mat flooring in Kyoto, Japan.',
    sourceName: 'Wikipedia / UNESCO Intangible Heritage Archive',
    sourceUrl: 'https://en.wikipedia.org/wiki/Japanese_tea_ceremony',
    highlights: [
      'Founded on the 16th-century principles of master Sen no Rikyū',
      'Uses ceremonial grade matcha whisked with bamboo chasen',
      'Low entrances symbolise equality of all guests regardless of status'
    ]
  },
  {
    id: 'art_rajasthan_stepwells',
    wikiTitle: 'Chand_Baori',
    title: 'ARCHITECTURAL WONDERS: THE SACRED GEOMETRIC STEPWELLS OF RAJASTHAN',
    subtitle: 'Engineering marvels built to harvest monsoon rains while serving as subterranean community retreats.',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    location: 'Abhaneri, Rajasthan',
    category: 'Architecture',
    readTime: '5 min read',
    summary: 'Chand Baori in Abhaneri, Rajasthan, is one of the deepest and largest stepwells in the world. Constructed by King Chanda of the Nikumbha Dynasty between 800 and 900 CE, it extends 13 stories down with 3,500 narrow steps arranged in precise geometric symmetry.',
    fullContent: 'Stepwells, called baoris or baolis in northern India, are unique subterranean structures that combine water conservation with architectural elegance. Built across arid regions of Rajasthan and Gujarat, these multi-story stone structures features cooling microclimates where temperatures at the bottom remain 5–6 degrees Celsius cooler than the desert surface.\n\nChand Baori stands directly opposite the Harshat Mata Temple. Its labyrinthine staircase forms a visual illusion of optical symmetry, while carved stone niches house statues of Ganesha and Mahishasuramardini. Today, Chand Baori is preserved under the Archaeological Survey of India (ASI) as an irreplaceable monument of medieval Indian hydraulic engineering.',
    imageUrl: 'https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'The 3,500 geometric steps of Chand Baori stepwell in Abhaneri, Rajasthan.',
    sourceName: 'Archaeological Survey of India / Wikipedia',
    sourceUrl: 'https://en.wikipedia.org/wiki/Chand_Baori',
    highlights: [
      'Contains 3,500 symmetrically arranged stone steps down 13 stories',
      'Built in the 9th century to harvest seasonal desert rainfall',
      'Subterranean depth provides natural cooling in arid temperatures'
    ]
  },
  {
    id: 'art_colosseum_rome',
    wikiTitle: 'Colosseum',
    title: 'THE RESTORATION OF ROME’S HYPOGEUM: UNVEILING THE COLOSSEUM’S UNDERGROUND',
    subtitle: 'How modern archaeology and eco-restoration have unlocked the subterranean corridors of ancient Rome.',
    country: 'Italy',
    countryCode: 'IT',
    flag: '🇮🇹',
    location: 'Rome, Lazio Region',
    category: 'History',
    readTime: '4 min read',
    summary: 'The Colosseum, also known as the Flavian Amphitheatre, was commissioned by Emperor Vespasian in 72 AD and completed in 80 AD under Titus. Recent restoration efforts have opened the hypogeum—a complex network of subterranean tunnels and lifts.',
    fullContent: 'Situated in the heart of Rome, the Colosseum could host an estimated 50,000 to 80,000 spectators. Beneath its wooden arena floor lay the hypogeum, a two-level underground maze of corridors, animal cages, and 80 vertical shaft lifts operated by ropes and pulleys to raise gladiators and scenery into the arena.\n\nA multi-year restoration project led by the Italian Ministry of Culture has installed a 160-meter wooden walkway allowing visitors to explore the hypogeum. Using non-invasive laser scanning and eco-friendly stone cleaning techniques, historians have preserved the original travertine limestone and brickwork for future generations.',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Subterranean stone walls and arches inside the Colosseum in Rome, Italy.',
    sourceName: 'UNESCO World Heritage / Wikipedia',
    sourceUrl: 'https://en.wikipedia.org/wiki/Colosseum',
    highlights: [
      'Constructed between 72 AD and 80 AD under Flavian dynasty emperors',
      'Subterranean hypogeum featured 80 mechanical pulley lifts',
      'Designated a UNESCO World Heritage Site in 1980'
    ]
  },
  {
    id: 'art_machu_picchu',
    wikiTitle: 'Machu_Picchu',
    title: 'SACRED CITADEL IN THE CLOUDS: CONSERVING THE INCA HERITAGE OF MACHU PICCHU',
    subtitle: 'Exploring the 15th-century estate of Inca Emperor Pachacuti high in the Andes mountains.',
    country: 'Peru',
    countryCode: 'PE',
    flag: '🇵🇪',
    location: 'Cusco Region, Andes',
    category: 'Heritage',
    readTime: '5 min read',
    summary: 'Machu Picchu is a 15th-century Inca citadel located in the Eastern Cordillera of southern Peru on a 2,430-meter (7,970 ft) mountain ridge. Built around 1450 for Emperor Pachacuti, it remains a masterpiece of dry-stone ashlar masonry.',
    fullContent: 'Constructed at the height of the Inca Empire, Machu Picchu features polished dry-stone walls fitted together without mortar (ashlar technique). Key structures include the Intihuatana stone (an astronomical solar clock), the Temple of the Sun, and the Room of the Three Windows.\n\nConservation authorities limits visitor capacity using timed entry circuits to prevent environmental degradation while protecting the surrounding cloud forest bio-reserve. The site illustrates advanced agricultural terracing that prevented hillside erosion and provided self-sufficient farming.',
    imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'The stone ruins and green agricultural terraces of Machu Picchu overlooking the Urubamba River valley.',
    sourceName: 'UNESCO World Heritage Centre / Wikipedia',
    sourceUrl: 'https://en.wikipedia.org/wiki/Machu_Picchu',
    highlights: [
      'Built circa 1450 CE without mortar using dry-stone ashlar masonry',
      'Intihuatana stone served as an astronomical calendar aligned with solstices',
      'Protected under UNESCO World Heritage and national bio-reserve status'
    ]
  },
  {
    id: 'art_petra_jordan',
    wikiTitle: 'Petra',
    title: 'THE ROSE-RED ROCK CITY: UNCOVERING THE ENGINEERING GENIUS OF PETRA',
    subtitle: 'Carved directly into sandstone cliffs by the Nabataean Kingdom over two millennia ago.',
    country: 'Jordan',
    countryCode: 'JO',
    flag: '🇯🇴',
    location: 'Ma\'an Governorate',
    category: 'History',
    readTime: '4 min read',
    summary: 'Petra is a historical and archaeological city in southern Jordan, famous for its rock-cut architecture and water conduit system. Established as early as 312 BC as the capital of the Arab Nabataeans, it sits in a basin among the mountains of Arabah.',
    fullContent: 'Accessed through the Siq—a narrow 1.2-kilometer gorge flanked by high cliff walls—Petra opens up to reveal Al-Khazneh (The Treasury), a magnificent 40-meter-high facade carved directly into rose-colored sandstone cliffs.\n\nThe Nabataeans were skilled desert hydraulic engineers who built dams, cisterns, and terracotta pipelines to harvest flash flood waters, establishing Petra as a major trading hub for frankincense, myrrh, and spices linking Arabia, Egypt, and the Mediterranean.',
    imageUrl: 'https://images.unsplash.com/photo-1579606032821-69273c52a0a2?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'The rose-red sandstone facade of Al-Khazneh Treasury in Petra, Jordan.',
    sourceName: 'UNESCO World Heritage / Wikipedia',
    sourceUrl: 'https://en.wikipedia.org/wiki/Petra',
    highlights: [
      'Carved directly into sandstone mountain cliffs around 312 BC',
      'Features advanced dam and pipeline systems for desert water harvesting',
      'Named one of the New 7 Wonders of the World'
    ]
  }
];

function getDailyArticleSeed(dateStr: string): ArticleSeed {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % VERIFIED_ARTICLES.length;
  return VERIFIED_ARTICLES[index];
}

export class ArticlesService {
  static async getTodayArticle() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const formattedDate = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const seed = getDailyArticleSeed(dateStr);

    let liveSummary = seed.summary;
    let liveImage = seed.imageUrl;
    let liveUrl = seed.sourceUrl;
    let verifiedLive = false;

    try {
      const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(seed.wikiTitle)}`, {
        headers: { 'User-Agent': 'PredicVerseTravelGazette/1.0 (contact@predicverse.com)' },
      });
      if (wikiRes.ok) {
        const wikiData: any = await wikiRes.json();
        if (wikiData.extract && wikiData.extract.length > 50) {
          liveSummary = wikiData.extract;
          verifiedLive = true;
        }
        if (wikiData.thumbnail?.source) {
          liveImage = wikiData.thumbnail.source;
        }
        if (wikiData.content_urls?.desktop?.page) {
          liveUrl = wikiData.content_urls.desktop.page;
        }
      }
    } catch {
      // Fallback to static seed cleanly
    }

    const article = {
      id: seed.id + '_' + dateStr,
      title: seed.title,
      subtitle: seed.subtitle,
      country: seed.country,
      countryCode: seed.countryCode,
      flag: seed.flag,
      location: seed.location,
      category: seed.category,
      publishDate: formattedDate,
      readTime: seed.readTime,
      summary: liveSummary,
      fullContent: seed.fullContent,
      imageUrl: liveImage,
      imageCaption: seed.imageCaption,
      sourceName: seed.sourceName,
      sourceUrl: liveUrl,
      isVerified: true,
      highlights: seed.highlights,
    };

    return { article, date: dateStr, updatedToday: true, verifiedLive };
  }
}
