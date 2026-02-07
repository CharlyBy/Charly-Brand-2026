import { notifyOwner } from "./_core/notification";
import type { Review } from "../drizzle/schema";

/**
 * Send email notification to owner when a new review is submitted
 */
export async function notifyOwnerOfNewReview(review: Review): Promise<boolean> {
  const anonymityLabels = {
    full: "Vollständiger Name",
    first_initial: "Vorname + Nachname-Initial",
    initials: "Nur Initialen",
    anonymous: "Anonym",
  };

  const ratingStars = "⭐".repeat(review.rating);

  const content = `
**Neue Bewertung eingereicht!**

**Sternebewertung:** ${ratingStars} (${review.rating}/5)

**Bewertungstext:**
${review.text || "_Kein Text angegeben_"}

**Klient:**
- Name: ${review.name}
- E-Mail: ${review.email}
- Anonymität: ${anonymityLabels[review.anonymityLevel]}

**Nächste Schritte:**
Bitte prüfe die Bewertung im Admin-Panel und gebe sie frei oder lehne sie ab.

Admin-Panel: https://charlybrand.de/admin/bewertungen
  `.trim();

  return await notifyOwner({
    title: `Neue Bewertung: ${ratingStars}`,
    content,
  });
}
