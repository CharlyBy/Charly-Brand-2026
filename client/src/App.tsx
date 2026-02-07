import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import CookieConsent from "@/components/CookieConsent";
import LunaChat from "@/components/LunaChat";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { trackPageView } from "@/lib/analytics";
import Home from "./pages/Home";
import UeberCharly from "./pages/UeberCharly";
import Befreiungsweg from "./pages/Befreiungsweg";
import Leistungen from "./pages/Leistungen";
import Psychotherapie from "./pages/Psychotherapie";
import Coaching from "./pages/Coaching";
import Dualseelen from "./pages/Dualseelen";
import FAQ from "./pages/FAQ";
import Kontakt from "./pages/Kontakt";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import Admin from "./pages/Admin";
import Premium from "./pages/Premium";
import PremiumSuccess from "./pages/PremiumSuccess";
import PremiumCancel from "./pages/PremiumCancel";
import Persoenlichkeitstest from "./pages/Persoenlichkeitstest";
import EnneagramAnalyses from "./pages/EnneagramAnalyses";
import Wissen from "./pages/Wissen";
import WeisheitDesKoerpers from "./pages/WeisheitDesKoerpers";
import AdminWissen from "./pages/AdminWissen";
import AdminWissenNew from "./pages/AdminWissenNew";
import AdminWissenEdit from "./pages/AdminWissenEdit";
import AdminBackup from "./pages/AdminBackup";
import AdminAnalytics from "./pages/AdminAnalytics";
import KnowledgeArticle from "./pages/KnowledgeArticle";
import Bewertung from "./pages/Bewertung";
import AdminBewertungen from "./pages/AdminBewertungen";

function Router() {
  const [location] = useLocation();

  // Track page views on route change
  useEffect(() => {
    trackPageView(location);
  }, [location]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/ueber-charly" component={UeberCharly} />
          <Route path="/befreiungsweg" component={Befreiungsweg} />
          <Route path="/leistungen" component={Leistungen} />
          <Route path="/psychotherapie" component={Psychotherapie} />
          <Route path="/coaching" component={Coaching} />
          <Route path="/dualseelen" component={Dualseelen} />
          <Route path="/persoenlichkeitstest" component={Persoenlichkeitstest} />
          <Route path="/wissen" component={Wissen} />
          <Route path="/wissen/:slug" component={KnowledgeArticle} />
          <Route path="/bewertung" component={Bewertung} />
          <Route path="/faq" component={FAQ} />
          <Route path="/kontakt" component={Kontakt} />
          <Route path="/impressum" component={Impressum} />
          <Route path="/datenschutz" component={Datenschutz} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin/bewertungen" component={AdminBewertungen} />
          <Route path="/admin/enneagram-analyses" component={EnneagramAnalyses} />
          <Route path="/admin/wissen" component={AdminWissen} />
          <Route path="/admin/wissen/neu" component={AdminWissenNew} />
          <Route path="/admin/wissen/:id" component={AdminWissenEdit} />
          <Route path="/admin/backup" component={AdminBackup} />
          <Route path="/admin/analytics" component={AdminAnalytics} />
          <Route path="/premium" component={Premium} />
          <Route path="/premium/success" component={PremiumSuccess} />
          <Route path="/premium/cancel" component={PremiumCancel} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <LunaChat />
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
