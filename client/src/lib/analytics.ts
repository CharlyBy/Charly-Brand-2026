import ReactGA from "react-ga4";

// Initialize Google Analytics (Measurement-ID via Umgebungsvariable)
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) {
    console.warn("[Analytics] VITE_GA_MEASUREMENT_ID nicht konfiguriert - GA4 deaktiviert.");
    return;
  }
  ReactGA.initialize(measurementId);
};

// Track page views
export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

// Track custom events
export const trackEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};

// Conversion tracking helpers
export const trackLunaChatOpened = () => {
  trackEvent("Engagement", "Luna Chat Opened", "Chat Widget");
};

export const trackAppointmentClick = () => {
  trackEvent("Conversion", "Appointment Button Clicked", "Lemniscus Booking");
};

export const trackContactFormSubmit = () => {
  trackEvent("Conversion", "Contact Form Submitted", "Contact Form");
};

export const trackAdminLogin = () => {
  trackEvent("Admin", "Admin Login", "Admin Dashboard");
};

// Personality Test CTA tracking
export const trackPersonalityTestCTA = (position: "hero" | "middle" | "footer" | "navigation") => {
  trackEvent("Conversion", "Personality Test CTA Clicked", `Position: ${position}`);
};

// Luna Chat tracking with source
export const trackLunaChatOpenedFrom = (source: string) => {
  trackEvent("Engagement", "Luna Chat Opened", `Source: ${source}`);
};

// Premium conversion tracking
export const trackPremiumCheckoutStarted = () => {
  trackEvent("Conversion", "Premium Checkout Started", "Premium Page");
};

export const trackPremiumPurchaseCompleted = () => {
  trackEvent("Conversion", "Premium Purchase Completed", "Success Page");
};
