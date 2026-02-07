import { useEffect } from "react";
import { useLocation } from "wouter";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  article?: {
    publishedTime?: string;
    author?: string;
    section?: string;
  };
}

const defaultTitle = "Charly Brand - Heilpraktiker für Psychotherapie";
const defaultDescription =
  "Professionelle Psychotherapie in Polling bei Weilheim. Hypnose, systemische Therapie und Persönlichkeitsanalyse für mehr Selbstverständnis und innere Freiheit. Online und vor Ort.";
const defaultImage = "https://www.charlybrand.de/og-image.jpg";

export default function SEO({
  title,
  description = defaultDescription,
  image = defaultImage,
  type = "website",
  article,
}: SEOProps) {
  const [location] = useLocation();
  const fullTitle = title ? `${title} | Charly Brand` : defaultTitle;
  const canonicalUrl = `https://www.charlybrand.de${location}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    updateMetaTag("description", description);
    updateMetaTag("og:title", fullTitle, "property");
    updateMetaTag("og:description", description, "property");
    updateMetaTag("og:image", image, "property");
    updateMetaTag("og:url", canonicalUrl, "property");
    updateMetaTag("og:type", type, "property");
    updateMetaTag("og:locale", "de_DE", "property");
    updateMetaTag("og:site_name", "Charly Brand", "property");

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", fullTitle);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", image);

    // Article-specific tags
    if (type === "article" && article) {
      if (article.publishedTime) {
        updateMetaTag("article:published_time", article.publishedTime, "property");
      }
      if (article.author) {
        updateMetaTag("article:author", article.author, "property");
      }
      if (article.section) {
        updateMetaTag("article:section", article.section, "property");
      }
    }

    // Update canonical link
    updateCanonicalLink(canonicalUrl);
  }, [fullTitle, description, image, canonicalUrl, type, article]);

  return null;
}

function updateMetaTag(
  name: string,
  content: string,
  attribute: "name" | "property" = "name"
) {
  let element = document.querySelector(
    `meta[${attribute}="${name}"]`
  ) as HTMLMetaElement;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.content = content;
}

function updateCanonicalLink(url: string) {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }

  element.href = url;
}

// Structured Data Component
interface StructuredDataProps {
  data: object;
}

export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    script.id = "structured-data-" + Math.random().toString(36).substr(2, 9);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [data]);

  return null;
}

// LocalBusiness Schema for Charly Brand
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "@id": "https://www.charlybrand.de/#organization",
  name: "Charly Brand - Heilpraktiker für Psychotherapie",
  description:
    "Professionelle Psychotherapie, Hypnose und systemische Therapie in Polling bei Weilheim. Spezialisiert auf Innere-Kind-Arbeit, Ängste, Traumata und Dualseelen-Partnerschaften.",
  url: "https://www.charlybrand.de",
  logo: "https://www.charlybrand.de/logo.png",
  image: "https://www.charlybrand.de/og-image.jpg",
  telephone: "+49-179-2012051",
  email: "kontakt@charlybrand.de",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Tiefenbachring 3",
    addressLocality: "Polling",
    postalCode: "82398",
    addressCountry: "DE",
    addressRegion: "Bayern",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 47.8333,
    longitude: 11.1667,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  priceRange: "€€",
  areaServed: {
    "@type": "GeoCircle",
    geoMidpoint: {
      "@type": "GeoCoordinates",
      latitude: 47.8333,
      longitude: 11.1667,
    },
    geoRadius: "50000", // 50km radius
  },
  sameAs: [
    // Add social media profiles here if available
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Therapeutische Leistungen",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Hypnosetherapie",
          description: "Therapeutische Hypnose für Ängste, Phobien und Traumata",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Innere-Kind-Arbeit",
          description: "Integration alter emotionaler Verletzungen durch achtsame Innere-Kind-Arbeit",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Systemische Therapie",
          description: "Ganzheitliche therapeutische Begleitung",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Dualseelen-Beratung",
          description: "Expertise in der Begleitung intensiver Seelenverbindungen",
        },
      },
    ],
  },
};

// Person Schema for Charly Brand
export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://www.charlybrand.de/#person",
  name: "Charly Brand",
  jobTitle: "Heilpraktiker für Psychotherapie",
  description:
    "Heilpraktiker für Psychotherapie mit Spezialisierung auf Hypnose, systemische Therapie und Persönlichkeitsanalyse. Begleitet Menschen auf ihrem Weg zu mehr Selbstverständnis und innerer Freiheit.",
  url: "https://www.charlybrand.de",
  image: "https://www.charlybrand.de/charly-brand.jpg",
  telephone: "+49-179-2012051",
  email: "kontakt@charlybrand.de",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Tiefenbachring 3",
    addressLocality: "Polling",
    postalCode: "82398",
    addressCountry: "DE",
  },
  worksFor: {
    "@id": "https://www.charlybrand.de/#organization",
  },
  knowsAbout: [
    "Psychotherapie",
    "Hypnose",
    "Systemische Therapie",
    "Innere-Kind-Arbeit",
    "Traumatherapie",
    "Enneagramm",
    "Dualseelen-Partnerschaften",
  ],
  alumniOf: {
    "@type": "EducationalOrganization",
    name: "Heilpraktikerschule",
  },
};
