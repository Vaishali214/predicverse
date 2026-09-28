export interface CulturalIntelligenceData {
  country: string;
  greetings: string[];
  etiquette: string[];
  dressCode: string;
  tippingCustoms: string;
  mistakesToAvoid: string[];
  usefulPhrases: Array<{ phrase: string; translation: string; pronunciation: string }>;
}

const CULTURAL_DATA: Record<string, CulturalIntelligenceData> = {
  japan: {
    country: 'Japan',
    greetings: [
      'Bow slightly when greeting (15° for informal, 30° for polite)',
      'Say "Konnichiwa" (Hello) during daytime or "Arigatou gozaimasu" (Thank you very much)',
    ],
    etiquette: [
      'Remove shoes before entering homes, ryokan inns, or temples (slippers are usually provided)',
      'Never walk while eating or drinking in public; eat near the shop or vending machine',
      'Keep your voice low on public transit; set phone to silent ("Manner Mode")',
    ],
    dressCode: 'Neat, modest clothing. Cover tattoos when entering public bathhouses (onsen).',
    tippingCustoms: 'Tipping is NOT customary and can be considered rude. Exceptional service is built into prices.',
    mistakesToAvoid: [
      'Sticking chopsticks vertically into a bowl of rice (resembles funeral rites)',
      'Passing food directly chopstick-to-chopstick',
      'Blowing your nose loudly in public places',
    ],
    usefulPhrases: [
      { phrase: 'Sumimasen', translation: 'Excuse me / Sorry', pronunciation: 'soo-mee-mah-sen' },
      { phrase: 'Arigatou gozaimasu', translation: 'Thank you very much', pronunciation: 'ah-ree-gah-too go-zah-ee-mas' },
      { phrase: 'Kore wo kudasai', translation: 'Please give me this', pronunciation: 'koh-reh woh koo-dah-sigh' },
    ],
  },
  india: {
    country: 'India',
    greetings: [
      'Join palms at chest level and say "Namaste"',
      'Use right hand for giving, receiving, or eating food',
    ],
    etiquette: [
      'Remove shoes before entering religious shrines, temples, or private homes',
      'Dress respectfully at religious sites with shoulders and knees covered',
      'Ask permission before photographing people or temple interiors',
    ],
    dressCode: 'Conservative attire is appreciated, especially in rural areas and places of worship.',
    tippingCustoms: 'Tipping 7-10% at casual restaurants and 10% at fine dining is appreciated.',
    mistakesToAvoid: [
      'Using the left hand for eating or handing items to others',
      'Pointing soles of your shoes or feet directly at people or deity statues',
      'Public displays of affection in conservative regions',
    ],
    usefulPhrases: [
      { phrase: 'Namaste', translation: 'Hello / Respectful Greeting', pronunciation: 'nah-mas-tay' },
      { phrase: 'Dhanyavaad', translation: 'Thank you', pronunciation: 'dhan-yuh-vaad' },
      { phrase: 'Yeh kitne ka hai?', translation: 'How much is this?', pronunciation: 'yeh kit-nay kah hai' },
    ],
  },
  france: {
    country: 'France',
    greetings: [
      'Always start interactions with a warm "Bonjour, Madame/Monsieur"',
      'Light cheek kisses ("la bise") between acquaintances',
    ],
    etiquette: [
      'Greet shopkeepers when entering and say "Au revoir" when leaving',
      'Keep hands visible on the dining table (wrists resting on table, not elbows)',
      'Avoid rushing meals; dining is an appreciated social ritual',
    ],
    dressCode: 'Smart-casual elegance. Avoid athletic gym wear outside active sports.',
    tippingCustoms: 'Service is included ("Service Compris"). Leaving small change or 5% is customary for great service.',
    mistakesToAvoid: [
      'Calling waiters "Garçon" (outdated and rude)',
      'Expecting instant fast service without greeting staff first',
      'Speaking overly loudly in quiet bistros or metros',
    ],
    usefulPhrases: [
      { phrase: 'Bonjour', translation: 'Good morning / Hello', pronunciation: 'bon-zhoor' },
      { phrase: 'Merci beaucoup', translation: 'Thank you very much', pronunciation: 'mair-see boh-koo' },
      { phrase: 'S’il vous plaît', translation: 'Please', pronunciation: 'seel voo pleh' },
    ],
  },
};

export class CultureService {
  static getCultureData(countryId: string): CulturalIntelligenceData {
    const key = countryId.toLowerCase().trim();
    return (
      CULTURAL_DATA[key] || {
        country: countryId.toUpperCase(),
        greetings: ['Greet locals politely with local customary greetings.'],
        etiquette: [
          'Respect local customs and places of worship.',
          'Always ask permission before photographing local residents.',
        ],
        dressCode: 'Dress modestly when visiting sacred places or heritage monuments.',
        tippingCustoms: 'Check local tipping customs; rounding up the bill is usually appreciated.',
        mistakesToAvoid: ['Disrespecting local traditions or sanctuary rules.'],
        usefulPhrases: [
          { phrase: 'Hello', translation: 'Greeting', pronunciation: 'heh-loh' },
          { phrase: 'Thank you', translation: 'Expression of gratitude', pronunciation: 'thank yoo' },
        ],
      }
    );
  }
}
