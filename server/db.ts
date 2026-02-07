import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, subscriptions, InsertSubscription, Subscription, conversations, messages, stats, Conversation, InsertConversation, Message, InsertMessage, enneagramAnalyses, EnneagramAnalysis, InsertEnneagramAnalysis } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// Luna Conversation Helpers
// ============================================

/**
 * Create a new conversation
 */
export async function createConversation(data: InsertConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(conversations).values(data);
  return data.id;
}

/**
 * Get conversation by ID
 */
export async function getConversationById(id: string): Promise<Conversation | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return result[0];
}

/**
 * Update conversation
 */
export async function updateConversation(id: string, data: Partial<InsertConversation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(conversations).set(data).where(eq(conversations.id, id));
}

/**
 * Get all conversations (for admin dashboard)
 */
export async function getAllConversations(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  
  const convs = await db.select().from(conversations).orderBy(desc(conversations.startedAt)).limit(limit);
  
  // Get message count for each conversation
  const result = await Promise.all(
    convs.map(async (conv) => {
      const msgs = await db.select().from(messages).where(eq(messages.conversationId, conv.id));
      return {
        ...conv,
        messageCount: msgs.length,
      };
    })
  );

  return result;
}

/**
 * Add message to conversation
 */
export async function addMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(messages).values(data);
}

/**
 * Get messages for a conversation
 */
export async function getMessagesByConversationId(conversationId: string): Promise<Message[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.timestamp);
}

/**
 * Get conversation with messages
 */
export async function getConversation(conversationId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const conversation = await getConversationById(conversationId);
  if (!conversation) return null;
  
  const conversationMessages = await getMessagesByConversationId(conversationId);
  
  return {
    ...conversation,
    messages: conversationMessages,
  };
}

/**
 * Get conversation details with messages (for admin dashboard)
 */
export async function getConversationDetails(conversationId: string) {
  return await getConversation(conversationId);
}

/**
 * Get conversation statistics (for admin dashboard)
 */
export async function getConversationStats() {
  const db = await getDb();
  if (!db) return {
    totalConversations: 0,
    emergencyCount: 0,
    uniqueUsers: 0,
    conversionRate: 0,
  };

  const allConvs = await db.select().from(conversations);
  const emergencyConvs = allConvs.filter(c => c.emergencyFlag === 1);
  const uniqueEmails = new Set(allConvs.filter(c => c.email).map(c => c.email));
  const withRecommendation = allConvs.filter(c => c.outcome);

  return {
    totalConversations: allConvs.length,
    emergencyCount: emergencyConvs.length,
    uniqueUsers: uniqueEmails.size,
    conversionRate: allConvs.length > 0 ? (withRecommendation.length / allConvs.length) * 100 : 0,
  };
}


/**
 * Delete conversation and all its messages
 */
export async function deleteConversation(conversationId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // First delete all messages
    await db.delete(messages).where(eq(messages.conversationId, conversationId));
    
    // Then delete the conversation
    await db.delete(conversations).where(eq(conversations.id, conversationId));
    
    return true;
  } catch (error) {
    console.error('[Database] Failed to delete conversation:', error);
    return false;
  }
}

/**
 * Subscription Management Database Helpers
 */

/**
 * Create or update a subscription in the database
 */
export async function upsertSubscription(data: InsertSubscription): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert subscription: database not available");
    return;
  }

  try {
    await db.insert(subscriptions).values(data).onDuplicateKeyUpdate({
      set: {
        status: data.status,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[Database] Failed to upsert subscription:", error);
    throw error;
  }
}

/**
 * Get subscription by email
 */
export async function getSubscriptionByEmail(email: string): Promise<Subscription | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const results = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.email, email))
      .limit(1);
    
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get subscription by email:", error);
    return null;
  }
}

/**
 * Get subscription by Stripe Subscription ID
 */
export async function getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const results = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
      .limit(1);
    
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get subscription by Stripe ID:", error);
    return null;
  }
}

/**
 * Check if user has active premium subscription
 */
export async function hasActivePremiumSubscription(email: string): Promise<boolean> {
  const subscription = await getSubscriptionByEmail(email);
  return subscription?.status === 'active' || subscription?.status === 'trialing';
}

/**
 * Count conversations for a user (by session ID or email)
 */
export async function countUserConversations(sessionId?: string, email?: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    let results;
    if (email) {
      results = await db
        .select()
        .from(conversations)
        .where(eq(conversations.email, email));
    } else if (sessionId) {
      results = await db
        .select()
        .from(conversations)
        .where(eq(conversations.sessionId, sessionId));
    } else {
      return 0;
    }
    
    return results.length;
  } catch (error) {
    console.error("[Database] Failed to count conversations:", error);
    return 0;
  }
}


// ============================================
// Enneagram Analysis Helpers
// ============================================

/**
 * Create a new enneagram analysis
 */
export async function createEnneagramAnalysis(data: InsertEnneagramAnalysis): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(enneagramAnalyses).values(data);
  return result[0].insertId;
}

/**
 * Get enneagram analysis by ID
 */
export async function getEnneagramAnalysisById(id: number): Promise<EnneagramAnalysis | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(enneagramAnalyses).where(eq(enneagramAnalyses.id, id)).limit(1);
  return result[0];
}

/**
 * Get latest enneagram analysis by email
 */
export async function getLatestEnneagramAnalysisByEmail(email: string): Promise<EnneagramAnalysis | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(enneagramAnalyses)
    .where(eq(enneagramAnalyses.userEmail, email))
    .orderBy(desc(enneagramAnalyses.createdAt))
    .limit(1);
  
  return result[0];
}

/**
 * Get all enneagram analyses (for admin dashboard)
 */
export async function getAllEnneagramAnalyses(limit = 100): Promise<EnneagramAnalysis[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(enneagramAnalyses)
    .orderBy(desc(enneagramAnalyses.createdAt))
    .limit(limit);
}
