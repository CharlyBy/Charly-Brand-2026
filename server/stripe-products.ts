/**
 * Stripe Product Definitions for Luna Premium Abo
 * 
 * Luna Premium: €9.90/month subscription
 * - Unlimited conversations with Luna
 * - Conversation history storage
 * - Weekly check-ins
 * - Progress tracking
 * - Personalized exercises/affirmations
 */

export const LUNA_PREMIUM_PRICE_ID_TEST = 'price_1SiuWMIYvsA4YU3M2EdybldZ'; // Stripe Test Price ID
export const LUNA_PREMIUM_PRICE_ID_LIVE = 'price_live_luna_premium'; // Will be replaced with real Stripe Price ID

export const LUNA_PREMIUM_PRODUCT = {
  name: 'Luna Premium Abo',
  description: 'Unbegrenzte Gespräche mit Luna, Gesprächsverlauf, wöchentliche Check-ins und personalisierte Übungen',
  price: 990, // €9.90 in cents
  currency: 'eur',
  interval: 'month' as const,
  features: [
    'Unbegrenzte Gespräche mit Luna',
    'Gesprächsverlauf speichern',
    'Wöchentliche Check-ins',
    'Fortschritts-Tracking',
    'Personalisierte Übungen & Affirmationen',
  ],
};

/**
 * Get the appropriate Price ID based on environment
 */
export function getLunaPremiumPriceId(): string {
  // For now, we'll use test mode
  // In production, check if we're in live mode and return LUNA_PREMIUM_PRICE_ID_LIVE
  return LUNA_PREMIUM_PRICE_ID_TEST;
}
