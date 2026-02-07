export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO = "/images/logo.png";

export const LEMNISCUS_BOOKING_URL = "https://my.lemniscus.de/ot/2af3f715-a895-4836-b30a-101c4df553f3";

// Helper function to open Luna chat
export const openLunaChat = () => {
  window.dispatchEvent(new Event('openLunaChat'));
  
  // Track Luna chat opened event
  if (typeof window !== 'undefined') {
    import('@/lib/analytics').then(({ trackLunaChatOpened }) => {
      trackLunaChatOpened();
    });
  }
};

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
