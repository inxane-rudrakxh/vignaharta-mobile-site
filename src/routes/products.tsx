import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  ArrowRight,
  Star,
  X,
  MessageCircle,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});

const CATEGORIES = [
  "All",
  "Smartphones",
  "Pre-Owned Phones",
  "Mobile Skins",
  "Laptop Skins",
  "AirPods Skins",
  "Accessories",
];

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro Max Skin - Carbon Fiber",
    price: "₹499",
    category: "Mobile Skins",
    stock: "In Stock",
    image:
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=600&auto=format&fit=crop",
    rating: 4.9,
    description:
      "Ultra-premium textured carbon fiber skin that adds grip and a stealthy aesthetic to your iPhone without adding bulk.",
  },
  {
    id: 2,
    name: "MacBook Air M2 Skin - Matte Black",
    price: "₹899",
    category: "Laptop Skins",
    stock: "Low Stock",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop",
    rating: 4.8,
    description:
      "Sleek, minimalist matte black finish. Scratch-resistant and leaves no residue upon removal.",
  },
  {
    id: 3,
    name: "AirPods Pro Gen 2 Skin - Cyberpunk",
    price: "₹299",
    category: "AirPods Skins",
    stock: "In Stock",
    image:
      "https://images.unsplash.com/photo-1606220588913-b3aecb4b27d4?q=80&w=600&auto=format&fit=crop",
    rating: 4.7,
    description:
      "Vibrant neon cyberpunk aesthetic with precision cutouts for the LED indicator and charging port.",
  },
  {
    id: 4,
    name: "Samsung Galaxy S24 Ultra Skin - Leather",
    price: "₹499",
    category: "Mobile Skins",
    stock: "Out of Stock",
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop",
    rating: 5.0,
    description:
      "Authentic feeling vegan leather texture. Gives your flagship device the luxury feel it deserves.",
  },
  {
    id: 5,
    name: "iPhone 13 Pro (Pre-Owned) - Mint",
    price: "₹45,999",
    category: "Pre-Owned Phones",
    stock: "Only 1 Left",
    image:
      "https://images.unsplash.com/photo-1512054502232-10a0a035d672?q=80&w=600&auto=format&fit=crop",
    rating: 4.9,
    description:
      "Mint condition iPhone 13 Pro. 100% battery health, original display, heavily tested by our certified technicians.",
  },
  {
    id: 6,
    name: "20W Fast Charging Adapter",
    price: "₹999",
    category: "Accessories",
    stock: "In Stock",
    image:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop",
    rating: 4.6,
    description: "Genuine 20W PD Fast Charging adapter. 6 months warranty included.",
  },
];

type Product = {
  id: string | number;
  name: string;
  price: string;
  category: string;
  stock: string;
  image: string;
  rating: number;
  description: string;
};

