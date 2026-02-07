import { Router } from "express";
import { getDb } from "./db";
import { knowledgeArticles } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = "https://www.charlybrand.de";
    
    // Static pages
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "weekly" },
      { url: "/leistungen", priority: "0.9", changefreq: "monthly" },
      { url: "/wissen", priority: "0.9", changefreq: "weekly" },
      { url: "/faq", priority: "0.7", changefreq: "monthly" },
      { url: "/kontakt", priority: "0.8", changefreq: "monthly" },
      { url: "/ueber-charly", priority: "0.7", changefreq: "monthly" },
    ];

    // Dynamic knowledge articles
    const db = await getDb();
    const articles = db ? await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.published, 1)) : [];
    const articlePages = articles.map((article) => ({
      url: `/wissen/${article.slug}`,
      priority: "0.8",
      changefreq: "monthly",
      lastmod: article.updatedAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
    }));

    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
${articlePages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (error) {
    console.error("[Sitemap] Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
