/**
 * Stripe Webhook Handler
 * Handles Stripe webhook events for subscription management
 * 
 * IMPORTANT: This route must be registered with express.raw() BEFORE express.json()
 * to ensure signature verification works correctly.
 */

import { Request, Response } from 'express';
import { stripe } from './stripe-helper';
import { ENV } from './_core/env';
import { upsertSubscription } from './db';
import Stripe from 'stripe';

/**
 * Handle Stripe webhook events
 * Route: POST /api/stripe/webhook
 */
export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('[Stripe Webhook] Missing stripe-signature header');
    res.status(400).send('Missing stripe-signature header');
    return;
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.stripeWebhookSecret!
    );
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return;
  }

  console.log('[Stripe Webhook] Received event:', event.type, 'ID:', event.id);

  // CRITICAL: Handle test events for webhook verification
  if (event.id.startsWith('evt_test_')) {
    console.log('[Stripe Webhook] Test event detected, returning verification response');
    res.json({ verified: true });
    return;
  }

  // Handle different event types
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error handling event:', error);
    res.status(500).send('Webhook handler failed');
  }
}

/**
 * Handle checkout.session.completed event
 * Called when a customer completes a checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log('[Stripe Webhook] Checkout session completed:', session.id);

  // Get subscription ID from session
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    console.error('[Stripe Webhook] No subscription ID in checkout session');
    return;
  }

  // Retrieve full subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await handleSubscriptionUpdate(subscription);
}

/**
 * Handle subscription created/updated events
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
  console.log('[Stripe Webhook] Subscription update:', subscription.id, 'Status:', subscription.status);

  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const email = (customer as Stripe.Customer).email;

  if (!email) {
    console.error('[Stripe Webhook] No email found for customer:', subscription.customer);
    return;
  }

  // Use type assertion to access properties
  const sub = subscription as any;

  // Upsert subscription to database
  await upsertSubscription({
    email,
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodStart: new Date(sub.current_period_start * 1000),
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: sub.cancel_at_period_end ? 1 : 0,
  });

  console.log('[Stripe Webhook] Subscription saved to database:', subscription.id);
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log('[Stripe Webhook] Subscription deleted:', subscription.id);

  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const email = (customer as Stripe.Customer).email;

  if (!email) {
    console.error('[Stripe Webhook] No email found for customer:', subscription.customer);
    return;
  }

  // Use type assertion to access properties
  const sub = subscription as any;

  // Update subscription status to canceled
  await upsertSubscription({
    email,
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    status: 'canceled',
    currentPeriodStart: new Date(sub.current_period_start * 1000),
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: 1,
  });

  console.log('[Stripe Webhook] Subscription marked as canceled:', subscription.id);
}

/**
 * Handle invoice.paid event
 */
async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  console.log('[Stripe Webhook] Invoice paid:', invoice.id);

  // If this is a subscription invoice, update subscription status
  const invoiceWithSub = invoice as any;
  const subscriptionId = typeof invoiceWithSub.subscription === 'string' ? invoiceWithSub.subscription : invoiceWithSub.subscription?.id;
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionUpdate(subscription);
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  console.log('[Stripe Webhook] Invoice payment failed:', invoice.id);

  // If this is a subscription invoice, update subscription status
  const invoiceWithSub = invoice as any;
  const subscriptionId = typeof invoiceWithSub.subscription === 'string' ? invoiceWithSub.subscription : invoiceWithSub.subscription?.id;
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionUpdate(subscription);
  }
}
