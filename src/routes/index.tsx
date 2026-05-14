import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Sparkles, Palette, Shield, Watch, Plug, Zap, Star, MapPin,
  Truck, Gem, HeartHandshake, BadgeIndianRupee, MessageCircle, Phone,
  Instagram, Facebook, ArrowRight, Quote,
} from "lucide-react";
import heroPhone from "@/assets/hero-phone.png";
import aboutArt from "@/assets/about-art.png";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({ component: Landing });

const reviews = [
  { name: "Shyam Wankhede", text: "Best smartphone accessory shop in Chandrapur. They help you customize your smartphone to the next level." },
  { name: "Aiz Suriya", text: "Zeher quality products. No compromise on quality — best products at best prices." },
  { name: "FT Baby Vlog", text: "Fast and efficient! Ordered Monday evening, delivered the next day!" },
  { name: "Anushri Dasarwar", text: "Great collection of covers and accessories with good service." },
  { name: "Mrunmayi Dethe", text: "Staff were very polite — purchased a beautiful cover and just loved it." },
  { name: "Mohsin Sheikh", text: "Premium skin collection with affordable price." },
];

const trustItems = [
  { icon: Zap, label: "Next-Day Delivery Available" },
  { icon: Palette, label: "100% Custom Designs" },
  { icon: Star, label: "5-Star Rated Store" },
  { icon: Shield, label: "Zero Compromise on Quality" },
  { icon: MapPin, label: "Chandrapur's Favourite Shop" },
];

const categories = [
  { icon: Palette, title: "Custom Phone Skins", desc: "Designs made just for your device." },
  { icon: Shield, title: "Mobile Covers & Cases", desc: "Premium protection, premium feel." },
  { icon: Watch, title: "Smartwatch Straps", desc: "Style your wrist, every day." },
  { icon: Plug, title: "Mobile Accessories", desc: "Cables, chargers, and the essentials." },
];

const brands = [
  { name: "Apple",    slug: "apple" },
  { name: "Samsung",  slug: "samsung" },
  { name: "OnePlus",  slug: "oneplus" },
  { name: "Oppo",     slug: "oppo" },
  { name: "Vivo",     slug: "vivo" },
  { name: "Redmi",    slug: "xiaomi" },
  { name: "Realme",   slug: "realme", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Realme_logo.svg/1920px-Realme_logo.svg.png" },
  { name: "Motorola", slug: "motorola" },
];

const whyUs = [
  { icon: Palette, title: "Custom Designs", desc: "Unique skins and covers made just for you." },
  { icon: Truck, title: "Fast Delivery", desc: "Same or next-day availability." },
  { icon: Gem, title: "Premium Quality", desc: "No compromises, ever." },
  { icon: HeartHandshake, title: "Friendly Staff", desc: "Always here to help you choose." },
  { icon: BadgeIndianRupee, title: "Best Prices", desc: "Luxury doesn't have to cost a fortune." },
  { icon: MapPin, title: "Local & Trusted", desc: "Chandrapur's most loved mobile shop." },
];

function Landing() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="dark min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <TrustBar />
      <About />
      <Categories />
      <Testimonials />
      <WhyUs />
      <CustomCta />
      <Contact />
      <Footer />
    </div>
  );
}

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2.5 group">
      <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full ring-gold bg-white overflow-hidden">
        <img src={logo} alt="R Creator logo" className="h-full w-full object-cover scale-110" />
        <span className="absolute inset-0 rounded-full glow-gold-soft opacity-0 group-hover:opacity-100 transition" />
      </span>
      <span className="font-display tracking-[0.18em] text-sm">R CREATOR</span>
    </a>
  );
}

