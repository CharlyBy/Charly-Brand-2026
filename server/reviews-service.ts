import { getDb } from "./db";
import { reviews, type InsertReview, type Review } from "../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { notifyOwnerOfNewReview } from "./review-notification";

/**
 * Anonymize name based on anonymity level
 */
export function anonymizeName(fullName: string, anonymityLevel: string): string {
  if (anonymityLevel === "anonymous") {
    return "Anonym";
  }

  const parts = fullName.trim().split(/\s+/);
  
  if (anonymityLevel === "initials") {
    // "M. M." - Only initials
    return parts.map(part => `${part[0].toUpperCase()}.`).join(" ");
  }

  if (anonymityLevel === "first_initial") {
    // "Max M." - First name + last name initial
    if (parts.length === 1) {
      return parts[0]; // Only one name provided
    }
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1][0].toUpperCase();
    return `${firstName} ${lastInitial}.`;
  }

  // "full" - Return full name
  return fullName;
}

/**
 * Submit a new review
 */
export async function submitReview(data: InsertReview): Promise<Review> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const [review] = await db.insert(reviews).values({
    ...data,
    status: "pending", // Always start as pending
  }).$returningId();

  // Fetch the created review
  const [createdReview] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, review.id));

  // Send email notification to owner
  try {
    await notifyOwnerOfNewReview(createdReview);
    console.log("[Reviews] Email notification sent to owner");
  } catch (error) {
    console.error("[Reviews] Failed to send email notification:", error);
    // Don't fail the review submission if email fails
  }

  return createdReview;
}

/**
 * Get all approved reviews (for public display)
 */
export async function getApprovedReviews(): Promise<Array<Review & { displayName: string }>> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const approvedReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.status, "approved"))
    .orderBy(desc(reviews.createdAt));

  // Anonymize names based on anonymity level
  return approvedReviews.map(review => ({
    ...review,
    displayName: anonymizeName(review.name, review.anonymityLevel),
  }));
}

/**
 * Get review statistics (average rating, total count)
 */
export async function getReviewStats(): Promise<{
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  // Get all reviews
  const allReviews = await db.select().from(reviews);
  
  // Count by status
  const pending = allReviews.filter(r => r.status === "pending").length;
  const approved = allReviews.filter(r => r.status === "approved").length;
  const rejected = allReviews.filter(r => r.status === "rejected").length;
  
  // Get approved reviews for rating calculations
  const approvedReviews = allReviews.filter(r => r.status === "approved");
  
  if (approvedReviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      total: allReviews.length,
      pending,
      approved,
      rejected,
    };
  }

  const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / approvedReviews.length;

  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  approvedReviews.forEach(r => {
    ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
  });

  return {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalReviews: approvedReviews.length,
    ratingDistribution,
    total: allReviews.length,
    pending,
    approved,
    rejected,
  };
}

/**
 * Get all pending reviews (for admin approval)
 */
export async function getPendingReviews(): Promise<Review[]> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.status, "pending"))
    .orderBy(desc(reviews.createdAt));
}

/**
 * Get all reviews (for admin panel)
 */
export async function getAllReviews(): Promise<Review[]> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  return await db
    .select()
    .from(reviews)
    .orderBy(desc(reviews.createdAt));
}

/**
 * Approve a review
 */
export async function approveReview(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db
    .update(reviews)
    .set({ status: "approved" })
    .where(eq(reviews.id, id));
}

/**
 * Reject a review
 */
export async function rejectReview(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db
    .update(reviews)
    .set({ status: "rejected" })
    .where(eq(reviews.id, id));
}

/**
 * Delete a review
 */
export async function deleteReview(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db
    .delete(reviews)
    .where(eq(reviews.id, id));
}
