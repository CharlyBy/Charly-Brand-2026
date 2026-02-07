import { useEffect, useRef, useState } from "react";
import { trpc } from "../lib/trpc";

/**
 * Generate a unique session ID for tracking
 */
function getSessionId(): string {
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

/**
 * Detect device type
 */
function getDeviceType(): "desktop" | "mobile" | "tablet" {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

/**
 * Hook to track article views with engagement metrics
 */
export function useArticleTracking(articleId: number | null) {
  const trackViewMutation = trpc.analytics.trackView.useMutation();
  
  const [scrollDepth, setScrollDepth] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollDepthRef = useRef<number>(0);
  const hasTrackedRef = useRef<boolean>(false);
  
  useEffect(() => {
    if (!articleId) return;
    
    // Reset tracking state
    startTimeRef.current = Date.now();
    maxScrollDepthRef.current = 0;
    hasTrackedRef.current = false;
    
    // Scroll depth tracking
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      const scrollPercentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );
      
      const clampedPercentage = Math.min(100, Math.max(0, scrollPercentage));
      setScrollDepth(clampedPercentage);
      
      // Track maximum scroll depth
      if (clampedPercentage > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = clampedPercentage;
      }
    };
    
    // Track view on page leave or visibility change
    const trackView = () => {
      if (hasTrackedRef.current) return;
      hasTrackedRef.current = true;
      
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000); // seconds
      const bounced = timeSpent < 10; // Less than 10 seconds = bounced
      
      trackViewMutation.mutate({
        articleId,
        sessionId: getSessionId(),
        deviceType: getDeviceType(),
        timeSpent,
        scrollDepth: maxScrollDepthRef.current,
        bounced,
      });
    };
    
    // Track on visibility change (tab switch, minimize)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackView();
      }
    };
    
    // Track on page unload (navigation away, close tab)
    const handleBeforeUnload = () => {
      trackView();
    };
    
    // Add event listeners
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    // Initial scroll check
    handleScroll();
    
    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      // Track view on component unmount (navigation within app)
      trackView();
    };
  }, [articleId]);
  
  return {
    scrollDepth,
    maxScrollDepth: maxScrollDepthRef.current,
  };
}