function Nav() {
  return (
    <header id="top" className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/60 border-b border-border/60">
      <nav className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Logo />
        <ul className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {["Products", "About", "Reviews", "Contact"].map((l) => (
            <li key={l}>
              <a href={`#${l.toLowerCase()}`} className="hover:text-gold transition-colors">{l}</a>
            </li>
          ))}
        </ul>
        <a href="#custom" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium bg-gold text-primary-foreground hover:opacity-90 transition">
          Get Custom Skin <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative grain min-h-screen pt-28 pb-20 flex items-center">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse 60% 50% at 70% 40%, rgba(212,160,23,0.18), transparent 60%)" }}
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-12 items-center w-full">
        <div className="reveal">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            Chandrapur · Maharashtra
          </div>
          <h1 className="mt-6 font-display text-[clamp(3.2rem,9vw,7rem)] leading-[0.92] uppercase">
            Your Phone. <br />
            <span className="text-gradient-gold">Your Identity.</span>
          </h1>
          <p className="mt-6 max-w-lg text-muted-foreground text-lg">
            Chandrapur's #1 destination for custom skins, premium covers & smart accessories.
            Crafted with care, delivered fast.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#products" className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-primary-foreground animate-pulse-gold hover:scale-[1.02] transition">
              Explore Collection <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a href="#custom" className="inline-flex items-center gap-2 rounded-full border border-gold/60 px-7 py-3.5 text-sm font-semibold text-gold hover:bg-gold/10 transition">
              Get Custom Skin
            </a>
          </div>
          <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 text-gold">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
            </div>
            <span>Loved by hundreds in Chandrapur</span>
          </div>
        </div>

        <div className="relative reveal">
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

