import { Link } from "wouter";
import { trackAdminLogin } from "@/lib/analytics";
import { Cookie } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Charly Brand</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Heilpraktiker für Psychotherapie
              <br />
              <span className="text-primary font-semibold">Wegbereiter & Wegbegleiter</span>
              <br />
              <br />
              Dein Weg zu mehr innerer Klarheit und Lebensfreude.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ueber-charly">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Über Charly
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/psychotherapie">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Psychotherapie
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/coaching">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Coaching
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/persoenlichkeitstest">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Persönlichkeitstest
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    FAQ
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/kontakt">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Kontakt
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Rechtliches</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/impressum">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Impressum
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/datenschutz">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Datenschutz
                  </span>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    localStorage.removeItem("cookie-consent");
                    localStorage.removeItem("analytics-consent");
                    window.location.reload();
                  }}
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Cookie className="h-3.5 w-3.5" />
                  Cookie-Einstellungen
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Wissenschaftlicher Disclaimer */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground leading-relaxed">
            <p className="font-semibold mb-2">Hinweis zur Einordnung der angebotenen Methoden:</p>
            <p>
              Die hier vorgestellten Methoden (insbesondere Rückführung, Arbeit mit dem inneren Kind, energetische Ansätze) ersetzen keinen Arztbesuch. Die Wirksamkeit ist teilweise wissenschaftlich nicht im Sinne der evidenzbasierten Schulmedizin belegt, beruht aber auf langjährigen Erfahrungswerten.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            © {currentYear}{" "}
            <Link href="/admin">
              <span className="cursor-pointer" onClick={trackAdminLogin}>
                Charly
              </span>
            </Link>{" "}
            Brand. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
