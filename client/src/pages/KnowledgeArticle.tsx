import { useRoute, useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { ArrowLeft, Download, MessageCircle, Calendar } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard } from "swiper/modules";
import { useState } from "react";
import { useArticleTracking } from "../hooks/useArticleTracking";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

export default function KnowledgeArticle() {
  const [, params] = useRoute("/wissen/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug;

  const [currentSlide, setCurrentSlide] = useState(1);

  const { data: article, isLoading, error } = trpc.knowledge.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  // Track article view with engagement metrics
  const { scrollDepth } = useArticleTracking(article?.id ?? null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Artikel...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Artikel nicht gefunden</h1>
          <Button onClick={() => setLocation("/wissen")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  // Extract image URLs from pdfPath (assuming they're stored in S3 with pattern)
  const baseUrl = article.pdfPath.replace("/document.pdf", "");
  const imageUrls = Array.from({ length: article.pageCount }, (_, i) => {
    const pageNum = String(i + 1).padStart(2, "0");
    return `${baseUrl}/page-${pageNum}.webp`;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation("/wissen")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </Button>

            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {currentSlide} / {article.pageCount}
              </div>
              <a href={article.pdfPath} download>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{
            width: `${(currentSlide / article.pageCount) * 100}%`,
          }}
        />
      </div>

      {/* Slide Presentation */}
      <div className="container mx-auto px-4 py-8">
        <Swiper
          modules={[Navigation, Keyboard]}
          navigation
          keyboard={{ enabled: true }}
          onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex + 1)}
          className="rounded-lg shadow-lg"
          style={{ maxHeight: "80vh" }}
        >
          {imageUrls.map((url, index) => (
            <SwiperSlide key={index}>
              <div className="flex items-center justify-center bg-white p-4">
                <img
                  src={url}
                  alt={`${article.title} - Seite ${index + 1}`}
                  className="max-h-[75vh] w-auto object-contain"
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Article Info */}
        <div className="mt-8 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">
            {article.description}
          </p>

          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {article.pageCount} Seiten · {article.readingTime} Min.
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="flex-1"
              onClick={() => setLocation("/?luna=open")}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Mit Luna über dieses Thema sprechen
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={() => setLocation("/kontakt")}
            >
              Termin vereinbaren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
