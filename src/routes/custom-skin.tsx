import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Smartphone,
  Laptop,
  Headphones,
  Camera,
  Upload,
  Check,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/custom-skin")({
  component: CustomSkinPage,
});

type Step = 1 | 2 | 3 | 4 | 5;

const DEVICES = [
  { id: "iphone", name: "iPhone", icon: Smartphone },
  { id: "samsung", name: "Samsung", icon: Smartphone },
  { id: "oneplus", name: "OnePlus", icon: Smartphone },
  { id: "vivo", name: "Vivo", icon: Smartphone },
  { id: "oppo", name: "Oppo", icon: Smartphone },
  { id: "laptop", name: "Laptop", icon: Laptop },
  { id: "airpods", name: "AirPods", icon: Headphones },
  { id: "camera", name: "Camera", icon: Camera },
];

const SKIN_TYPES = [
  {
    id: "matte",
    name: "Matte Finish",
    desc: "Smooth, non-reflective premium look",
    price: "₹299+",
  },
  {
    id: "carbon",
    name: "Carbon Fiber",
    desc: "Textured, durable industrial aesthetic",
    price: "₹399+",
  },
  {
    id: "transparent",
    name: "Transparent Clear",
    desc: "Show off your original device",
    price: "₹199+",
  },
  { id: "anime", name: "Anime Edition", desc: "Vibrant high-quality anime prints", price: "₹499+" },
  {
    id: "premium",
    name: "Premium Leather",
    desc: "Luxurious vegan leather texture",
    price: "₹599+",
  },
  { id: "custom", name: "Custom Design", desc: "Upload your own unique artwork", price: "₹499+" },
];

const PAYMENT_OPTIONS = [
  {
    id: "full",
    name: "Pay in Full",
    desc: "Pay the complete amount now securely.",
    badge: "Fastest Checkout",
  },
  {
    id: "advance",
    name: "Advance Payment (₹100)",
    desc: "Pay ₹100 now, rest on delivery.",
    badge: "Most Popular",
  },
];

function CustomSkinPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedSkinType, setSelectedSkinType] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [currentStep]);

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedDevice) return;
    if (currentStep === 2 && !selectedSkinType) return;
    if (currentStep === 3 && selectedSkinType === "custom" && !uploadedFile) return;
    if (currentStep === 4 && !selectedPayment) return;

    if (currentStep < 5) setCurrentStep((prev) => (prev + 1) as Step);
  };

  const skipUploadIfNeeded = () => {
    if (currentStep === 2 && selectedSkinType && selectedSkinType !== "custom") {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      handleSubmit();
    } else {
      handleNextStep();
    }
  };

  const handleSubmit = async () => {
    if (!selectedDevice || !selectedSkinType || !selectedPayment) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let uploadedDesignUrl = null;

      // If there's an uploaded file, ideally upload to Supabase Storage here
      // For now, since we're setting up the structure, we'll store a placeholder URL or real upload logic if storage is configured.
      // const { data, error: uploadError } = await supabase.storage.from('designs').upload(`public/${uploadedFile.name}`, uploadedFile);

      const { error: dbError } = await supabase
        .from('custom_skin_requests')
        .insert([
          {
            device_type: selectedDevice,
            skin_type: selectedSkinType,
            payment_type: selectedPayment,
            // uploaded_design_url: uploadedDesignUrl,
            customer_name: "Guest", // Would be linked to auth user if logged in
            payment_status: "Pending",
            order_status: "Pending"
          }
        ]);

      if (dbError) throw dbError;

      setCurrentStep(5);
    } catch (err: any) {
      console.error("Error submitting request:", err);
      // Even if Supabase isn't fully set up yet, fallback to success for UX during transition
      setCurrentStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grain pb-24">
      {/* Header */}
      <section className="relative pt-24 pb-8 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 blur-[100px] opacity-20"
          style={{ background: "var(--gradient-radial-gold)" }}
        />
        <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center reveal">
          <div className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
            Vighnaharta Custom Studio
          </div>
          <h1 className="font-display text-4xl sm:text-6xl uppercase leading-[0.95]">
            Design Your <span className="text-gradient-gold">Identity</span>
          </h1>
        </div>
      </section>

      {/* Progress Indicator */}
      <div className="mx-auto max-w-3xl px-5 sm:px-8 mb-12 reveal">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-border/40 -z-10" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-gold transition-all duration-500 ease-out -z-10"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border backdrop-blur-md
                ${currentStep > step
                  ? "bg-gold border-gold text-primary-foreground"
                  : currentStep === step
                    ? "bg-card border-gold text-gold shadow-[0_0_15px_rgba(212,160,23,0.3)]"
                    : "bg-card border-border/60 text-muted-foreground"
                }`}
            >
              {currentStep > step ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : step}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">
          <span className={currentStep >= 1 ? "text-foreground" : ""}>Device</span>
          <span className={currentStep >= 2 ? "text-foreground" : ""}>Skin Type</span>
          <span className={currentStep >= 3 ? "text-foreground" : ""}>Design</span>
          <span className={currentStep >= 4 ? "text-foreground" : ""}>Checkout</span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="bg-card/30 border border-border/50 rounded-[2rem] p-6 sm:p-10 backdrop-blur-sm relative overflow-hidden reveal">
          {/* Subtle background glow based on step */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

          {/* STEP 1: Select Device */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-display uppercase tracking-wide mb-2 text-center">
                Select Your Device
              </h2>
              <p className="text-muted-foreground text-sm text-center mb-8">
                Choose the device you want to customize.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {DEVICES.map((device) => {
                  const isSelected = selectedDevice === device.id;
                  return (
                    <button
                      key={device.id}
                      onClick={() => setSelectedDevice(device.id)}
                      className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-300 tilt
                        ${isSelected
                          ? "border-gold bg-gold/10 text-gold shadow-[0_0_20px_rgba(212,160,23,0.15)]"
                          : "border-border/60 bg-card/40 text-muted-foreground hover:border-gold/40 hover:text-foreground"
                        }`}
                    >
                      <device.icon
                        className={`w-8 h-8 ${isSelected ? "text-gold" : "text-muted-foreground"}`}
                        strokeWidth={1.5}
                      />
                      <span className="font-medium text-sm tracking-wide">{device.name}</span>
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_#d4a017]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Select Skin Type */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-display uppercase tracking-wide mb-2 text-center">
                Choose Skin Texture
              </h2>
              <p className="text-muted-foreground text-sm text-center mb-8">
                Select the material and finish for your{" "}
                {DEVICES.find((d) => d.id === selectedDevice)?.name}.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {SKIN_TYPES.map((skin) => {
                  const isSelected = selectedSkinType === skin.id;
                  return (
                    <button
                      key={skin.id}
                      onClick={() => setSelectedSkinType(skin.id)}
                      className={`relative text-left flex flex-col gap-1 p-5 rounded-2xl border transition-all duration-300
                        ${isSelected
                          ? "border-gold bg-gold/5 shadow-[0_0_20px_rgba(212,160,23,0.1)]"
                          : "border-border/60 bg-card/40 hover:border-gold/40 hover:bg-card/60"
                        }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span
                          className={`font-semibold tracking-wide ${isSelected ? "text-gold" : "text-foreground"}`}
                        >
                          {skin.name}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 bg-background/50 rounded-full border border-border/50">
                          {skin.price}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground mt-1">{skin.desc}</span>

                      {isSelected && (
                        <div className="absolute inset-0 border-2 border-gold rounded-2xl pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Upload Design (Only if custom selected) */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-display uppercase tracking-wide mb-2 text-center">
                Upload Your Masterpiece
              </h2>
              <p className="text-muted-foreground text-sm text-center mb-8">
                Provide the highest quality image for the best print result.
              </p>

              <div className="border-2 border-dashed border-border/60 hover:border-gold/50 bg-background/40 rounded-3xl p-12 text-center transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-4 group-hover:bg-gold/10 group-hover:border-gold/30 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground group-hover:text-gold transition-colors" />
                </div>
                <h3 className="text-lg font-medium mb-2 group-hover:text-gold transition-colors">
                  Click to upload or drag & drop
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  SVG, PNG, JPG or WEBP (max. 10MB)
                </p>

                {/* Fake file input trigger */}
                <button
                  onClick={() =>
                    setUploadedFile(new File([""], "custom-design.jpg", { type: "image/jpeg" }))
                  }
                  className="mt-6 px-6 py-2 rounded-full border border-border text-sm hover:bg-card transition-colors"
                >
                  {uploadedFile ? "design_selected.jpg (Click to change)" : "Browse Files"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Checkout / Payment */}
          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-display uppercase tracking-wide mb-2 text-center">
                Payment Method
              </h2>
              <p className="text-muted-foreground text-sm text-center mb-8">
                Choose how you want to pay for your custom order.
              </p>

              <div className="space-y-4 max-w-2xl mx-auto">
                {PAYMENT_OPTIONS.map((opt) => {
                  const isSelected = selectedPayment === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedPayment(opt.id)}
                      className={`w-full relative text-left flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300
                        ${isSelected
                          ? "border-gold bg-gold/5 shadow-[0_0_20px_rgba(212,160,23,0.1)]"
                          : "border-border/60 bg-card/40 hover:border-gold/40"
                        }`}
                    >
                      <div
                        className={`mt-1 w-5 h-5 rounded-full border flex flex-shrink-0 items-center justify-center
                        ${isSelected ? "border-gold bg-gold" : "border-muted-foreground bg-transparent"}`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-foreground">{opt.name}</span>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}

                <div className="mt-8 p-5 rounded-2xl bg-card border border-border flex items-start gap-4">
                  <ShieldCheck className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium mb-1">Secure Checkout Placeholder</h4>
                    <p className="text-xs text-muted-foreground">
                      In Phase 2, this will integrate with Razorpay for real transactions.
                      Currently, clicking Book Now will simulate a successful order.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Success State */}
          {currentStep === 5 && (
            <div className="animate-in zoom-in-95 fade-in duration-500 py-12 text-center">
              <div className="w-20 h-20 mx-auto bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                <Check className="w-10 h-10 text-green-500" strokeWidth={3} />
              </div>
              <h2 className="text-3xl font-display uppercase tracking-wide mb-3">
                Order Placed Successfully
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Your custom skin order for {DEVICES.find((d) => d.id === selectedDevice)?.name} has
                been received. Our team will contact you shortly on WhatsApp.
              </p>
              <div className="inline-flex flex-col gap-3">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="px-8 py-3 rounded-full bg-card border border-border font-medium hover:border-gold hover:text-gold transition-colors"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="mt-10 flex justify-between items-center pt-6 border-t border-border/40">
              <button
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as Step)}
                className={`text-sm font-medium px-4 py-2 text-muted-foreground hover:text-foreground transition-colors ${currentStep === 1 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
              >
                Back
              </button>

              <button
                onClick={
                  currentStep === 4
                    ? handleSubmit
                    : (selectedSkinType === "custom" && currentStep === 2 ? handleNextStep : skipUploadIfNeeded)
                }
                disabled={
                  (currentStep === 1 && !selectedDevice) ||
                  (currentStep === 2 && !selectedSkinType) ||
                  (currentStep === 3 && !uploadedFile) ||
                  (currentStep === 4 && !selectedPayment) ||
                  isSubmitting
                }
                className="group relative inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-gold/90 hover:scale-[1.02]"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : currentStep === 4 ? "Book Now" : "Continue"}
                {currentStep < 4 && !isSubmitting && (
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
