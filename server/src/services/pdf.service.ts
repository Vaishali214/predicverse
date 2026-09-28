import PDFDocument from 'pdfkit';
import { CultureService } from './culture.service.js';
import { WeatherService } from './weather.service.js';
import { CurrencyService } from './currency.service.js';
import { HiddenGemsService } from './hidden-gems.service.js';
import { prisma } from '../lib/prisma.js';

export interface GuidebookExportPayload {
  destination: string;
  budget?: number;
  days?: number;
  travelers?: number;
  interests?: string[];
  travelStyle?: string;
  itinerary?: string;
  structuredAI?: any;
  flightData?: any;
  hotelData?: any;
}

export class PdfService {
  /**
   * Generates a Vintage Gazette Travel Guidebook PDF as a Buffer.
   */
  static async generateGuidebookPdf(
    userId: string,
    payload: GuidebookExportPayload
  ): Promise<Buffer> {
    const destination = payload.destination || 'Global Destination';
    const budget = payload.budget || 1000;
    const days = payload.days || 3;
    const travelers = payload.travelers || 1;
    const interests = payload.interests || ['Culture & History', 'Culinary & Food'];
    const travelStyle = payload.travelStyle || 'Standard Gazette Traveler';

    // 1. Fetch user profile and Travel DNA if available
    let userDNA: any = null;
    let userName = 'Valued Gazette Traveler';
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { travelDNA: true },
      });
      if (user) {
        userName = user.name;
        userDNA = user.travelDNA;
      }
    } catch {
      // Non-fatal if DB record omitted
    }

    // 2. Fetch Wishlist items for user & destination
    let userWishlist: any[] = [];
    try {
      userWishlist = await prisma.wishlistItem.findMany({
        where: {
          userId,
          destinationName: { contains: destination, mode: 'insensitive' },
        },
        take: 5,
      });
    } catch {
      userWishlist = [];
    }

    // 3. Fetch Passport Stamps for user & destination
    let userPassport: any[] = [];
    try {
      userPassport = await prisma.passportStamp.findMany({
        where: {
          userId,
          destination: { contains: destination, mode: 'insensitive' },
        },
      });
    } catch {
      userPassport = [];
    }

    // 4. Fetch Intelligence Services Data (Weather, Currency, Culture, Hidden Gems)
    const [weatherRaw, currencyRaw, cultureData, allGemsResult] = await Promise.all([
      WeatherService.getWeather(destination).catch(() => ({ isLive: false })),
      CurrencyService.convert(budget, 'USD').catch(() => ({ isLive: false })),
      Promise.resolve(CultureService.getCultureData(destination)),
      HiddenGemsService.getAllGems().catch(() => ({ gems: [] })),
    ]);

    const weather: any = weatherRaw;
    const currency: any = currencyRaw;

    const culture = cultureData || {
      country: destination,
      etiquette: ['Respect local customs and shrines.', 'Dress appropriately for sacred sites.'],
      tippingCustoms: 'Check local guidelines; service charge is often included.',
      dressCode: 'Smart casual; modest attire when visiting places of worship.',
      greetings: ['A respectful bow or polite hand clasp is widely appreciated.'],
      mistakesToAvoid: ['Avoid loud public conversations or disruptive behaviour.'],
      usefulPhrases: [{ phrase: 'Hello / Thank you', translation: 'Local greeting', pronunciation: 'greeting' }],
    };

    const destLower = destination.toLowerCase();
    const hiddenGems = (allGemsResult.gems || []).filter(
      (g: any) =>
        (g.destination && g.destination.toLowerCase().includes(destLower)) ||
        (g.country && g.country.toLowerCase().includes(destLower))
    );

    // 5. Construct PDF Document using pdfkit
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 36,
        size: 'A4',
        compress: false,
        info: {
          Title: `PredicVerse Gazette Guidebook — ${destination}`,
          Author: 'PredicVerse Publishing Inc.',
          Subject: `Vintage Travel Dispatch for ${destination}`,
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const primaryColor = '#111111';
      const accentColor = '#991B1B'; // Dark red gazette accent
      const mutedColor = '#4B5563';

      const checkPageBreak = (neededHeight: number = 80) => {
        if (doc.y + neededHeight > 770) {
          doc.addPage();
          renderHeaderBar();
        }
      };

      const renderHeaderBar = () => {
        doc.save();
        doc.fontSize(8).font('Helvetica-Bold').fillColor(primaryColor);
        doc.text('PREDICVERSE TRAVEL GAZETTE • SPECIAL OFFICIAL DISPATCH', 36, 20, {
          align: 'left',
          width: 300,
        });
        doc.text(`DESTINATION: ${destination.toUpperCase()}`, 336, 20, {
          align: 'right',
          width: 223,
        });
        doc.moveTo(36, 30).lineTo(559, 30).lineWidth(1).strokeColor('#111111').stroke();
        doc.restore();
        doc.y = 40;
      };

      // ============================================================
      // PAGE 1: COVER & FRONT MASTHEAD
      // ============================================================

      // Top Gazette Header
      doc.fontSize(8).font('Helvetica').fillColor(mutedColor);
      doc.text(`VOL. CXXVI... No. 42,910  |  ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 36, 36, { align: 'center' });
      doc.moveDown(0.3);

      doc.moveTo(36, doc.y).lineTo(559, doc.y).lineWidth(1).strokeColor(primaryColor).stroke();
      doc.moveDown(0.2);
      doc.moveTo(36, doc.y).lineTo(559, doc.y).lineWidth(2.5).strokeColor(primaryColor).stroke();
      doc.moveDown(0.5);

      // Newspaper Title
      doc.fontSize(32).font('Helvetica-Bold').fillColor(primaryColor).text('PREDICVERSE', { align: 'center' });
      doc.fontSize(10).font('Helvetica-Bold').fillColor(accentColor).text('THE WORLD TRAVEL & CULTURE CHRONICLE', { align: 'center' });
      doc.moveDown(0.3);

      doc.moveTo(36, doc.y).lineTo(559, doc.y).lineWidth(1.5).strokeColor(primaryColor).stroke();
      doc.moveDown(0.5);

      // Quote & Dispatch Headline Box
      doc.fontSize(9).font('Helvetica-Oblique').fillColor(mutedColor);
      doc.text('"The world is a book, and those who do not travel read only one page."', { align: 'center' });
      doc.moveDown(0.8);

      // Main Front Page Headline
      doc.fontSize(22).font('Helvetica-Bold').fillColor(accentColor);
      doc.text(`OFFICIAL TRAVEL DISPATCH: ${destination.toUpperCase()}`, { align: 'center' });
      doc.moveDown(0.4);

      // Summary Grid Box
      const boxTop = doc.y;
      doc.rect(36, boxTop, 523, 85).fillAndStroke('#F5F5F0', '#111111');

      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold');
      doc.text('TRAVEL DISPATCH METADATA', 48, boxTop + 10);
      doc.moveTo(48, boxTop + 24).lineTo(547, boxTop + 24).lineWidth(0.8).strokeColor('#111111').stroke();

      doc.fontSize(9).font('Helvetica');
      doc.text(`Traveler Name: ${userName}`, 48, boxTop + 32);
      doc.text(`Duration: ${days} Days Agenda`, 48, boxTop + 46);
      doc.text(`Travelers: ${travelers} Guest(s)`, 48, boxTop + 60);

      doc.text(`Budget Tier: $${budget} USD`, 300, boxTop + 32);
      doc.text(`Style: ${travelStyle}`, 300, boxTop + 46);
      doc.text(`Interests: ${interests.join(', ')}`, 300, boxTop + 60);

      doc.y = boxTop + 95;
      doc.moveDown(0.5);

      // ============================================================
      // TRAVEL DNA PROFILE SECTION
      // ============================================================
      checkPageBreak(100);
      doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text('THE TRAVELER’S DNA PROFILE');
      doc.moveTo(36, doc.y + 2).lineTo(559, doc.y + 2).lineWidth(1).strokeColor(primaryColor).stroke();
      doc.moveDown(0.5);

      if (userDNA) {
        doc.fontSize(9).font('Helvetica-Bold').fillColor(accentColor).text(`ARCHETYPE: ${(userDNA.archetype || 'THE CULTURAL EXPLORER').toUpperCase()}`);
        doc.moveDown(0.3);
        doc.fontSize(8.5).font('Helvetica').fillColor(primaryColor);
        doc.text(`Category Attributes — Culture: ${userDNA.culture}/100 | Gastronomy: ${userDNA.food}/100 | Adventure: ${userDNA.adventure}/100 | History: ${userDNA.history}/100 | Nature: ${userDNA.nature}/100`);
      } else {
        doc.fontSize(8.5).font('Helvetica').fillColor(mutedColor);
        doc.text(`Traveler Profile: ${travelers} guest(s) exploring ${destination} focusing on ${interests.join(' & ')}.`);
      }
      doc.moveDown(1.2);

      // ============================================================
      // DAY-BY-DAY ITINERARY SECTION
      // ============================================================
      checkPageBreak(120);
      doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text('DAY-BY-DAY ITINERARY DISPATCH');
      doc.moveTo(36, doc.y + 2).lineTo(559, doc.y + 2).lineWidth(1).strokeColor(primaryColor).stroke();
      doc.moveDown(0.8);

      const itineraryText = payload.itinerary || '';
      const structuredAI = payload.structuredAI;

      if (structuredAI && structuredAI.dailyPlan && Array.isArray(structuredAI.dailyPlan)) {
        structuredAI.dailyPlan.forEach((day: any) => {
          checkPageBreak(110);

          doc.fontSize(11).font('Helvetica-Bold').fillColor(accentColor);
          doc.text(`DAY 0${day.dayNumber}: ${(day.theme || 'Exploration Agenda').toUpperCase()}`);
          doc.moveTo(36, doc.y + 1).lineTo(559, doc.y + 1).lineWidth(0.5).strokeColor('#CCCCCC').stroke();
          doc.moveDown(0.4);

          doc.fontSize(8.5).fillColor(primaryColor);
          doc.font('Helvetica-Bold').text('• Morning: ', { continued: true });
          doc.font('Helvetica').text(day.morning || 'Historic Walking Tour');

          doc.font('Helvetica-Bold').text('• Afternoon: ', { continued: true });
          doc.font('Helvetica').text(day.afternoon || 'Local Cultural Exploration');

          doc.font('Helvetica-Bold').text('• Evening: ', { continued: true });
          doc.font('Helvetica').text(day.evening || 'Gastronomic Dinner & Evening Promenade');

          if (day.foodRecommendation) {
            doc.font('Helvetica-Bold').text('• Culinary Focus: ', { continued: true });
            doc.font('Helvetica').text(day.foodRecommendation);
          }

          if (day.estimatedDailyCost) {
            doc.font('Helvetica-Oblique').text(`• Est. Daily Cost: $${day.estimatedDailyCost} USD`);
          }
          doc.moveDown(0.8);
        });
      } else if (itineraryText) {
        const blocks = itineraryText.split('\n\n');
        blocks.forEach((block) => {
          checkPageBreak(60);
          if (block.startsWith('###')) {
            doc.fontSize(12).font('Helvetica-Bold').fillColor(primaryColor).text(block.replace(/#/g, '').trim());
            doc.moveDown(0.3);
          } else if (block.startsWith('####')) {
            doc.fontSize(10).font('Helvetica-Bold').fillColor(accentColor).text(block.replace(/#/g, '').trim());
            doc.moveDown(0.2);
          } else {
            doc.fontSize(8.5).font('Helvetica').fillColor(primaryColor).text(block.trim());
            doc.moveDown(0.5);
          }
        });
      }
      doc.moveDown(1);

      // ============================================================
      // CULTURAL INTELLIGENCE SECTION
      // ============================================================
      checkPageBreak(120);
      doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text('CULTURAL DOSSIER & ETIQUETTE BRIEFING');
      doc.moveTo(36, doc.y + 2).lineTo(559, doc.y + 2).lineWidth(1).strokeColor(primaryColor).stroke();
      doc.moveDown(0.6);

      const cultBox = doc.y;
      doc.rect(36, cultBox, 523, 95).fillAndStroke('#FFFDF5', '#111111');

      doc.fillColor(primaryColor).fontSize(9.5).font('Helvetica-Bold');
      doc.text(`REGIONAL ETIQUETTE: ${culture.country || destination}`, 48, cultBox + 8);
      doc.moveTo(48, cultBox + 20).lineTo(547, cultBox + 20).lineWidth(0.5).strokeColor('#111111').stroke();

      doc.fontSize(8.5).font('Helvetica').fillColor(primaryColor);
      const etiquetteText = culture.etiquette ? culture.etiquette.slice(0, 2).join(' ') : 'Respect local traditions and sacred places.';
      doc.text(`• Etiquette: ${etiquetteText}`, 48, cultBox + 26, { width: 500 });
      doc.text(`• Tipping Customs: ${culture.tippingCustoms || 'Check local guidelines; service charge is often included.'}`, 48, cultBox + 48, { width: 500 });
      doc.text(`• Dress Code & Greetings: ${culture.dressCode || 'Smart casual'} — ${Array.isArray(culture.greetings) ? culture.greetings[0] : 'Polite greeting appreciated.'}`, 48, cultBox + 68, { width: 500 });

      doc.y = cultBox + 105;
      doc.moveDown(0.8);

      // ============================================================
      // LIVE METEOROLOGICAL & CURRENCY DISPATCH
      // ============================================================
      checkPageBreak(110);
      doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text('WEATHER & CURRENCY DISPATCH');
      doc.moveTo(36, doc.y + 2).lineTo(559, doc.y + 2).lineWidth(1).strokeColor(primaryColor).stroke();
      doc.moveDown(0.6);

      const intelBox = doc.y;
      doc.rect(36, intelBox, 523, 75).fillAndStroke('#F5F5F0', '#111111');

      // Left Col: Weather
      doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor);
      doc.text('METEOROLOGICAL DATA', 48, intelBox + 8);
      doc.fontSize(8).font('Helvetica').fillColor(mutedColor);
      if (weather && weather.isLive) {
        doc.text(`Temperature: ${weather.temperature}${weather.unit} (${weather.condition})`, 48, intelBox + 22);
        doc.text(`Humidity: ${weather.humidity}% | Wind: ${weather.windSpeed} km/h`, 48, intelBox + 36);
        doc.text(`Source: Open-Meteo Weather API`, 48, intelBox + 50);
      } else {
        doc.text('WEATHER DATA NOT AVAILABLE', 48, intelBox + 22);
        doc.text('Live weather connection required prior to departure.', 48, intelBox + 36);
      }

      // Right Col: Currency
      doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor);
      doc.text('CURRENCY REFERENCE', 300, intelBox + 8);
      doc.fontSize(8).font('Helvetica').fillColor(mutedColor);
      if (currency && currency.isLive) {
        doc.text(`Base: $${budget} USD`, 300, intelBox + 22);
        doc.text(`Conversions: ${currency.conversions?.INR?.formatted || 'N/A'} | ${currency.conversions?.EUR?.formatted || 'N/A'}`, 300, intelBox + 36);
        doc.text(`REFERENCE CONVERSION ONLY — Rates subject to fluctuation.`, 300, intelBox + 50);
      } else {
        doc.text('CURRENCY DATA NOT AVAILABLE', 300, intelBox + 22);
        doc.text('REFERENCE CONVERSION ONLY', 300, intelBox + 36);
      }

      doc.y = intelBox + 85;
      doc.moveDown(0.8);

      // ============================================================
      // FLIGHT & HOTEL DISPATCH SECTIONS
      // ============================================================
      checkPageBreak(120);
      doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text('FLIGHT & ACCOMMODATION DISPATCH');
      doc.moveTo(36, doc.y + 2).lineTo(559, doc.y + 2).lineWidth(1).strokeColor(primaryColor).stroke();
      doc.moveDown(0.6);

      const flightBox = doc.y;
      doc.rect(36, flightBox, 523, 70).fillAndStroke('#FFFFFF', '#111111');

      doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor);
      doc.text('FLIGHT DISPATCH', 48, flightBox + 8);

      if (payload.flightData && payload.flightData.airline) {
        const f = payload.flightData;
        doc.fontSize(8).font('Helvetica').fillColor(primaryColor);
        doc.text(`Airline: ${f.airline} (${f.flightNumber}) | Route: ${f.origin} → ${f.destination}`, 48, flightBox + 22);
        doc.text(`Cabin: ${f.cabinClass || 'ECONOMY'} | Duration: ${f.duration} | Price: $${f.price?.amount || 'N/A'} ${f.price?.currency || 'USD'}`, 48, flightBox + 36);
        doc.text(`Booking Provider: ${f.bookingUrl ? f.bookingUrl : 'No direct booking link available'}`, 48, flightBox + 50);
      } else {
        doc.fontSize(8).font('Helvetica-Oblique').fillColor(mutedColor);
        doc.text('FLIGHT INFORMATION NOT ADDED', 48, flightBox + 24);
        doc.text('Use PredicVerse Live Flight Search to search and link live flight schedules.', 48, flightBox + 40);
      }

      doc.y = flightBox + 80;
      doc.moveDown(0.4);

      const hotelBox = doc.y;
      doc.rect(36, hotelBox, 523, 70).fillAndStroke('#FFFFFF', '#111111');

      doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor);
      doc.text('ACCOMMODATION DISPATCH', 48, hotelBox + 8);

      if (payload.hotelData && payload.hotelData.name) {
        const h = payload.hotelData;
        doc.fontSize(8).font('Helvetica').fillColor(primaryColor);
        doc.text(`Hotel: ${h.name} | Location: ${h.location}`, 48, hotelBox + 22);
        doc.text(`Room: ${h.roomType} | Price: ${h.price?.amount} ${h.price?.currency}`, 48, hotelBox + 36);
        doc.text(`Booking Provider: ${h.bookingUrl ? h.bookingUrl : 'No direct booking link available'}`, 48, hotelBox + 50);
      } else {
        doc.fontSize(8).font('Helvetica-Oblique').fillColor(mutedColor);
        doc.text('HOTEL INFORMATION NOT ADDED', 48, hotelBox + 24);
        doc.text('Use PredicVerse Live Hotel Search to search and link live accommodation rates.', 48, hotelBox + 40);
      }

      doc.y = hotelBox + 80;
      doc.moveDown(0.8);

      // ============================================================
      // THE GAZETTE'S HIDDEN GEMS
      // ============================================================
      if (hiddenGems.length > 0) {
        checkPageBreak(100);
        doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text('THE GAZETTE’S HIDDEN GEMS');
        doc.moveTo(36, doc.y + 2).lineTo(559, doc.y + 2).lineWidth(1).strokeColor(primaryColor).stroke();
        doc.moveDown(0.6);

        hiddenGems.slice(0, 3).forEach((gem: any) => {
          checkPageBreak(40);
          doc.fontSize(9).font('Helvetica-Bold').fillColor(accentColor).text(`💎 ${(gem.codename || gem.destination).toUpperCase()}`);
          doc.fontSize(8).font('Helvetica').fillColor(primaryColor).text(gem.description || 'Secret local gem.', { width: 520 });
          doc.moveDown(0.4);
        });
        doc.moveDown(0.5);
      }

      // ============================================================
      // PASSPORT & WISHLIST RECORD
      // ============================================================
      if (userPassport.length > 0 || userWishlist.length > 0) {
        checkPageBreak(90);
        doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryColor).text('PASSPORT STAMPS & WISHLIST RECORD');
        doc.moveTo(36, doc.y + 2).lineTo(559, doc.y + 2).lineWidth(1).strokeColor(primaryColor).stroke();
        doc.moveDown(0.6);

        if (userPassport.length > 0) {
          doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor).text('PASSPORT RECORD:');
          userPassport.forEach((stamp: any) => {
            doc.fontSize(8).font('Helvetica').fillColor(mutedColor).text(`✦ ${stamp.destination} (${new Date(stamp.stampDate).toLocaleDateString()})`);
          });
          doc.moveDown(0.4);
        }

        if (userWishlist.length > 0) {
          doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor).text('PLACES TO REMEMBER (WISHLIST):');
          userWishlist.forEach((item: any) => {
            doc.fontSize(8).font('Helvetica').fillColor(mutedColor).text(`★ ${item.destinationName} — ${item.category || 'Saved Landmark'}`);
          });
        }
        doc.moveDown(0.8);
      }

      // ============================================================
      // FINAL PAGE: GAZETTE BACK PAGE & LEGAL DISCLAIMER
      // ============================================================
      checkPageBreak(100);
      doc.moveDown(1);
      doc.moveTo(36, doc.y).lineTo(559, doc.y).lineWidth(2).strokeColor(primaryColor).stroke();
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('PREDICVERSE GAZETTE PUBLISHING INC.', { align: 'center' });
      doc.fontSize(8).font('Helvetica-Bold').fillColor(accentColor).text('AI TRAVEL & CULTURE INTELLIGENCE PLATFORM', { align: 'center' });
      doc.moveDown(0.4);

      doc.fontSize(7.5).font('Helvetica-Oblique').fillColor(mutedColor);
      doc.text(
        'LEGAL DISCLAIMER: Travel information, prices, availability, weather and exchange rates may change. Verify time-sensitive information with the relevant provider prior to departure.',
        { align: 'center', width: 520 }
      );

      // Finalize document stream
      doc.end();
    });
  }
}
