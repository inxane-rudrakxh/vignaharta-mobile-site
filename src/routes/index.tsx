import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Sparkles,
  Palette,
  Shield,
  Watch,
  Plug,
  Zap,
  Star,
  MapPin,
  Truck,
  Gem,
  HeartHandshake,
  BadgeIndianRupee,
  MessageCircle,
  Phone,
  Instagram,
  Facebook,
  ArrowRight,
  Quote,
} from "lucide-react";
import heroPhone from "@/assets/hero-phone.png";
import aboutArt from "@/assets/about-art.jpg";
import { TranslationKey } from "@/i18n";
import { useLanguage } from "@/components/Layout";

export const Route = createFileRoute("/")({ component: Landing });

const reviews = [
  {
    name: "Rahul K.",
    en: "Best mobile shop in Ghugus. Got my phone repaired same day — excellent service!",
    hi: "घुगस की सबसे बेहतरीन शॉप। उसी दिन फोन रिपेयर हो गया!",
  },
  {
    name: "Priya M.",
    en: "Custom skin for my laptop looks amazing. Very professional work.",
    hi: "लैपटॉप की कस्टम स्किन बहुत शानदार है। प्रोफेशनल काम।",
  },
  {
    name: "Akash D.",
    en: "Bought a second-hand iPhone. Fully tested and works perfectly. Honest shop!",
    hi: "सेकंड-हैंड iPhone खरीदा। टेस्टेड और परफेक्ट चलता है।",
  },
  {
    name: "Sneha T.",
    en: "Staff is very helpful. They guided me to the right phone within my budget.",
    hi: "स्टाफ बहुत हेल्पफुल है। बजट में सही फोन दिलाया।",
  },
  {
    name: "Aman S.",
    en: "AirPods skin is superb — exactly what I wanted. Will definitely come back.",
    hi: "AirPods स्किन कमाल की है। फिर ज़रूर आऊंगा।",
  },
  {
    name: "Rohan P.",
    en: "Quick repair, fair price, friendly team. Vighnaharta is the best!",
    hi: "तेज़ रिपेयर, सही दाम, फ्रेंडली टीम। विघ्नहर्ता बेस्ट है!",
  },
];

const brands = [
  { name: "Apple", slug: "apple" },
  { name: "Samsung", slug: "samsung" },
  { name: "OnePlus", slug: "oneplus" },
  { name: "Oppo", slug: "oppo" },
  { name: "Vivo", slug: "vivo" },
  { name: "Redmi", slug: "xiaomi" },
  {
    name: "Realme",
    slug: "realme",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Realme_logo.svg/1920px-Realme_logo.svg.png",
  },
  { name: "Motorola", slug: "motorola" },
];

function Landing() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Hero />
      <TrustBar />
      <About />
      <Categories />
      <Testimonials />
      <WhyUs />
      <CustomCta />
      <Contact />
    </>
  );
}