function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // 1. FIX SUPABASE FETCH: Simple query without ordering to avoid schema mismatch crashes
        const { data, error } = await supabase
          .from('products')
          .select('*');

        // 2. ADD DEBUG LOGGING
        console.log("Products Data:", data);
        console.log("Products Error:", error);

        if (error) {
          console.error("Supabase error:", error);
          setProducts(MOCK_PRODUCTS);
          return;
        }

        // 3. SAFE DATA MAPPING & 5. KEEP MOCK FALLBACK SYSTEM
        if (data && Array.isArray(data) && data.length > 0) {
          console.log("Mapping products from Supabase...");
          const formattedProducts: Product[] = data.map((p: any) => {
            try {
              // 4. FIX PRODUCT IMAGE HANDLING: Safe access with fallbacks
              let imageUrl = "https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=600&auto=format&fit=crop";

              if (p.images && Array.isArray(p.images) && p.images.length > 0) {
                imageUrl = p.images[0];
              } else if (typeof p.images === 'string' && p.images.length > 0) {
                try {
                  // Handle cases where images might be stored as a JSON string
                  const parsed = JSON.parse(p.images);
                  imageUrl = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : p.images;
                } catch (e) {
                  imageUrl = p.images;
                }
              } else if (p.image && typeof p.image === 'string') {
                imageUrl = p.image;
              }

              // 3. SAFE DATA MAPPING: Handle missing/null fields with proper fallbacks
              return {
                id: p.id || Math.random().toString(36).substring(7),
                name: p.title || p.name || "Unnamed Premium Product",
                price: typeof p.price === 'string' && p.price.includes('₹') 
                  ? p.price 
                  : `₹${p.price !== null && p.price !== undefined ? p.price : '0'}`,
                category: p.category || "General",
                stock: p.stock_status || p.stock || "In Stock",
                image: imageUrl || "https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=600&auto=format&fit=crop",
                rating: p.rating || 4.8,
                description: p.description || "This is a premium high-quality product. Experience the ultimate luxury and protection.",
              };
            } catch (mapError) {
              console.error("Error mapping individual product:", mapError, p);
              return null;
            }
          }).filter(Boolean) as Product[];
          
          console.log("Formatted Products:", formattedProducts);
          
          if (formattedProducts.length > 0) {
            setProducts(formattedProducts);
          } else {
            console.log("No valid products after mapping, using mock data.");
            setProducts(MOCK_PRODUCTS);
          }
        } else {
          // 5. KEEP MOCK FALLBACK SYSTEM: If no data, show mock products
          console.log("No data from Supabase or empty array, using mock data.");
          setProducts(MOCK_PRODUCTS);
        }
      } catch (err) {
        // 6. ERROR HANDLING: Ensure page never crashes
        console.error("Critical error in fetchProducts, using mock data:", err);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = (product.name || "").toLowerCase().includes((searchQuery || "").toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
    <div className="min-h-screen grain">
      {/* Header Section */}
      <section className="relative pt-24 pb-12 overflow-hidden border-b border-border/60">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 blur-3xl opacity-30"
          style={{ background: "var(--gradient-radial-gold)" }}
        />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 text-center reveal">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground mb-6">
            <ShoppingBag className="h-3.5 w-3.5 text-gold" />
            Premium Collection
          </div>
          <h1 className="font-display text-5xl sm:text-7xl uppercase leading-[0.95]">
            Discover <span className="text-gradient-gold">Perfection</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Explore our curated selection of premium gadget skins, top-tier pre-owned devices, and
            high-quality accessories.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-center mb-12 reveal">
            <div className="relative w-full lg:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-gold transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search premium products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card/40 border border-border rounded-full py-3 pl-11 pr-4 text-sm text-foreground focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/60 transition-all glow-gold-soft-on-focus"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full lg:w-auto scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                    ? "bg-gold text-primary-foreground shadow-[0_0_15px_rgba(212,160,23,0.3)]"
                    : "bg-card/40 border border-border text-muted-foreground hover:border-gold/40 hover:text-foreground"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 reveal">
              <Loader2 className="h-8 w-8 text-gold animate-spin mb-4" />
              <p className="text-muted-foreground">Loading premium catalog...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative rounded-2xl border border-border bg-card/40 overflow-hidden hover:border-gold/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,160,23,0.15)] tilt reveal"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-background">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="inline-flex items-center rounded-full bg-background/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-foreground uppercase tracking-wider border border-white/10">
                        {product.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${product.stock === "In Stock"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : product.stock === "Out of Stock"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-gold/10 text-gold border-gold/20"
                          }`}
                      >
                        {product.stock}
                      </span>
                    </div>

                    {/* View Details Button (Hover) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link
                        to="/product/$productId"
                        params={{ productId: product.id.toString() }}
                        className="bg-background/90 backdrop-blur-sm border border-gold/40 text-foreground px-6 py-2 rounded-full text-sm font-medium hover:bg-gold hover:text-primary-foreground transition-colors flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 duration-300"
                      >
                        View Details <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-gold transition-colors">
                        {product.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 mb-4">
                      <Star className="h-3.5 w-3.5 text-gold fill-gold" />
                      <span className="text-xs text-muted-foreground">{product.rating}</span>
                    </div>
                    <div className="flex items-end justify-between mt-auto">
                      <div className="font-display text-2xl tracking-wide text-foreground">
                        {product.price}
                      </div>
                      <button className="h-10 w-10 rounded-full border border-border bg-background flex items-center justify-center group-hover:border-gold group-hover:bg-gold/10 transition-colors">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-border/60 rounded-3xl bg-card/20 reveal">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="mt-6 text-sm text-gold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedProduct(null)}
          />
          <div className="relative w-full max-w-4xl bg-card border border-border/60 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300 flex flex-col md:flex-row max-h-[90vh]">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 backdrop-blur-md border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Gallery Area */}
            <div className="md:w-1/2 bg-background relative overflow-hidden flex items-center justify-center min-h-[300px] md:min-h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 to-transparent opacity-50" />
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details Area */}
            <div className="md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs uppercase tracking-wider text-gold font-medium">
                  {selectedProduct.category}
                </span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                  <span className="text-xs text-muted-foreground">
                    {selectedProduct.rating} Rating
                  </span>
                </div>
              </div>

              <h2 className="font-display text-3xl md:text-4xl uppercase leading-tight mb-2">
                {selectedProduct.name}
              </h2>

              <div className="font-display text-3xl tracking-wide text-foreground mb-6">
                {selectedProduct.price}
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-gold" />
                  <span className="text-sm">Premium Quality Guarantee</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${selectedProduct.stock === "In Stock"
                      ? "bg-green-500/10 border-green-500/20 text-green-500"
                      : selectedProduct.stock === "Out of Stock"
                        ? "bg-red-500/10 border-red-500/20 text-red-500"
                        : "bg-gold/10 border-gold/20 text-gold"
                      }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-current" />
                  </span>
                  <span className="text-sm font-medium">{selectedProduct.stock}</span>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-border flex flex-col gap-3">
                <button
                  disabled={selectedProduct.stock === "Out of Stock"}
                  className="w-full py-4 rounded-full bg-gold text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {selectedProduct.stock === "Out of Stock" ? "Out of Stock" : "Buy Now"}
                </button>
                <a
                  href={`https://wa.me/+917261934434?text=Hi, I'm interested in the ${selectedProduct.name} (${selectedProduct.price}). Is it available?`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-4 rounded-full border border-border bg-card font-medium flex items-center justify-center gap-2 hover:border-[#25D366] hover:text-[#25D366] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Inquire on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
