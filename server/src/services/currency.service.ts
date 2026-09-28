export interface CurrencyConversionResult {
  baseCurrency: string;
  amount: number;
  rates: Record<string, number>;
  conversions: Record<string, { formatted: string; amount: number; symbol: string }>;
  isLive: boolean;
  updatedAt: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
};

const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 152.0,
  CAD: 1.36,
  AUD: 1.51,
};

export class CurrencyService {
  static async convert(amount: number = 1000, baseCurrency: string = 'USD'): Promise<CurrencyConversionResult> {
    const base = baseCurrency.toUpperCase();
    let rates = { ...FALLBACK_RATES };
    let isLive = false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://open.er-api.com/v6/latest/${base}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.rates) {
          rates = {
            USD: data.rates.USD || 1.0,
            INR: data.rates.INR || 83.5,
            EUR: data.rates.EUR || 0.92,
            GBP: data.rates.GBP || 0.78,
            JPY: data.rates.JPY || 152.0,
            CAD: data.rates.CAD || 1.36,
            AUD: data.rates.AUD || 1.51,
          };
          isLive = true;
        }
      }
    } catch {
      // Fallback
    }

    const conversions: Record<string, { formatted: string; amount: number; symbol: string }> = {};

    Object.keys(rates).forEach((curr) => {
      const convertedAmount = Math.round(amount * rates[curr]);
      const symbol = CURRENCY_SYMBOLS[curr] || curr;
      conversions[curr] = {
        amount: convertedAmount,
        symbol,
        formatted: `${symbol}${convertedAmount.toLocaleString()}`,
      };
    });

    return {
      baseCurrency: base,
      amount,
      rates,
      conversions,
      isLive,
      updatedAt: new Date().toISOString(),
    };
  }
}
