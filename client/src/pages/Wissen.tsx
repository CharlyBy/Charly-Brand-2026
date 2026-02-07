import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { BookOpen, Clock } from "lucide-react";
import SEO from "@/components/SEO";
import { KnowledgeSearchBar } from "@/components/KnowledgeSearchBar";

const CATEGORIES = [
  { value: "alle", label: "Alle" },
  { value: "körper-seele", label: "Körper & Seele" },
  { value: "beziehungen", label: "Beziehungen" },
  { value: "angst-mut", label: "Angst & Mut" },
  { value: "selbsterkenntnis", label: "Selbsterkenntnis" },
];

const getCategoryLabel = (value: string) => {
  const category = CATEGORIES.find((c) => c.value === value);
  return category?.label || value;
};

export default function Wissen() {
  const [selectedCategory, setSelectedCategory] = useState("alle");
  
  const seoDescription = "Entdecke wissenschaftlich fundierte Einblicke in Psychotherapie, Körperarbeit und Selbsterkenntnis. Kostenlose PDF-Artikel zu Hypnose, Innere-Kind-Arbeit, Beziehungen und mehr.";

  // Load articles from database
  const { data: articles, isLoading } = trpc.knowledge.getAllPublished.useQuery();

  // Filter articles by category
  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    if (selectedCategory === "alle") return articles;
    return articles.filter((article) => article.category === selectedCategory);
  }, [articles, selectedCategory]);

  return (
    <>
      <SEO
        title="Wissen"
        description={seoDescription}
      />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="container py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welche Themen interessieren dich?
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Entdecke wissenschaftlich fundierte Einblicke in die Welt der
          Psychotherapie, Körperarbeit und Selbsterkenntnis.
        </p>
        
        {/* Search Bar */}
        <KnowledgeSearchBar />
      </div>

      {/* Category Filter */}
      <div className="container pb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.value)}
              className="rounded-full"
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="container pb-16">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Lade Artikel...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Keine Artikel in dieser Kategorie gefunden.
            </p>
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <img
                    src={article.thumbnailPath}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <Badge className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm">
                    {getCategoryLabel(article.category)}
                  </Badge>
                </div>

                {/* Content */}
                <CardHeader>
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">
                    {article.description}
                  </p>
                </CardContent>

                <CardFooter>
                  <Link href={`/wissen/${article.slug}`} className="w-full">
                    <Button size="lg" className="w-full">
                      Reise starten
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="container pb-16">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Möchtest du persönlich begleitet werden?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Sprich mit Luna über die Inhalte oder vereinbare einen
              persönlichen Termin für individuelle Begleitung.
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
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
