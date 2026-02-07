/**
 * Stripe Helper Module for Luna Premium Subscriptions
 * Handles Stripe API interactions for subscription management
 */

import Stripe from 'stripe';
import { ENV } from './_core/env';

// Initialize Stripe with secret key
const stripe = new Stripe(ENV.stripeSecretKey!, {
  apiVersion: '2025-12-15.clover',
});

export { stripe };

/**
 * Create a Stripe Checkout Session for Luna Premium subscription
 * @param email - Customer email address
 * @param priceId - Stripe Price ID for the subscription
 * @param successUrl - URL to redirect after successful payment
 * @param cancelUrl - URL to redirect if payment is canceled
 * @param metadata - Additional metadata to attach to the session
 * @returns Checkout session with URL
 */
export async function createCheckoutSession(params: {
  email: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    customer_email: params.email,
    allow_promotion_codes: true,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata || {},
  });

  return session;
}

/**
 * Get subscription details from Stripe
 * @param subscriptionId - Stripe Subscription ID
 * @returns Subscription object
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel a subscription at period end
 * @param subscriptionId - Stripe Subscription ID
 * @returns Updated subscription object
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactivate a canceled subscription (before period end)
 * @param subscriptionId - Stripe Subscription ID
 * @returns Updated subscription object
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Get customer by email
 * @param email - Customer email address
 * @returns Customer object or null if not found
 */
export async function getCustomerByEmail(
  email: string
): Promise<Stripe.Customer | null> {
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  return customers.data.length > 0 ? customers.data[0] : null;
}

/**
 * Create a billing portal session for managing subscription
 * @param customerId - Stripe Customer ID
 * @param returnUrl - URL to return to after managing subscription
 * @returns Portal session with URL
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
