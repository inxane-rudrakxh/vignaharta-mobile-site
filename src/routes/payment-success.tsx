import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, MessageCircle, ShoppingBag, Shield, Home } from "lucide-react";

export const Route = createFileRoute("/payment-success")({
  component: PaymentSuccessPage,
});

/**
 * Fallback/reference success page.
 * Cashfree payments are handled inline by PremiumCheckoutModal
 * so this page should rarely be reached in normal flow.
 */
function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 grain">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/8 via-background to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gold/5 via-background to-background pointer-events-none" />

      <div className="w-full max-w-md relative z-10 text-center animate-in fade-in zoom-in-95 duration-700">
        {/* Icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping opacity-30" />
          <div className="relative w-24 h-24 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.25)]">
            <CheckCircle className="w-12 h-12 text-green-400" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-4xl font-display uppercase tracking-wider mb-3">
          Payment <span className="text-green-400">Successful</span>
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Your order has been confirmed. Please contact us on WhatsApp to track your order status.
        </p>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60 mb-8">
          <Shield className="w-3.5 h-3.5 text-gold/60" />
          <span>Powered by Cashfree • PCI DSS Compliant</span>
        </div>

        <div className="space-y-3">
          <a
            href="https://wa.me/917261934434?text=Hello%20Vighnaharta!%20I%20just%20completed%20a%20payment%20on%20your%20website.%20Please%20confirm%20my%20order.%20%F0%9F%99%8F"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold rounded-2xl px-6 py-4 hover:bg-green-700 transition-all shadow-[0_0_20px_rgba(22,163,74,0.25)] hover:shadow-[0_0_35px_rgba(22,163,74,0.4)]"
          >
            <MessageCircle className="w-5 h-5" />
            Confirm via WhatsApp
          </a>

          <Link
            to="/products"
            className="w-full flex items-center justify-center gap-2 bg-card/60 backdrop-blur-sm border border-border/60 text-foreground font-medium rounded-2xl px-6 py-4 hover:bg-card hover:border-gold/30 transition-all"
          >
            <ShoppingBag className="w-5 h-5 text-gold" />
            Continue Shopping
          </Link>

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-1.5 text-muted-foreground text-sm py-3 hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
