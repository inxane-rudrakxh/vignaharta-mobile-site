import { useState, useEffect, useCallback } from "react";
import {
  X, ShieldCheck, Truck, Clock, CreditCard, Smartphone,
  CheckCircle, AlertCircle, Loader2, ChevronRight, ChevronLeft,
  Lock, Zap, MessageCircle, Copy, Star, ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createPaymentIntent, initiateCheckout } from "@/lib/payments";
import { toast } from "sonner";

// ============================================================
// TYPES
// ============================================================

export type CheckoutProduct = {
  id: string | number;
  title: string;
  price: number;
  category: string;
  image: string;
};

export type CheckoutSkin = {
  deviceModel: string;
  skinType: string;
  uploadedDesignUrl?: string | null;
  designMetadata?: any;
  priceBase: number;
};

type CheckoutStep = "summary" | "details" | "payment" | "processing" | "success" | "failed";

type Props = {
  type: "product" | "skin";
  product?: CheckoutProduct;
  skin?: CheckoutSkin;
  onClose: () => void;
  prefillName?: string;
  prefillPhone?: string;
};

// ============================================================
// HELPERS
// ============================================================

const WHATSAPP_NUMBER = "917261934434";

function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function getEstimatedPickup() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

// ============================================================
// STEP INDICATOR
// ============================================================

