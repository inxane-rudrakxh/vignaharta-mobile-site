import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, RotateCcw, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/payment-cancel")({
  component: PaymentCancelPage,
});

function PaymentCancelPage() {
  const search = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const orderType = search.get("type") || "product";
  const productId = search.get("product") || "";

  const retryPath =
    orderType === "skin"
      ? "/custom-skin"
      : productId
        ? `/product/${productId}`
        : "/products";

  const retryLabel =
    orderType === "skin" ? "Back to Custom Studio" : "Back to Product";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 grain">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-500/5 via-background to-background pointer-events-none" />

      <div className="w-full max-w-md relative z-10 text-center animate-in fade-in zoom-in-95 duration-700">
        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
          <AlertCircle className="w-12 h-12 text-red-400" strokeWidth={1.5} />
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-display uppercase tracking-wider mb-3">
          Payment <span className="text-red-400">Cancelled</span>
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-2 max-w-sm mx-auto">
          No worries — your payment was not processed and{" "}
          <span className="text-foreground font-medium">no charges were made</span>.
        </p>
        <p className="text-muted-foreground/60 text-xs mb-10">
          Your cart and order details are still saved. Simply try again when
          you're ready.
        </p>

        {/* Divider */}
        <div className="h-px bg-border/40 mb-8" />

        {/* CTAs */}
        <div className="space-y-3">
          <Link
            to={retryPath as any}
            className="w-full flex items-center justify-center gap-2 bg-gold text-primary-foreground font-semibold rounded-2xl px-6 py-4 hover:bg-gold/90 transition-all shadow-[0_0_20px_rgba(212,160,23,0.2)] hover:shadow-[0_0_35px_rgba(212,160,23,0.4)]"
          >
            <RotateCcw className="w-5 h-5" />
            {retryLabel}
          </Link>

          <Link
            to="/products"
            className="w-full flex items-center justify-center gap-2 bg-card/60 backdrop-blur-sm border border-border/60 text-foreground font-medium rounded-2xl px-6 py-4 hover:bg-card hover:border-gold/30 transition-all"
          >
            <ShoppingBag className="w-5 h-5 text-gold" />
            Browse Collection
          </Link>

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 text-muted-foreground font-medium py-3 hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Home
          </Link>
        </div>

        {/* Info note */}
        <div className="mt-8 p-4 rounded-2xl bg-card/30 border border-border/40 text-left">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">Need help?</span> If
            you experienced an issue during payment, contact us on WhatsApp at{" "}
            <a
              href="https://wa.me/917261934434"
              target="_blank"
              rel="noreferrer"
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              +91 72619 34434
            </a>{" "}
            and we'll assist you right away.
          </p>
        </div>
      </div>
    </div>
  );
}
