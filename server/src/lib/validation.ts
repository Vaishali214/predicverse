import { z } from 'zod';

// ============================================================
// AUTH VALIDATION
// ============================================================

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name must be 100 characters or fewer.')
    .trim(),
  email: z
    .string()
    .email('A valid email address is required.')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters.')
    .max(128, 'Password must be 128 characters or fewer.'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('A valid email address is required.')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'Password is required.'),
});

// ============================================================
// USER PROFILE VALIDATION
// ============================================================

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  avatar: z.string().url().optional().nullable(),
});

export const updateProfileSchema = z.object({
  travelStyle: z.string().max(100).optional().nullable(),
  interests: z.array(z.string()).optional(),
  preferredBudget: z.string().max(50).optional().nullable(),
  preferredDestinations: z.array(z.string()).optional(),
  bio: z.string().max(500).optional().nullable(),
});

// ============================================================
// TRAVEL DNA VALIDATION
// ============================================================

const scoreField = z.number().int().min(0).max(100);

export const updateTravelDNASchema = z.object({
  culture: scoreField.optional(),
  food: scoreField.optional(),
  adventure: scoreField.optional(),
  nature: scoreField.optional(),
  history: scoreField.optional(),
  relaxation: scoreField.optional(),
  nightlife: scoreField.optional(),
  luxury: scoreField.optional(),
  budget: scoreField.optional(),
  photography: scoreField.optional(),
  archetype: z.string().max(100).optional().nullable(),
});

// ============================================================
// TRIP VALIDATION
// ============================================================

export const createTripSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(200).trim(),
  destination: z.string().min(1, 'Destination is required.').max(200).trim(),
  country: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  startDate: z.string().optional().nullable(), // ISO date string
  endDate: z.string().optional().nullable(),
  budget: z.number().positive().optional().nullable(),
  days: z.number().int().min(1).max(365).optional().nullable(),
  travelers: z.number().int().min(1).max(50).optional().nullable(),
  travelStyle: z.string().max(100).optional().nullable(),
  interests: z.array(z.string()).optional(),
  description: z.string().max(2000).optional().nullable(),
  itinerary: z.string().optional().nullable(),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
});

export const updateTripSchema = createTripSchema.partial();

// ============================================================
// ITINERARY VALIDATION
// ============================================================

export const createItineraryDaySchema = z.object({
  dayNumber: z.number().int().min(1),
  date: z.string().optional().nullable(),
  title: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
});

export const updateItineraryDaySchema = createItineraryDaySchema.partial();

export const createItineraryItemSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(200).trim(),
  description: z.string().max(2000).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  startTime: z.string().max(10).optional().nullable(),
  endTime: z.string().max(10).optional().nullable(),
  estimatedCost: z.number().min(0).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export const updateItineraryItemSchema = createItineraryItemSchema.partial();

// ============================================================
// WISHLIST VALIDATION
// ============================================================

export const createWishlistItemSchema = z.object({
  destinationType: z.enum(['country', 'state', 'city']),
  destinationId: z.string().min(1, 'Destination ID is required.'),
  destinationName: z.string().min(1, 'Destination name is required.').max(200),
  category: z.string().max(100).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

// ============================================================
// PASSPORT VALIDATION
// ============================================================

export const createPassportStampSchema = z.object({
  country: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  destination: z.string().min(1, 'Destination is required.').max(200),
  destinationId: z.string().min(1, 'Destination ID is required.'),
  destinationType: z.enum(['country', 'state', 'city']),
  stampDate: z.string().optional().nullable(),
  flag: z.string().max(10).optional().nullable(),
});

// ============================================================
// TRAVEL SEARCH VALIDATION
// ============================================================

export const flightSearchSchema = z
  .object({
    origin: z.string().min(2, 'Origin city/airport code is required.').max(100).trim(),
    destination: z.string().min(2, 'Destination city/airport code is required.').max(100).trim(),
    departureDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Departure date must be a valid date.',
    }),
    returnDate: z.string().optional().nullable(),
    oneWay: z.boolean().default(false),
    travelers: z.number().int().min(1, 'At least 1 traveler required.').max(20).default(1),
    cabinClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY'),
    currency: z.string().max(10).default('USD'),
  })
  .refine(
    (data) => {
      if (!data.oneWay && data.returnDate && data.returnDate.trim() !== '') {
        const dep = new Date(data.departureDate).getTime();
        const ret = new Date(data.returnDate).getTime();
        return ret >= dep;
      }
      return true;
    },
    {
      message: 'Return date cannot be before departure date.',
      path: ['returnDate'],
    },
  );

export const hotelSearchSchema = z
  .object({
    destination: z.string().min(2, 'Destination city or location is required.').max(100).trim(),
    checkInDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Check-in date must be a valid date.',
    }),
    checkOutDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Check-out date must be a valid date.',
    }),
    guests: z.number().int().min(1, 'At least 1 guest required.').max(30).default(2),
    rooms: z.number().int().min(1, 'At least 1 room required.').max(10).default(1),
    currency: z.string().max(10).default('USD'),
  })
  .refine(
    (data) => {
      const inDate = new Date(data.checkInDate).getTime();
      const outDate = new Date(data.checkOutDate).getTime();
      return outDate > inDate;
    },
    {
      message: 'Check-out date must be after check-in date.',
      path: ['checkOutDate'],
    },
  );

// ============================================================
// COLLABORATION & SHARING VALIDATION
// ============================================================

export const createShareLinkSchema = z.object({
  role: z.enum(['VIEWER', 'EDITOR']).default('VIEWER'),
  expirationDays: z.number().int().min(1).max(365).optional().nullable(),
});

export const addCollaboratorSchema = z.object({
  email: z.string().email('Valid email address is required.').trim(),
  role: z.enum(['VIEWER', 'EDITOR']).default('VIEWER'),
});

export const updateCollaboratorRoleSchema = z.object({
  role: z.enum(['VIEWER', 'EDITOR']),
});

// ============================================================
// UTILITY: Parse & return validation errors
// ============================================================

export function formatZodError(error: any): string {
  return error.errors ? error.errors.map((e: any) => e.message).join(', ') : 'Validation error';
}
