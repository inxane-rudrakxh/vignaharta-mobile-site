import { createContext, useContext, useState, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Globe, ArrowRight, Menu, X, Instagram, Facebook, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { translations, TranslationKey, Language } from "@/i18n";

export const LanguageContext = createContext<{
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
} | null>(null);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const t = (key: TranslationKey) => translations[key]?.[lang] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-gold bg-white overflow-hidden">
        <img
          src={logo}
          alt="Vignaharta Mobile Shop & Repairing logo"
          className="h-full w-full object-cover scale-110"
        />
        <span className="absolute inset-0 rounded-full glow-gold-soft opacity-0 group-hover:opacity-100 transition" />
      </span>
      <span className="font-display tracking-[0.18em] text-sm hidden sm:inline-block whitespace-nowrap">
        VIGNAHARTA MOBILE SHOP & REPAIRING
      </span>
      <span className="font-display tracking-[0.18em] text-sm sm:hidden whitespace-nowrap">
        VIGNAHARTA
      </span>
    </Link>
  );
}

export function Nav() {
  const { lang, setLang, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/90 border-b border-border/60">
      <nav className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Logo />
        <ul className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <li>
            <Link to="/products" className="hover:text-gold transition-colors">
              {t("navProducts")}
            </Link>
          </li>
          <li>
            <Link to="/" hash="about" className="hover:text-gold transition-colors">
              {t("navAbout")}
            </Link>
          </li>
          <li>
            <Link to="/" hash="reviews" className="hover:text-gold transition-colors">
              {t("navReviews")}
            </Link>
          </li>
          <li>
            <Link to="/" hash="contact" className="hover:text-gold transition-colors">
              {t("navContact")}
            </Link>
          </li>
        </ul>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === "en" ? "HI" : "EN"}
          </button>
          <Link
            to="/custom-skin"
            className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium bg-gold text-primary-foreground hover:opacity-90 transition"
          >
            {t("getCustomSkin")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md absolute top-16 left-0 w-full p-5 flex flex-col gap-4 shadow-xl">
          <Link
            to="/products"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-foreground text-sm font-medium py-2 border-b border-border/40 hover:text-gold transition-colors"
          >
            {t("navProducts")}
          </Link>
          <Link
            to="/"
            hash="about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-foreground text-sm font-medium py-2 border-b border-border/40 hover:text-gold transition-colors"
          >
            {t("navAbout")}
          </Link>
          <Link
            to="/"
            hash="reviews"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-foreground text-sm font-medium py-2 border-b border-border/40 hover:text-gold transition-colors"
          >
            {t("navReviews")}
          </Link>
          <Link
            to="/"
            hash="contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-foreground text-sm font-medium py-2 border-b border-border/40 hover:text-gold transition-colors"
          >
            {t("navContact")}
          </Link>
          <Link
            to="/custom-skin"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-2 inline-flex justify-center items-center gap-2 rounded-full px-4 py-3 text-sm font-medium bg-gold text-primary-foreground hover:opacity-90 transition"
          >
            {t("getCustomSkin")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">{t("footerDesc")}</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-gold mb-4">{t("explore")}</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-gold transition">
                {t("home")}
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-gold transition">
                {t("navProducts")}
              </Link>
            </li>
            <li>
              <Link to="/" hash="reviews" className="hover:text-gold transition">
                {t("navReviews")}
              </Link>
            </li>
            <li>
              <Link to="/" hash="contact" className="hover:text-gold transition">
                {t("navContact")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-gold mb-4">{t("follow")}</div>
          <div className="flex gap-3">
            {[
              { icon: Instagram, href: "https://www.instagram.com/vighnaharta_mobile_ghugus/" },
              { icon: Facebook, href: "https://www.facebook.com/vighnahartamobile" },
              { icon: MessageCircle, href: "https://wa.me/+917261934434" },
            ].map(({ icon: Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="h-10 w-10 rounded-full border border-border hover:border-gold hover:text-gold transition flex items-center justify-center text-muted-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground flex flex-wrap justify-center items-center gap-1">
        {t("copyright")} <span className="text-gold">❤</span> {t("forOurCustomers")}
      </div>
    </footer>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <div className="dark min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
        <Nav />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
