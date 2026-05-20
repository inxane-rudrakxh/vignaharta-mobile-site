import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ShoppingBag, ShieldCheck, Truck, Star, Loader2 } from "lucide-react";

export const Route = createFileRoute("/product/$productId")({
  component: ProductDetailsPage,
});

type ProductDetail = {
  id: string | number;
  title: string;
  price: number;
  category: string;
  stock_status: string;
  description: string;
  images: string[];
};

function ProductDetailsPage() {
  const { productId } = Route.useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (error) throw error;
        
        if (data) {
          setProduct({
            id: data.id,
            title: data.title || "Unnamed Product",
            price: data.price || 0,
            category: data.category || "General",
            stock_status: data.stock_status || "In Stock",
            description: data.description || "No description available for this premium product.",
            images: data.images && data.images.length > 0 ? data.images : ["https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=600&auto=format&fit=crop"],
          });
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        // Mock fallback if DB fails
        setProduct({
          id: productId,
          title: "Vighnaharta Premium Skin",
          price: 499,
          category: "Accessories",
          stock_status: "In Stock",
          description: "This is a premium Vighnaharta product. Enhance your device with our cinematic precision-cut materials.",
          images: ["https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=600&auto=format&fit=crop"],
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-display uppercase tracking-wider mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">The luxury item you are looking for does not exist or is no longer available.</p>
        <Link to="/products" className="bg-gold text-primary-foreground px-6 py-3 rounded-full font-medium shadow-[0_0_20px_rgba(212,160,23,0.3)] hover:shadow-[0_0_30px_rgba(212,160,23,0.5)] transition-all">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-24 grain">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-background to-background pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium uppercase tracking-wider">Back to Collection</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Image Gallery */}
          <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden border border-border/40 relative group bg-card/20 backdrop-blur-sm shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
              <img 
                src={product.images[0]} 
                alt={product.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${
                  product.stock_status === "In Stock" ? "bg-green-500/20 text-green-300 border-green-500/30" :
                  product.stock_status === "Out of Stock" ? "bg-red-500/20 text-red-300 border-red-500/30" :
                  "bg-gold/20 text-gold border-gold/30"
                }`}>
                  {product.stock_status}
                </span>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-card/60 backdrop-blur-md border border-border/50 text-foreground">
                  {product.category}
                </span>
              </div>
            </div>
            {/* Thumbnails placeholder for future multi-image support */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-border/40 cursor-pointer hover:border-gold/50 transition-colors">
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
            <h1 className="text-4xl md:text-5xl font-display font-semibold leading-tight tracking-tight mb-4">
              {product.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.9/5 Premium Rating)</span>
            </div>

            <div className="text-3xl font-light text-foreground mb-8">
              ₹{product.price.toLocaleString('en-IN')}
            </div>

            <div className="prose prose-invert max-w-none mb-10 text-muted-foreground leading-relaxed">
              <p>{product.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                disabled={product.stock_status === "Out of Stock"}
                className={`flex-1 px-8 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  product.stock_status === "Out of Stock" 
                    ? "bg-card/50 text-muted-foreground cursor-not-allowed border border-border/50" 
                    : "bg-gold text-primary-foreground hover:bg-gold/90 shadow-[0_0_20px_rgba(212,160,23,0.3)] hover:shadow-[0_0_30px_rgba(212,160,23,0.5)]"
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                {product.stock_status === "Out of Stock" ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-6 pt-8 border-t border-border/40">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-card/20 backdrop-blur-sm border border-border/30">
                <ShieldCheck className="w-6 h-6 text-gold shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-foreground">Premium Quality</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Precision cut from the finest aerospace-grade materials.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-card/20 backdrop-blur-sm border border-border/30">
                <Truck className="w-6 h-6 text-gold shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-foreground">Priority Delivery</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Fast, secure shipping across all major pin codes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