function SectionTitle({ kicker, title, sub }: { kicker?: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="max-w-2xl reveal">
      {kicker && <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">{kicker}</div>}
      <h2 className="font-display text-4xl sm:text-6xl uppercase leading-[0.95]">{title}</h2>
      {sub && <p className="mt-4 text-muted-foreground text-lg">{sub}</p>}
    </div>
  );
}

function About() {
  return (
    <section id="about" className="relative py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
        <div className="relative reveal">
          <div className="aspect-square overflow-hidden rounded-2xl border border-gold/30 glow-gold-soft">
            <img src={aboutArt} alt="Geometric gold pattern" loading="lazy" width={1024} height={1024}
                 className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -right-6 hidden sm:block rounded-xl bg-card border border-border px-5 py-4">
            <div className="font-display text-3xl text-gold">5★</div>
            <div className="text-xs text-muted-foreground">Rated Store</div>
          </div>
        </div>
        <div>
          <SectionTitle
            kicker="Our Story"
            title={<>We Don't Just Sell Accessories. <span className="text-gradient-gold">We Upgrade Identities.</span></>}
          />
          <p className="mt-6 text-muted-foreground leading-relaxed reveal">
            R Creator Mobile Shop was born from a passion for making smartphones truly personal. From smartphones to smartwatches, every product is curated for quality and character. Our team in Chandrapur is fast, friendly, and obsessed with getting it right.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 reveal">
            {[
              ["500+", "Happy customers"],
              ["100%", "Custom designs"],
              ["100%", "Genuine Products"],
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
  return (
    <section id="products" className="py-28 bg-gradient-to-b from-transparent via-card/20 to-transparent">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle kicker="Smartphones" title={<>Every Brand. <span className="text-gradient-gold">In One Shop.</span></>} sub="The latest models from the brands you trust — available in store and ready to take home today." />
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((b) => (
            <div key={b.name} className="reveal tilt group relative rounded-2xl border border-border bg-card aspect-[4/3] flex flex-col items-center justify-center gap-3 p-6 hover:border-gold/60 overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition" style={{ background: "radial-gradient(circle at center, rgba(212,160,23,0.18), transparent 70%)" }} />
              <img
                src={b.logoUrl ?? `https://cdn.simpleicons.org/${b.slug}/D4A017`}
                alt={`${b.name} logo`}
                loading="lazy"
                className="h-10 sm:h-12 w-auto object-contain transition group-hover:scale-110"
              />
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground group-hover:text-gold transition">{b.name}</span>
            </div>
          ))}
        </div>

        <div className="mt-24 max-w-2xl reveal">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Accessories</div>
          <h3 className="font-display text-3xl sm:text-5xl uppercase leading-[0.95]">Built Around <span className="text-gradient-gold">Your Device.</span></h3>
          <p className="mt-4 text-muted-foreground">Pair your new phone with the gear that makes it yours.</p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((c) => (
            <div key={c.title} className="reveal tilt group relative rounded-2xl border border-border bg-card p-7 hover:border-gold/60">
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition" style={{ background: "radial-gradient(circle at top, rgba(212,160,23,0.12), transparent 60%)" }} />
              <c.icon className="h-9 w-9 text-gold" strokeWidth={1.5} />
              <h3 className="mt-6 text-xl font-semibold tracking-wide">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              <div className="mt-6 inline-flex items-center gap-1 text-xs text-gold opacity-0 group-hover:opacity-100 transition">
                Browse <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="reviews" className="py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle kicker="Reviews" title={<>What Chandrapur <span className="text-gradient-gold">Is Saying.</span></>} />
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <article key={i} className="reveal tilt relative rounded-2xl border border-border bg-card p-7 overflow-hidden">
              <Quote className="absolute -top-2 -right-2 h-24 w-24 text-gold/5" />
              <div className="flex gap-0.5 text-gold">
                {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-4 text-foreground/90 leading-relaxed">"{r.text}"</p>
              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-border/60">
                <div className="h-9 w-9 rounded-full bg-gold/15 ring-gold flex items-center justify-center text-gold font-semibold text-sm">
                  {r.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                </div>
                <div className="text-sm">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">Verified customer</div>
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
  return (
    <section className="py-28 bg-card/30 border-y border-border/60">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle kicker="Why Us" title={<>Built On <span className="text-gradient-gold">Trust & Craft.</span></>} />
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {whyUs.map((w) => (
            <div key={w.title} className="reveal flex gap-4 rounded-2xl border border-border bg-background/40 p-6">
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
  return (
    <section id="custom" className="relative py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-gold/40 p-10 sm:p-16 text-center reveal">
          <div aria-hidden className="absolute inset-0 -z-10" style={{ background: "linear-gradient(135deg, rgba(212,160,23,0.18) 0%, rgba(10,10,10,0) 50%, rgba(212,160,23,0.18) 100%)" }} />
          <div aria-hidden className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[60rem] blur-3xl" style={{ background: "var(--gradient-radial-gold)" }} />
          <div className="text-xs tracking-[0.3em] uppercase text-gold">Made For You</div>
          <h2 className="mt-4 font-display text-5xl sm:text-7xl uppercase leading-[0.95]">
            Want Something <br /><span className="text-gradient-gold">Truly Yours?</span>
          </h2>
          <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
            Order a custom phone skin designed exactly the way you imagine it. Bring your idea — we bring the craft.
          </p>
          <a href="#contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-semibold text-primary-foreground animate-pulse-gold hover:scale-[1.03] transition">
            Start Customizing <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-12">
        <div className="reveal">
          <SectionTitle kicker="Visit Us" title={<>Find Us In <span className="text-gradient-gold">Chandrapur.</span></>} />
          <div className="mt-8 space-y-5">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gold mt-0.5" />
              <div>
                <div className="font-semibold">R Creator Mobile Shop</div>
                <div className="text-sm text-muted-foreground">Chandrapur, Maharashtra, India</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-gold mt-0.5" />
              <div>
                <div className="font-semibold">Business Hours</div>
                <div className="text-sm text-muted-foreground">Mon – Sun · 10:00 AM – 9:30 PM</div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="https://wa.me/+919766587423" target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-black hover:opacity-90 transition">
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
            <a href="tel:+919766587423" className="inline-flex items-center gap-2 rounded-full border border-gold/60 px-6 py-3 text-sm font-semibold text-gold hover:bg-gold/10 transition">
              <Phone className="h-4 w-4" /> Call the Shop
            </a>
          </div>
        </div>
        <div className="reveal rounded-2xl overflow-hidden border border-border bg-card aspect-[4/3] lg:aspect-auto min-h-[300px]">
          <iframe
            title="Map"
            src="https://www.google.com/maps?q=Chandrapur,Maharashtra&output=embed"
            className="w-full h-full grayscale contrast-125"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            Customize Your World. Premium skins, covers & accessories from Chandrapur.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-gold mb-4">Explore</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {["Home", "Products", "Reviews", "Contact"].map((l) => (
              <li key={l}><a href={`#${l.toLowerCase() === "home" ? "top" : l.toLowerCase()}`} className="hover:text-gold transition">{l}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-gold mb-4">Follow</div>
          <div className="flex gap-3">
            {[Instagram, Facebook, MessageCircle].map((Icon, i) => (
              <a key={i} href="#" className="h-10 w-10 rounded-full border border-border hover:border-gold hover:text-gold transition flex items-center justify-center text-muted-foreground">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © 2025 R Creator Mobile Shop · Chandrapur, Maharashtra · Made with <span className="text-gold">❤</span> for our customers
      </div>
    </footer>
  );
}
