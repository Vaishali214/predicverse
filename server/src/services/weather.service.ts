export interface WeatherData {
  location: string;
  temperature: number;
  unit: string;
  condition: string;
  humidity: number;
  windSpeed: number;
  isLive: boolean;
  forecast: Array<{
    day: string;
    tempHigh: number;
    tempLow: number;
    condition: string;
  }>;
}

const DESTINATION_COORDS: Record<string, { lat: number; lon: number; name: string }> = {
  japan: { lat: 35.6762, lon: 139.6503, name: 'Tokyo, Japan' },
  tokyo: { lat: 35.6762, lon: 139.6503, name: 'Tokyo, Japan' },
  kyoto: { lat: 35.0116, lon: 135.7681, name: 'Kyoto, Japan' },
  paris: { lat: 48.8566, lon: 2.3522, name: 'Paris, France' },
  france: { lat: 48.8566, lon: 2.3522, name: 'Paris, France' },
  delhi: { lat: 28.6139, lon: 77.209, name: 'New Delhi, India' },
  india: { lat: 28.6139, lon: 77.209, name: 'New Delhi, India' },
  london: { lat: 51.5074, lon: -0.1278, name: 'London, United Kingdom' },
  zurich: { lat: 47.3769, lon: 8.5417, name: 'Zurich, Switzerland' },
  switzerland: { lat: 46.8182, lon: 8.2275, name: 'Bern, Switzerland' },
  thailand: { lat: 13.7563, lon: 100.5018, name: 'Bangkok, Thailand' },
  bangkok: { lat: 13.7563, lon: 100.5018, name: 'Bangkok, Thailand' },
  rajasthan: { lat: 26.9124, lon: 75.7873, name: 'Jaipur, Rajasthan' },
  austria: { lat: 48.2082, lon: 16.3738, name: 'Vienna, Austria' },
  netherlands: { lat: 52.3676, lon: 4.9041, name: 'Amsterdam, Netherlands' },
  usa: { lat: 40.7128, lon: -74.006, name: 'New York, USA' },
  italy: { lat: 41.9028, lon: 12.4964, name: 'Rome, Italy' },
};

export class WeatherService {
  static async getWeather(locationQuery: string): Promise<WeatherData> {
    const key = locationQuery.toLowerCase().trim();
    let coords = DESTINATION_COORDS[key];

    // If not in static lookup, attempt dynamic geocoding via Open-Meteo Geocoding API
    if (!coords) {
      try {
        const geoController = new AbortController();
        const geoTimeout = setTimeout(() => geoController.abort(), 3000);

        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationQuery)}&count=1`,
          { signal: geoController.signal },
        );
        clearTimeout(geoTimeout);

        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            const first = geoData.results[0];
            coords = {
              lat: first.latitude,
              lon: first.longitude,
              name: `${first.name}${first.country ? ', ' + first.country : ''}`,
            };
          }
        }
      } catch {
        // Geocoding fallback handled below
      }
    }

    const targetCoords = coords || DESTINATION_COORDS['japan'];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${targetCoords.lat}&longitude=${targetCoords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const current = data.current || {};
        const daily = data.daily || {};

        const weatherCodeMap: Record<number, string> = {
          0: 'Clear Sky',
          1: 'Mainly Clear',
          2: 'Partly Cloudy',
          3: 'Overcast',
          45: 'Foggy',
          48: 'Depositing Rime Fog',
          51: 'Light Drizzle',
          61: 'Slight Rain',
          63: 'Moderate Rain',
          71: 'Slight Snowfall',
          80: 'Rain Showers',
          95: 'Thunderstorm',
        };

        const condition = weatherCodeMap[current.weather_code] || 'Partly Cloudy';
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const todayIdx = new Date().getDay();

        const forecast = (daily.time || []).slice(0, 3).map((_: string, idx: number) => ({
          day: daysOfWeek[(todayIdx + idx) % 7],
          tempHigh: Math.round(daily.temperature_2m_max?.[idx] ?? 22),
          tempLow: Math.round(daily.temperature_2m_min?.[idx] ?? 14),
          condition: weatherCodeMap[daily.weather_code?.[idx]] || 'Pleasant',
        }));

        return {
          location: targetCoords.name,
          temperature: Math.round(current.temperature_2m ?? 21),
          unit: '°C',
          condition,
          humidity: current.relative_humidity_2m ?? 55,
          windSpeed: Math.round(current.wind_speed_10m ?? 12),
          isLive: true,
          forecast: forecast.length
            ? forecast
            : [
                { day: 'Today', tempHigh: 23, tempLow: 15, condition: 'Clear' },
                { day: 'Tomorrow', tempHigh: 24, tempLow: 16, condition: 'Sunny' },
              ],
        };
      }
    } catch {
      // Fallback
    }

    // Graceful Fallback if offline or network failure — explicitly mark isLive: false
    return {
      location: locationQuery || 'Global Destination',
      temperature: 22,
      unit: '°C',
      condition: 'Pleasant & Clear (Fallback)',
      humidity: 58,
      windSpeed: 10,
      isLive: false,
      forecast: [
        { day: 'Today', tempHigh: 24, tempLow: 15, condition: 'Sunny' },
        { day: 'Tomorrow', tempHigh: 23, tempLow: 14, condition: 'Partly Cloudy' },
        { day: 'Day 3', tempHigh: 22, tempLow: 13, condition: 'Clear' },
      ],
    };
  }
}