function Hero() {
  const { t } = useLanguage();
  return (
    <section className="relative grain min-h-screen pt-28 pb-20 flex items-center">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 70% 40%, rgba(212,160,23,0.18), transparent 60%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
        <div className="reveal mt-8 lg:mt-0 order-2 lg:order-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            {t("locationCity")}
          </div>
          <h1 className="mt-6 font-display text-[clamp(2.5rem,8vw,7rem)] leading-[0.92] uppercase">
            {t("heroTitle1")} <br className="hidden sm:block" />
            <span className="text-gradient-gold">{t("heroTitle2")}</span>
          </h1>
          <p className="mt-6 max-w-lg mx-auto lg:mx-0 text-muted-foreground text-base sm:text-lg">
            {t("heroDesc")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4">
            <a
              href="#products"
              className="group inline-flex justify-center items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-primary-foreground animate-pulse-gold hover:scale-[1.02] transition"
            >
              {t("exploreCollection")}{" "}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a
              href="#custom"
              className="inline-flex justify-center items-center gap-2 rounded-full border border-gold/60 px-7 py-3.5 text-sm font-semibold text-gold hover:bg-gold/10 transition"
            >
              {t("getCustomSkin")}
            </a>
          </div>
          <div className="mt-10 flex flex-wrap justify-center lg:justify-start items-center gap-2 sm:gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 text-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span>{t("lovedBy")}</span>
          </div>
        </div>

        <div className="relative reveal order-1 lg:order-2">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 blur-3xl opacity-80"
            style={{ background: "var(--gradient-radial-gold)" }}
          />
          <img
            src={heroPhone}
            alt="Premium custom phone skin in gold"
            width={1024}
            height={1280}
            className="mx-auto w-full max-w-[420px] animate-float drop-shadow-[0_30px_60px_rgba(212,160,23,0.25)]"
          />
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const { t } = useLanguage();
  const trustItems = [
    { icon: Zap, label: t("trustDelivery") },
    { icon: Palette, label: t("trustCustom") },
    { icon: Star, label: t("trustRated") },
    { icon: Shield, label: t("trustQuality") },
    { icon: MapPin, label: t("trustFav") },
  ];
  const items = [...trustItems, ...trustItems];
  return (
    <section className="relative border-y border-border/60 bg-card/40 overflow-hidden">
      <div className="marquee flex gap-12 whitespace-nowrap py-5">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
            <it.icon className="h-4 w-4 text-gold" />
            <span className="tracking-wide">{it.label}</span>
            <span className="text-gold">◆</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionTitle({
  kicker,
  title,
  sub,
}: {
  kicker?: string;
  title: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="max-w-2xl reveal">
      {kicker && <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">{kicker}</div>}
      <h2 className="font-display text-4xl sm:text-6xl uppercase leading-[0.95]">{title}</h2>
      {sub && <p className="mt-4 text-muted-foreground text-lg">{sub}</p>}
    </div>
  );
}

function About() {
  const { t } = useLanguage();
  return (
    <section id="about" className="relative py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
        <div className="relative reveal">
          <div className="aspect-square overflow-hidden rounded-2xl border border-gold/30 glow-gold-soft">
            <img
              src={aboutArt}
              alt="Geometric gold pattern"
              loading="lazy"
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 hidden sm:block rounded-xl bg-card border border-border px-5 py-4">
            <div className="font-display text-3xl text-gold">5★</div>
            <div className="text-xs text-muted-foreground">{t("ratedStore")}</div>
          </div>
        </div>
        <div>
          <SectionTitle
            kicker={t("ourStory")}
            title={
              <>
                {t("aboutTitle1")}
                <span className="text-gradient-gold">{t("aboutTitle2")}</span>
              </>
            }
          />
          <p className="mt-6 text-muted-foreground leading-relaxed reveal">{t("aboutDesc")}</p>
          <div className="mt-8 grid grid-cols-3 gap-4 reveal">
            {[
              ["500+", t("happyCustomers")],
              ["100%", t("customDesigns")],
              ["100%", t("genuineProducts")],
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl border border-border bg-card/50 p-5">
                <div className="font-display text-3xl text-gold">{n}</div>
                <div className="text-xs text-muted-foreground mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Categories() {
  const { t } = useLanguage();
  const categories = [
    { icon: Palette, title: t("catSkins"), desc: t("catSkinsDesc") },
    { icon: Shield, title: t("catCovers"), desc: t("catCoversDesc") },
    { icon: Watch, title: t("catStraps"), desc: t("catStrapsDesc") },
    { icon: Plug, title: t("catAcc"), desc: t("catAccDesc") },
  ];

  return (
    <section
      id="products"
      className="py-28 bg-gradient-to-b from-transparent via-card/20 to-transparent"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle
          kicker={t("smartphonesKicker")}
          title={
            <>
              {t("everyBrand")}
              <span className="text-gradient-gold">{t("inOneShop")}</span>
            </>
          }
          sub={t("brandSub")}
        />
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((b) => (
            <div
              key={b.name}
              className="reveal tilt group relative rounded-2xl border border-border bg-card aspect-[4/3] flex flex-col items-center justify-center gap-3 p-6 hover:border-gold/60 overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(212,160,23,0.18), transparent 70%)",
                }}
              />
              <img
                src={b.logoUrl ?? `https://cdn.simpleicons.org/${b.slug}/D4A017`}
                alt={`${b.name} logo`}
                loading="lazy"
                className="h-10 sm:h-12 w-auto object-contain transition group-hover:scale-110"
              />
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground group-hover:text-gold transition">
                {b.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-24 max-w-2xl reveal">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">
            {t("accessoriesKicker")}
          </div>
          <h3 className="font-display text-3xl sm:text-5xl uppercase leading-[0.95]">
            {t("builtAround")}
            <span className="text-gradient-gold">{t("yourDevice")}</span>
          </h3>
          <p className="mt-4 text-muted-foreground">{t("accSub")}</p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((c) => (
            <div
              key={c.title}
              className="reveal tilt group relative rounded-2xl border border-border bg-card p-7 hover:border-gold/60"
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition"
                style={{
                  background:
                    "radial-gradient(circle at top, rgba(212,160,23,0.12), transparent 60%)",
                }}
              />
              <c.icon className="h-9 w-9 text-gold" strokeWidth={1.5} />
              <h3 className="mt-6 text-xl font-semibold tracking-wide">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              <div className="mt-6 inline-flex items-center gap-1 text-xs text-gold opacity-0 group-hover:opacity-100 transition">
                {t("browse")} <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { lang, t } = useLanguage();
  return (
    <section id="reviews" className="py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle
          kicker={t("reviewsKicker")}
          title={
            <>
              {t("whatGhugus")}
              <span className="text-gradient-gold">{t("isSaying")}</span>
            </>
          }
        />
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <article
              key={i}
              className="reveal tilt relative rounded-2xl border border-border bg-card p-7 overflow-hidden"
            >
              <Quote className="absolute -top-2 -right-2 h-24 w-24 text-gold/5" />
              <div className="flex gap-0.5 text-gold">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-foreground/90 leading-relaxed">"{r[lang]}"</p>
              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-border/60">
                <div className="h-9 w-9 rounded-full bg-gold/15 ring-gold flex items-center justify-center text-gold font-semibold text-sm">
                  {r.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="text-sm">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{t("verifiedCustomer")}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const { t } = useLanguage();
  const whyUs = [
    { icon: Palette, title: t("customDesigns"), desc: t("wuCustomDesc") },
    { icon: Truck, title: t("wuFastTitle"), desc: t("wuFastDesc") },
    { icon: Gem, title: t("wuPremiumTitle"), desc: t("wuPremiumDesc") },
    { icon: HeartHandshake, title: t("wuFriendlyTitle"), desc: t("wuFriendlyDesc") },
    { icon: BadgeIndianRupee, title: t("wuPricesTitle"), desc: t("wuPricesDesc") },
    { icon: MapPin, title: t("wuLocalTitle"), desc: t("wuLocalDesc") },
  ];

  return (
    <section className="py-28 bg-card/30 border-y border-border/60">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle
          kicker={t("whyUsKicker")}
          title={
            <>
              {t("builtOn")}
              <span className="text-gradient-gold">{t("trustCraft")}</span>
            </>
          }
        />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {whyUs.map((w) => (
            <div
              key={w.title}
              className="reveal flex gap-4 rounded-2xl border border-border bg-background/40 p-6"
            >
              <div className="shrink-0 h-11 w-11 rounded-lg bg-gold/10 ring-gold flex items-center justify-center">
                <w.icon className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h3 className="font-semibold tracking-wide">{w.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CustomCta() {
  const { t } = useLanguage();
  return (
    <section id="custom" className="relative py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-gold/40 p-10 sm:p-16 text-center reveal">
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(212,160,23,0.18) 0%, rgba(10,10,10,0) 50%, rgba(212,160,23,0.18) 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[60rem] blur-3xl"
            style={{ background: "var(--gradient-radial-gold)" }}
          />
          <div className="text-xs tracking-[0.3em] uppercase text-gold">{t("madeForYou")}</div>
          <h2 className="mt-4 font-display text-5xl sm:text-7xl uppercase leading-[0.95]">
            {t("wantSomething")}
            <br />
            <span className="text-gradient-gold">{t("trulyYours")}</span>
          </h2>
          <p className="mt-5 text-muted-foreground max-w-xl mx-auto">{t("customDesc")}</p>
          <a
            href="#contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-semibold text-primary-foreground animate-pulse-gold hover:scale-[1.03] transition"
          >
            {t("startCustomizing")} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const { t } = useLanguage();
  return (
    <section id="contact" className="py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-12">
        <div className="reveal">
          <SectionTitle
            kicker={t("visitUs")}
            title={
              <>
                {t("findUsIn")}
                <span className="text-gradient-gold">{t("ghugus")}</span>
              </>
            }
          />
          <div className="mt-8 space-y-5">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gold mt-0.5" />
              <div>
                <div className="font-semibold">Vignaharta Mobile Shop & Repairing</div>
                <div className="text-sm text-muted-foreground">{t("locationFull")}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-gold mt-0.5" />
              <div>
                <div className="font-semibold">{t("businessHoursTitle")}</div>
                <div className="text-sm text-muted-foreground">{t("businessHours")}</div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://wa.me/+917261934434"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-black hover:opacity-90 transition"
            >
              <MessageCircle className="h-4 w-4" /> {t("chatWhatsApp")}
            </a>
            <a
              href="tel:+917261934434"
              className="inline-flex items-center gap-2 rounded-full border border-gold/60 px-6 py-3 text-sm font-semibold text-gold hover:bg-gold/10 transition"
            >
              <Phone className="h-4 w-4" /> {t("callShop")}
            </a>
            <a
              href="https://www.instagram.com/vighnaharta_mobile_ghugus/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#E1306C]/60 bg-card px-6 py-3 text-sm font-semibold text-[#E1306C] hover:bg-[#E1306C]/10 transition"
            >
              <Instagram className="h-4 w-4" /> {t("followUsInsta")}
            </a>
          </div>
        </div>
        <div className="reveal rounded-2xl overflow-hidden border border-border bg-card aspect-[4/3] lg:aspect-auto min-h-[300px]">
          <iframe
            title="Map"
            src="https://www.google.com/maps?q=Ghugus,Maharashtra&output=embed"
            className="w-full h-full grayscale contrast-125"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
