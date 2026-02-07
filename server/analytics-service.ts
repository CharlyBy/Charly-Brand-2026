import { getDb } from "./db";
import { articleViews, knowledgeArticles } from "../drizzle/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

/**
 * Track article view event
 */
export async function trackArticleView(data: {
  articleId: number;
  sessionId: string;
  deviceType: "desktop" | "mobile" | "tablet";
  timeSpent: number;
  scrollDepth: number;
  bounced: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.insert(articleViews).values({
    articleId: data.articleId,
    sessionId: data.sessionId,
    deviceType: data.deviceType,
    timeSpent: data.timeSpent,
    scrollDepth: data.scrollDepth,
    bounced: data.bounced ? 1 : 0,
  });
  
  return { success: true };
}

/**
 * Get analytics stats for a specific article
 */
export async function getArticleStats(articleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  // Get all views for this article
  const views = await db
    .select()
    .from(articleViews)
    .where(eq(articleViews.articleId, articleId));
  
  if (views.length === 0) {
    return {
      totalViews: 0,
      avgTimeSpent: 0,
      avgScrollDepth: 0,
      bounceRate: 0,
      deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
      engagementScore: 0,
    };
  }
  
  // Calculate statistics
  const totalViews = views.length;
  const avgTimeSpent = Math.round(
    views.reduce((sum, v) => sum + v.timeSpent, 0) / totalViews
  );
  const avgScrollDepth = Math.round(
    views.reduce((sum, v) => sum + v.scrollDepth, 0) / totalViews
  );
  const bounceRate = Math.round(
    (views.filter((v) => v.bounced === 1).length / totalViews) * 100
  );
  
  // Device breakdown
  const deviceBreakdown = {
    desktop: views.filter((v) => v.deviceType === "desktop").length,
    mobile: views.filter((v) => v.deviceType === "mobile").length,
    tablet: views.filter((v) => v.deviceType === "tablet").length,
  };
  
  // Engagement score: (scrollDepth / 100) * (timeSpent / 60) * (1 - bounceRate / 100)
  // Normalized to 0-100 scale
  const engagementScore = Math.round(
    (avgScrollDepth / 100) * Math.min(avgTimeSpent / 60, 5) * (1 - bounceRate / 100) * 100
  );
  
  return {
    totalViews,
    avgTimeSpent,
    avgScrollDepth,
    bounceRate,
    deviceBreakdown,
    engagementScore,
  };
}

/**
 * Get top articles by engagement score
 */
export async function getTopArticles(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  // Get all published articles
  const articles = await db
    .select()
    .from(knowledgeArticles)
    .where(eq(knowledgeArticles.published, 1));
  
  // Calculate stats for each article
  const articlesWithStats = await Promise.all(
    articles.map(async (article) => {
      const stats = await getArticleStats(article.id);
      return {
        id: article.id,
        title: article.title,
        category: article.category,
        slug: article.slug,
        ...stats,
      };
    })
  );
  
  // Sort by engagement score and return top N
  return articlesWithStats
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, limit);
}

/**
 * Get engagement trends for last N days
 */
export async function getEngagementTrends(days: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const views = await db
    .select()
    .from(articleViews)
    .where(gte(articleViews.createdAt, startDate))
    .orderBy(desc(articleViews.createdAt));
  
  // Group by date
  const trendsByDate: Record<string, {
    date: string;
    views: number;
    avgTimeSpent: number;
    avgScrollDepth: number;
  }> = {};
  
  views.forEach((view) => {
    const dateKey = view.createdAt.toISOString().split("T")[0];
    
    if (!trendsByDate[dateKey]) {
      trendsByDate[dateKey] = {
        date: dateKey,
        views: 0,
        avgTimeSpent: 0,
        avgScrollDepth: 0,
      };
    }
    
    trendsByDate[dateKey].views++;
    trendsByDate[dateKey].avgTimeSpent += view.timeSpent;
    trendsByDate[dateKey].avgScrollDepth += view.scrollDepth;
  });
  
  // Calculate averages
  const trends = Object.values(trendsByDate).map((day) => ({
    date: day.date,
    views: day.views,
    avgTimeSpent: Math.round(day.avgTimeSpent / day.views),
    avgScrollDepth: Math.round(day.avgScrollDepth / day.views),
  }));
  
  // Sort by date ascending
  return trends.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get overall analytics summary
 */
export async function getAnalyticsSummary() {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const allViews = await db.select().from(articleViews);
  
  if (allViews.length === 0) {
    return {
      totalViews: 0,
      avgTimeSpent: 0,
      avgScrollDepth: 0,
      totalArticles: 0,
      activeArticles: 0,
    };
  }
  
  const totalViews = allViews.length;
  const avgTimeSpent = Math.round(
    allViews.reduce((sum, v) => sum + v.timeSpent, 0) / totalViews
  );
  const avgScrollDepth = Math.round(
    allViews.reduce((sum, v) => sum + v.scrollDepth, 0) / totalViews
  );
  const bouncedViews = allViews.filter((v) => v.bounced).length;
  const bounceRate = totalViews > 0 ? Math.round((bouncedViews / totalViews) * 100) : 0;
  
  // Count total and active articles
  const allArticles = await db
    .select()
    .from(knowledgeArticles)
    .where(eq(knowledgeArticles.published, 1));
  
  const activeArticleIds = new Set(allViews.map((v) => v.articleId));
  
  return {
    totalViews,
    avgTimeSpent,
    avgScrollDepth,
    bounceRate,
    totalArticles: allArticles.length,
    activeArticles: activeArticleIds.size,
  };
}
