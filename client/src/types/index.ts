// ============================================================
// PredicVerse — Type Definitions
// ============================================================

export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  capital: string;
  population: string;
  currency: string;
  languages: string[];
  religion: string;
  government: string;
  climate: string;
  timeZone: string;
  callingCode: string;
  description: string;
  history: string;
  culture: string;
  traditionalDress: string;
  emergencyNumbers: { police: string; ambulance: string; fire: string };
  funFacts: string[];
  coordinates: [number, number];
  foods: Food[];
  festivals: Festival[];
  travelTips: string[];
  states: State[];
  // Extended fields
  region?: string;
  area?: string;
  currencySymbol?: string;
  otherLanguages?: string[];
  nationalDay?: string;
  traditionalMusic?: string;
  traditionalDance?: string;
  traditionalArt?: string[];
  popularDrinks?: string[];
  unescoSites?: string[];
  topLandmarks?: string[];
  bestCities?: string[];
  bestNatureSpots?: string[];
  bestBeaches?: string[];
  bestHistoricalPlaces?: string[];
  shopping?: string[];
  nightlife?: string[];
  adventureActivities?: string[];
  localExperiences?: string[];
  bestTimeToVisit?: string;
  visaInfo?: string;
  safetyInfo?: string;
  travelEtiquette?: string[];
  dosAndDonts?: { dos: string[]; donts: string[] };
  transportation?: string[];
  avgBudgetPerDay?: string;
  famousSouvenirs?: string[];
  officialTourismSource?: string;
  travelPersonality?: string[];
  continent?: 'Asia' | 'Europe' | 'Africa' | 'North America' | 'South America' | 'Oceania';
  lastVerified?: string;
  famousMuseums?: string[];
  famousArchitecture?: string[];
  hiddenGems?: string[];
  romanticExperiences?: string[];
  familyActivities?: string[];
  thingsToDo?: string[];
  thingsToAvoid?: string[];
  categoryTags?: string[];
  indigenousCulture?: string;
  wildlife?: string[];
  marineLife?: string[];
  bestIslands?: string[];
  waterActivities?: string[];
}

export interface State {
  id: string;
  name: string;
  countryId: string;
  description: string;
  history: string;
  culture: string;
  famousFood: string[];
  touristPlaces: string[];
  languages: string[];
  festivals: string[];
  cities: City[];
}

export interface City {
  id: string;
  name: string;
  stateId: string;
  overview: string;
  attractions: string[];
  hiddenGems: string[];
  restaurants: string[];
  shoppingAreas: string[];
  cafes: string[];
  markets: string[];
  adventures: string[];
  museums: string[];
  temples: string[];
  parks: string[];
  nightlife: string[];
  travelTips: string[];
}

export interface Food {
  name: string;
  type: 'must-try' | 'street-food' | 'dessert' | 'drink' | 'main' | 'snack' | 'side' | 'bar-snack' | 'staple' | 'specialty' | 'delicacy' | string;
  description: string;
}

export interface Festival {
  name: string;
  month: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface TripPlan {
  id: string;
  userId: string;
  destination: string;
  budget: number;
  days: number;
  travelers: number;
  interests: string[];
  itinerary: string;
  aiGenerated?: boolean;
  structuredAI?: any;
  createdAt: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  personalityType: string;
  answers: number[];
  recommendations: string[];
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  destinationType: 'country' | 'state' | 'city';
  destinationId: string;
  destinationName: string;
  addedAt: string;
}

export interface PassportEntry {
  id: string;
  userId: string;
  destinationType: 'country' | 'state' | 'city';
  destinationId: string;
  destinationName: string;
  visitedAt: string;
}

export interface SearchResult {
  type: 'country' | 'state' | 'city' | 'food' | 'festival';
  id: string;
  name: string;
  parentName?: string;
  description: string;
  link: string;
}

export interface WorldArticle {
  id: string;
  title: string;
  subtitle: string;
  country: string;
  countryCode: string;
  flag: string;
  location: string;
  category: 'Heritage' | 'Culture' | 'Gastronomy' | 'Nature' | 'History' | 'Architecture';
  publishDate: string;
  readTime: string;
  summary: string;
  fullContent: string;
  imageUrl: string;
  imageCaption: string;
  sourceName: string;
  sourceUrl: string;
  isVerified: boolean;
  highlights: string[];
}