function StepDots({ step }: { step: CheckoutStep }) {
  const steps: CheckoutStep[] = ["summary", "details", "payment"];
  const idx = steps.indexOf(step);
  if (idx === -1) return null;
  return (
    <div className="flex items-center gap-2 justify-center mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i < idx ? "bg-gold w-4" : i === idx ? "bg-gold shadow-[0_0_8px_rgba(212,160,23,0.6)]" : "bg-border/60"
          }`} />
          {i < steps.length - 1 && (
            <div className={`w-6 h-px transition-all duration-500 ${i < idx ? "bg-gold" : "bg-border/40"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// ORDER SUMMARY CARD (reusable)
// ============================================================

function OrderSummaryCard({
  type, product, skin, paymentMode, amountToPay,
}: {
  type: "product" | "skin";
  product?: CheckoutProduct;
  skin?: CheckoutSkin;
  paymentMode: "advance" | "full";
  amountToPay: number;
}) {
  const fullPrice = type === "product" ? product!.price : skin!.priceBase;
  const isAdvance = paymentMode === "advance";

  return (
    <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
      {/* Product visual */}
      {type === "product" && product?.image && (
        <div className="relative h-32 overflow-hidden bg-black/20">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4">
            <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">{product.category}</span>
          </div>
        </div>
      )}
      {type === "skin" && skin?.uploadedDesignUrl && (
        <div className="relative h-32 overflow-hidden bg-black/20">
          <img
            src={skin.uploadedDesignUrl}
            alt="Custom Design"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
        </div>
      )}

      {/* Details */}
      <div className="p-5">
        <h3 className="font-display text-lg uppercase tracking-wide text-foreground mb-1">
          {type === "product" ? product?.title : `${skin?.skinType} Skin`}
        </h3>
        {type === "skin" && (
          <p className="text-sm text-muted-foreground mb-1">
            <Smartphone className="w-3 h-3 inline mr-1 opacity-60" />
            {skin?.deviceModel}
          </p>
        )}

        <div className="h-px bg-border/40 my-4" />

        {/* Pricing breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Item Price</span>
            <span className="text-foreground">{formatINR(fullPrice)}</span>
          </div>
          {isAdvance && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Balance on Pickup</span>
              <span className="text-foreground">{formatINR(fullPrice - 100)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxes & Fees</span>
            <span className="text-green-400">Included</span>
          </div>
          <div className="h-px bg-border/30 my-1" />
          <div className="flex justify-between font-semibold">
            <span className="text-foreground">Pay Now</span>
            <span className="text-gold text-lg font-display">{formatINR(amountToPay)}</span>
          </div>
        </div>

        {/* Pickup info */}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-background/40 rounded-xl p-3 border border-border/30">
          <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
          <span>Est. ready by <strong className="text-foreground">{getEstimatedPickup()}</strong></span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SECURITY BADGES
// ============================================================

function SecurityBadges() {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {[
        { icon: Lock, label: "256-bit SSL" },
        { icon: ShieldCheck, label: "Secure Checkout" },
        { icon: Zap, label: "Instant Confirm" },
      ].map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 bg-background/30 border border-border/30 rounded-full px-2.5 py-1"
        >
          <Icon className="w-3 h-3 text-gold/60" />
          {label}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// PREMIUM CHECKOUT MODAL
// ============================================================

export function PremiumCheckoutModal({ type, product, skin, onClose, prefillName = "", prefillPhone = "" }: Props) {
  const [step, setStep] = useState<CheckoutStep>("summary");
  const [paymentMode, setPaymentMode] = useState<"advance" | "full">("advance");
  const [name, setName] = useState(prefillName);
  const [phone, setPhone] = useState(prefillPhone);
  const [email, setEmail] = useState("");
  const [processingMsg, setProcessingMsg] = useState("Initializing secure checkout…");
  const [orderId, setOrderId] = useState("");
  const [txnId, setTxnId] = useState("");
  const [amountPaid, setAmountPaid] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedTxn, setCopiedTxn] = useState(false);

  const fullPrice = type === "product" ? product!.price : skin!.priceBase;
  const amountToPay = paymentMode === "advance" ? 100 : fullPrice;

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Trap escape key
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step !== "processing") onClose();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [step, onClose]);

  const canClose = step !== "processing";

  const processPayment = useCallback(async () => {
    setStep("processing");

    const messages = [
      "Initializing secure checkout…",
      "Verifying payment details…",
      "Opening payment gateway…",
    ];
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      setProcessingMsg(messages[msgIdx]);
    }, 1400);

    const isAdvance = paymentMode === "advance";
    const amount = isAdvance ? 100 : fullPrice;
    setAmountPaid(amount);

    try {
      const intent = await createPaymentIntent(amount, "INR", isAdvance, { name, phone, email });
      clearInterval(msgInterval);
      setProcessingMsg("Opening payment gateway…");

      const verification = await initiateCheckout(intent, { name, phone, email });

      setProcessingMsg("Confirming your order…");

      // Save order to Supabase
      if (type === "product" && product) {
        const { data, error } = await supabase
          .from("orders")
          .insert([{
            product_name: product.title,
            customer_name: name,
            customer_phone: phone,
            customer_email: email || null,
            payment_type: isAdvance ? "Advance Payment" : "Full Payment",
            amount_paid: amount,
            payment_status: isAdvance ? "Advance Paid" : "Paid",
            order_status: "Reserved",
            pickup_status: "Pending",
            transaction_id: verification.transaction_id,
            payment_gateway: "Cashfree",
          }])
          .select()
          .single();

        if (error) throw new Error("Payment received but order save failed. Please contact support. TxnID: " + verification.transaction_id);
        setOrderId(data.id);
      } else if (type === "skin" && skin) {
        const { data, error } = await supabase
          .from("custom_skin_requests")
          .insert([{
            device_type: skin.deviceModel,
            skin_type: skin.skinType,
            payment_type: isAdvance ? "advance" : "full",
            uploaded_design_url: skin.uploadedDesignUrl || null,
            customer_name: name,
            customer_phone: phone,
            payment_status: isAdvance ? "Advance Paid" : "Paid",
            order_status: "Pending",
            transaction_id: verification.transaction_id,
            payment_gateway: "Cashfree",
            design_metadata: skin.designMetadata || null,
            amount_paid: amount,
          }])
          .select()
          .single();

        if (error) throw new Error("Payment received but request save failed. TxnID: " + verification.transaction_id);
        setOrderId(data.id);
      }

      setTxnId(verification.transaction_id);
      setStep("success");
      toast.success("Order confirmed! 🎉");
    } catch (err: any) {
      clearInterval(msgInterval);
      console.error("[Checkout] Error:", err);
      setErrorMsg(err.message || "Payment failed or was cancelled.");
      setStep("failed");
    }
  }, [paymentMode, fullPrice, name, phone, email, type, product, skin]);

  const copyTxn = async () => {
    try {
      await navigator.clipboard.writeText(txnId);
      setCopiedTxn(true);
      toast.success("Copied!");
      setTimeout(() => setCopiedTxn(false), 2000);
    } catch { /* silent */ }
  };

  const waMessage = () => {
    const lines = [
      "Hello Vighnaharta Mobile Shop! 🌟",
      "",
      type === "product"
        ? `I just reserved: *${product?.title}*`
        : `I just placed a custom skin order for *${skin?.deviceModel}*`,
      "",
      `*Order ID:* ${orderId}`,
      `*Transaction ID:* ${txnId}`,
      `*Amount Paid:* ${formatINR(amountPaid)}`,
      `*Payment Type:* ${paymentMode === "advance" ? "Advance (₹100)" : "Full Payment"}`,
      `*Name:* ${name}`,
      "",
      "Please confirm my order! 🙏",
    ];
    return encodeURIComponent(lines.join("\n"));
  };

  // ─── RENDER ──────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/85 backdrop-blur-md animate-in fade-in duration-300"
        onClick={canClose ? onClose : undefined}
      />

      {/* Modal shell */}
      <div className="relative w-full sm:max-w-md bg-card/95 border border-border/60 rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] sm:shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 fade-in duration-400 overflow-hidden max-h-[96vh] flex flex-col">

        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-20 bg-gold/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            {(step === "details" || step === "payment") && (
              <button
                onClick={() => setStep(step === "payment" ? "details" : "summary")}
                className="p-1.5 rounded-full bg-background/50 border border-border/40 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gold font-semibold">
                Vighnaharta
              </div>
              <h2 className="text-sm font-semibold text-foreground leading-tight">
                {step === "summary" && "Order Summary"}
                {step === "details" && "Your Details"}
                {step === "payment" && "Confirm Payment"}
                {step === "processing" && "Processing…"}
                {step === "success" && "Order Confirmed"}
                {step === "failed" && "Payment Failed"}
              </h2>
            </div>
          </div>
          {canClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-background/50 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 overscroll-contain">

          {/* ── STEP: SUMMARY ── */}
          {step === "summary" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <StepDots step="summary" />
              <OrderSummaryCard
                type={type}
                product={product}
                skin={skin}
                paymentMode={paymentMode}
                amountToPay={amountToPay}
              />

              {/* Payment mode selector */}
              <div className="mt-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-3">
                  Payment Option
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "advance" as const, label: "Advance", sub: "Pay ₹100 now", badge: "Popular" },
                    { id: "full" as const, label: "Full Payment", sub: formatINR(fullPrice), badge: "Best Value" },
                  ].map(({ id, label, sub, badge }) => (
                    <button
                      key={id}
                      onClick={() => setPaymentMode(id)}
                      className={`relative p-4 rounded-2xl border text-left transition-all duration-200 ${
                        paymentMode === id
                          ? "border-gold bg-gold/8 shadow-[0_0_20px_rgba(212,160,23,0.1)]"
                          : "border-border/50 bg-background/30 hover:border-gold/30 hover:bg-gold/5"
                      }`}
                    >
                      <span className="absolute top-2 right-2 text-[9px] uppercase tracking-widest font-bold text-gold bg-gold/10 px-1.5 py-0.5 rounded-full border border-gold/20">
                        {badge}
                      </span>
                      <div className={`font-semibold text-sm mb-1 ${paymentMode === id ? "text-gold" : "text-foreground"}`}>
                        {label}
                      </div>
                      <div className="text-xs text-muted-foreground">{sub}</div>
                      {paymentMode === id && (
                        <div className="absolute inset-0 border-2 border-gold rounded-2xl pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature list */}
              <div className="mt-5 space-y-2">
                {[
                  { icon: Truck, text: "Priority pickup coordination" },
                  { icon: ShieldCheck, text: "Quality guaranteed or refunded" },
                  { icon: Star, text: "Premium Vighnaharta craftsmanship" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Icon className="w-3.5 h-3.5 text-gold/70 shrink-0" />
                    {text}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep("details")}
                className="w-full mt-6 bg-gold text-primary-foreground font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-gold/90 active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(212,160,23,0.3)] hover:shadow-[0_0_35px_rgba(212,160,23,0.45)]"
              >
                Continue <ChevronRight className="w-5 h-5" />
              </button>
              <SecurityBadges />
            </div>
          )}

          {/* ── STEP: DETAILS ── */}
          {step === "details" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <StepDots step="details" />
              <p className="text-sm text-muted-foreground mb-5">
                We need a few details to confirm your reservation.
              </p>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-background/60 border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/10 transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
                    WhatsApp Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit number"
                      maxLength={10}
                      className="w-full bg-background/60 border border-border/60 rounded-xl pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/10 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
                    Email <span className="text-muted-foreground/50 normal-case tracking-normal font-normal">(optional — for digital receipt)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-background/60 border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/10 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (!name.trim() || !phone.trim()) {
                    toast.error("Please enter your name and phone number.");
                    return;
                  }
                  if (phone.replace(/\D/g, "").length !== 10) {
                    toast.error("Please enter a valid 10-digit phone number.");
                    return;
                  }
                  setStep("payment");
                }}
                className="w-full mt-6 bg-gold text-primary-foreground font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-gold/90 active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(212,160,23,0.3)] hover:shadow-[0_0_35px_rgba(212,160,23,0.45)]"
              >
                Review Order <ChevronRight className="w-5 h-5" />
              </button>
              <SecurityBadges />
            </div>
          )}

          {/* ── STEP: PAYMENT CONFIRM ── */}
          {step === "payment" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <StepDots step="payment" />

              {/* Mini order card */}
              <div className="rounded-2xl border border-border/50 bg-card/30 p-5 mb-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ordering</p>
                    <p className="font-semibold text-sm text-foreground">
                      {type === "product" ? product?.title : `${skin?.skinType} Skin — ${skin?.deviceModel}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Amount</p>
                    <p className="font-display text-xl text-gold">{formatINR(amountToPay)}</p>
                  </div>
                </div>

                <div className="h-px bg-border/40 mb-4" />

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-0.5">Customer</p>
                    <p className="text-foreground font-medium">{name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Phone</p>
                    <p className="text-foreground font-medium">+91 {phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Payment</p>
                    <p className="text-foreground font-medium">
                      {paymentMode === "advance" ? "Advance (₹100)" : "Full Payment"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Est. Ready</p>
                    <p className="text-foreground font-medium">{getEstimatedPickup()}</p>
                  </div>
                </div>
              </div>

              {/* Payment method indicator */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20 mb-5">
                <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-green-300">Secured by Cashfree</p>
                  <p className="text-[11px] text-muted-foreground">PCI DSS compliant • RBI approved</p>
                </div>
                <div className="ml-auto text-[10px] font-bold uppercase tracking-widest text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                  Safe
                </div>
              </div>

              <button
                onClick={processPayment}
                className="w-full bg-gradient-to-r from-gold to-amber-500 text-primary-foreground font-bold rounded-2xl py-4 flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(212,160,23,0.35)] hover:shadow-[0_0_45px_rgba(212,160,23,0.5)] text-sm tracking-wide"
              >
                <Lock className="w-4 h-4" />
                Pay {formatINR(amountToPay)} Securely
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[11px] text-muted-foreground/60 mt-3">
                🔒 Payment processed securely via Cashfree
              </p>
            </div>
          )}

          {/* ── STEP: PROCESSING ── */}
          {step === "processing" && (
            <div className="animate-in fade-in duration-500 py-10 text-center">
              {/* Orbital loader */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-gold/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-gold/30 animate-spin" style={{ animationDuration: "3s" }} />
                <div className="absolute inset-4 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shadow-[0_0_30px_rgba(212,160,23,0.2)]">
                  <Lock className="w-6 h-6 text-gold" />
                </div>
              </div>

              <h3 className="text-xl font-display uppercase tracking-wider text-foreground mb-2">
                Secure Checkout
              </h3>
              <p className="text-sm text-muted-foreground animate-pulse">{processingMsg}</p>

              {/* Shimmer bar */}
              <div className="mt-8 mx-auto max-w-[200px] h-1.5 rounded-full bg-border/30 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold/60 via-gold to-gold/60 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]"
                  style={{
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s ease-in-out infinite",
                  }}
                />
              </div>

              <p className="text-xs text-muted-foreground/50 mt-6">
                Do not close this window
              </p>
            </div>
          )}

          {/* ── STEP: SUCCESS ── */}
          {step === "success" && (
            <div className="animate-in zoom-in-95 fade-in duration-500 py-4">
              {/* Success icon */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping opacity-40" />
                <div className="absolute inset-0 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.25)]">
                  <CheckCircle className="w-12 h-12 text-green-400" strokeWidth={1.5} />
                </div>
              </div>

              <h2 className="text-2xl font-display uppercase tracking-wider text-center mb-1">
                Order <span className="text-green-400">Confirmed</span>
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Your payment was successful and order is secured.
              </p>

              {/* Receipt card */}
              <div className="rounded-2xl border border-border/50 bg-card/40 overflow-hidden mb-5">
                <div className="bg-gradient-to-r from-green-500/8 via-transparent to-gold/5 px-5 py-3 border-b border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-green-400">
                      Payment Receipt
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date().toLocaleDateString("en-IN")}
                  </span>
                </div>

                <div className="p-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-display text-lg text-green-400">{formatINR(amountPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-mono text-xs text-foreground">{orderId?.slice(0, 16)}…</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Transaction</span>
                    <button
                      onClick={copyTxn}
                      className="flex items-center gap-1.5 font-mono text-xs text-indigo-300 bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                    >
                      {txnId.slice(0, 16)}…
                      {copiedTxn ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Gateway</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                      Cashfree ✓
                    </span>
                  </div>
                </div>
              </div>

              {/* Pickup info */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/40 rounded-xl p-3 border border-border/30 mb-5">
                <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>Estimated ready by <strong className="text-foreground">{getEstimatedPickup()}</strong></span>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold rounded-2xl py-4 hover:bg-green-700 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(22,163,74,0.25)] hover:shadow-[0_0_35px_rgba(22,163,74,0.4)]"
                >
                  <MessageCircle className="w-5 h-5" />
                  Confirm via WhatsApp
                </a>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all text-sm"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: FAILED ── */}
          {step === "failed" && (
            <div className="animate-in zoom-in-95 fade-in duration-500 py-8 text-center">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                <AlertCircle className="w-10 h-10 text-red-400" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-display uppercase tracking-wider mb-2">
                Payment <span className="text-red-400">Cancelled</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-2 max-w-xs mx-auto">
                {errorMsg || "The payment was cancelled or could not be processed."}
              </p>
              <p className="text-xs text-muted-foreground/60 mb-8">
                No charges were made. You can try again anytime.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setErrorMsg("");
                    setStep("payment");
                  }}
                  className="w-full bg-gold text-primary-foreground font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-gold/90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(212,160,23,0.25)]"
                >
                  <Zap className="w-4 h-4" /> Try Again
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl border border-border/50 text-muted-foreground hover:text-foreground transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
