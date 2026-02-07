/**
 * Cookie Consent Management
 * GDPR-compliant consent handling for analytics tracking
 */

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  const consent = localStorage.getItem("analytics-consent");
  return consent === "true";
}

export function hasCookieConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("cookie-consent") !== null;
}

export function getCookieConsentType(): "all" | "essential" | null {
  if (typeof window === "undefined") return null;
  const consent = localStorage.getItem("cookie-consent");
  if (consent === "all" || consent === "essential") {
    return consent;
  }
  return null;
}

export function resetCookieConsent(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cookie-consent");
  localStorage.removeItem("analytics-consent");
}
