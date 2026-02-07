import { APP_LOGO, LEMNISCUS_BOOKING_URL } from "@/const";
import { trackAppointmentClick } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Start" },
    { href: "/ueber-charly", label: "Über Charly" },
    { href: "/psychotherapie", label: "Psychotherapie" },
    { href: "/coaching", label: "Coaching" },
    { href: "/wissen", label: "Wissen" },
    { href: "/persoenlichkeitstest", label: "Persönlichkeitstest" },
    { href: "/faq", label: "FAQ" },
    { href: "/kontakt", label: "Kontakt" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <img
              src={APP_LOGO}
              alt="Charly Brand"
              className="h-10 w-auto cursor-pointer"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                    isActive(item.href)
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
            <a href={LEMNISCUS_BOOKING_URL} target="_blank" rel="noopener noreferrer" onClick={trackAppointmentClick}>
              <Button size="sm" className="ml-4">
                Termin buchen
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`block text-sm font-medium transition-colors cursor-pointer ${
                      isActive(item.href)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              <a href={LEMNISCUS_BOOKING_URL} target="_blank" rel="noopener noreferrer" onClick={trackAppointmentClick} className="w-full">
                <Button size="sm" className="w-full mt-2">
                  Termin buchen
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
