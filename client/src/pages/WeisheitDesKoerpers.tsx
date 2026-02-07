import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Download } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function WeisheitDesKoerpers() {
  // Generate array of 15 page numbers for PDF images
  const pageNumbers = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="container py-6">
        <div className="flex items-center justify-between">
          <Link href="/wissen">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
          </Link>
          <a
            href="/Die_Weisheit_des_Körpers.pdf"
            download="Die_Weisheit_des_Körpers.pdf"
          >
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </a>
        </div>
      </div>

      {/* Slide Presentation */}
      <div className="container pb-16">
        <Swiper
          modules={[Navigation, Pagination, Keyboard]}
          navigation
          pagination={{
            type: "fraction",
            formatFractionCurrent: (number) => number,
            formatFractionTotal: (number) => number,
          }}
          keyboard={{
            enabled: true,
            onlyInViewport: true,
          }}
          spaceBetween={0}
          slidesPerView={1}
          className="rounded-lg shadow-2xl bg-white"
          style={{
            "--swiper-navigation-color": "#8B5CF6",
            "--swiper-pagination-color": "#8B5CF6",
          } as React.CSSProperties}
        >
          {pageNumbers.map((pageNum) => (
            <SwiperSlide key={pageNum}>
              <div className="flex items-center justify-center bg-white p-4 md:p-8">
                <img
                  src={`/images/weisheit-des-koerpers/page-${String(pageNum).padStart(2, "0")}.webp`}
                  alt={`Seite ${pageNum}`}
                  loading="lazy"
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  style={{ maxHeight: "80vh" }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* CTA after presentation */}
        <div className="mt-12 text-center space-y-4">
          <h2 className="text-2xl font-bold">Möchtest du tiefer eintauchen?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sprich mit Luna über die Inhalte oder vereinbare einen persönlichen
            Termin für individuelle Begleitung.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              onClick={() => {
                const lunaButton = document.querySelector(
                  '[aria-label="Chat mit Luna öffnen"]'
                ) as HTMLButtonElement;
                if (lunaButton) lunaButton.click();
              }}
            >
              Mit Luna sprechen
            </Button>
            <Link href="/kontakt">
              <Button size="lg" variant="outline">
                Termin vereinbaren
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
