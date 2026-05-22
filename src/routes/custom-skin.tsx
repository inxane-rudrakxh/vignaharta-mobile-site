import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Smartphone, Laptop, Headphones, Tablet, Check, ChevronRight,
  ShieldCheck, Loader2, Type, Smile, Trash, Palette, Search, Image as ImageIcon
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { DEVICE_DATABASE, DeviceCategory } from "@/lib/devices";
import { Rnd } from "react-rnd";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { PremiumCheckoutModal, type CheckoutSkin } from "@/components/PremiumCheckoutModal";

export const Route = createFileRoute("/custom-skin")({
  component: CustomSkinPage,
});

type Step = 1 | 2 | 3 | 4 | 5;

const SKIN_TYPES = [
  { id: "matte", name: "Matte Finish", desc: "Smooth, non-reflective premium look", price: "₹299+" },
  { id: "carbon", name: "Carbon Fiber", desc: "Textured, durable industrial aesthetic", price: "₹399+" },
  { id: "transparent", name: "Transparent Clear", desc: "Show off your original device", price: "₹199+" },
  { id: "anime", name: "Anime Edition", desc: "Vibrant high-quality anime prints", price: "₹499+" },
  { id: "premium", name: "Premium Leather", desc: "Luxurious vegan leather texture", price: "₹599+" },
  { id: "custom", name: "Custom Studio", desc: "Full interactive customization", price: "₹499+" },
];

const PAYMENT_OPTIONS = [
  { id: "full", name: "Pay in Full", desc: "Pay the complete amount now securely.", badge: "Fastest Checkout" },
  { id: "advance", name: "Advance Payment (₹100)", desc: "Pay ₹100 now, rest on delivery.", badge: "Most Popular" },
];

const CATEGORY_ICONS: Record<DeviceCategory, any> = {
  Smartphone: Smartphone,
  Laptop: Laptop,
  Tablet: Tablet,
  Audio: Headphones,
};

type DesignLayer = {
  id: string;
  type: 'text' | 'emoji';
  content: string;
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  rotation: number;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  glow?: boolean;
  zIndex: number;
};

function CustomSkinPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState<DeviceCategory | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedSkinType, setSelectedSkinType] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("advance");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [uploadedDesignUrl, setUploadedDesignUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [layers, setLayers] = useState<DesignLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [modelSearch, setModelSearch] = useState("");

  // Editor Refs
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [currentStep, selectedCategory, selectedBrand]);

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedModel) return;
    if (currentStep === 2 && !selectedSkinType) return;
    if (currentStep === 3 && selectedSkinType === "custom" && !uploadedDesignUrl && layers.length === 0) {
      toast.error("Please upload an image or add text/emoji layers.");
      return;
    }
    if (currentStep < 5) setCurrentStep((prev) => (prev + 1) as Step);
  };

  const skipUploadIfNeeded = () => {
    if (currentStep === 2 && selectedSkinType && selectedSkinType !== "custom") {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!customerName || !customerPhone) {
        toast.error("Please provide your name and phone number.");
        return;
      }
      if (customerPhone.replace(/\D/g, "").length !== 10) {
        toast.error("Please enter a valid 10-digit phone number.");
        return;
      }
      // Open premium checkout modal
      setIsCheckoutOpen(true);
    } else {
      handleNextStep();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "vighnaharta_uploads";

    if (!cloudName) {
      toast.error("Cloudinary configuration missing.");
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setUploadedDesignUrl(data.secure_url);
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err: any) {
      toast.error(`Image upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const addTextLayer = () => {
    const newLayer: DesignLayer = {
      id: "text_" + Date.now(),
      type: 'text',
      content: 'Custom Text',
      x: 50,
      y: 50,
      width: 150,
      height: 50,
      rotation: 0,
      color: '#d4a017',
      fontFamily: 'Inter',
      fontSize: 24,
      glow: false,
      zIndex: layers.length + 1
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const addEmojiLayer = (emojiObj: any) => {
    const newLayer: DesignLayer = {
      id: "emoji_" + Date.now(),
      type: 'emoji',
      content: emojiObj.emoji,
      x: 80,
      y: 80,
      width: 60,
      height: 60,
      rotation: 0,
      fontSize: 48,
      zIndex: layers.length + 1
    };
    setLayers([...layers, newLayer]);
    setShowEmojiPicker(false);
    setActiveLayerId(newLayer.id);
  };

  const removeActiveLayer = () => {
    if (!activeLayerId) return;
    setLayers(layers.filter(l => l.id !== activeLayerId));
    setActiveLayerId(null);
  };

  const updateActiveLayer = (updates: Partial<DesignLayer>) => {
    if (!activeLayerId) return;
    setLayers(layers.map(l => l.id === activeLayerId ? { ...l, ...updates } : l));
  };

  // handleSubmit removed — payment is now handled by PremiumCheckoutModal


  const filteredModels = selectedBrand && selectedCategory 
    ? DEVICE_DATABASE[selectedCategory].find(b => b.id === selectedBrand)?.models.filter(m => m.name.toLowerCase().includes(modelSearch.toLowerCase())) 
    : [];

  return (
    <>
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
          <span className={currentStep >= 2 ? "text-foreground" : ""}>Texture</span>
          <span className={currentStep >= 3 ? "text-foreground" : ""}>Studio</span>
          <span className={currentStep >= 4 ? "text-foreground" : ""}>Checkout</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="bg-card/30 border border-border/50 rounded-[2rem] p-6 sm:p-10 backdrop-blur-sm relative overflow-hidden reveal">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

          {/* STEP 1: Select Device */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-display uppercase tracking-wide mb-2 text-center">
                Select Your Device
              </h2>
              
              {!selectedCategory ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                  {(Object.keys(DEVICE_DATABASE) as DeviceCategory[]).map((cat) => {
                    const Icon = CATEGORY_ICONS[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border border-border/60 bg-card/40 text-muted-foreground hover:border-gold/40 hover:text-gold transition-all duration-300 tilt hover:bg-gold/5"
                      >
                        <Icon className="w-10 h-10" strokeWidth={1.5} />
                        <span className="font-medium tracking-wide">{cat}</span>
                      </button>
                    )
                  })}
                </div>
              ) : !selectedBrand ? (
                <div className="mt-8 animate-in fade-in">
                  <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setSelectedCategory(null)} className="text-sm text-muted-foreground hover:text-gold">← Back</button>
                    <h3 className="text-lg text-foreground font-medium">Select Brand</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {DEVICE_DATABASE[selectedCategory].map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => setSelectedBrand(brand.id)}
                        className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border border-border/60 bg-card/40 text-muted-foreground hover:border-gold/40 hover:text-foreground transition-all duration-300 tilt hover:bg-gold/5"
                      >
                        <span className="font-medium tracking-wide uppercase">{brand.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-8 animate-in fade-in">
                   <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setSelectedBrand(null)} className="text-sm text-muted-foreground hover:text-gold">← Back</button>
                      <h3 className="text-lg text-foreground font-medium">Select Model</h3>
                    </div>
                    <div className="relative w-full max-w-xs hidden sm:block">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search models..."
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gold/50"
                      />
                    </div>
                  </div>
                  
                  {/* Mobile Search */}
                  <div className="relative w-full mb-6 sm:hidden">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search models..."
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredModels?.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.name)}
                        className={`text-left px-5 py-4 rounded-xl border transition-all duration-300
                          ${selectedModel === model.name
                            ? "border-gold bg-gold/10 text-gold shadow-[0_0_15px_rgba(212,160,23,0.15)]"
                            : "border-border/60 bg-card/40 text-muted-foreground hover:border-gold/40 hover:text-foreground"
                          }`}
                      >
                        <span className="font-medium text-sm block">{model.name}</span>
                      </button>
                    ))}
                    {filteredModels?.length === 0 && (
                      <div className="col-span-full py-12 text-center text-muted-foreground">
                        No models found for "{modelSearch}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Select Skin Type */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-display uppercase tracking-wide mb-2 text-center">
                Choose Skin Texture
              </h2>
              <p className="text-muted-foreground text-sm text-center mb-8">
                Select the material and finish for your {selectedModel}.
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
                        <span className={`font-semibold tracking-wide ${isSelected ? "text-gold" : "text-foreground"}`}>
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

          {/* STEP 3: Studio */}
          {currentStep === 3 && selectedSkinType === "custom" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-2xl font-display uppercase tracking-wide mb-6 text-center">
                Custom Studio
              </h2>
              
              <div className="grid lg:grid-cols-[300px_1fr] gap-8">
                {/* Tools Panel */}
                <div className="flex flex-col gap-4">
                  <div className="bg-background/50 border border-border rounded-xl p-4">
                    <h3 className="text-sm font-semibold mb-4 text-gold flex items-center gap-2">
                      <Palette className="w-4 h-4" /> Tools
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <button className="w-full flex items-center justify-center gap-2 bg-card border border-border/60 rounded-lg py-3 text-sm hover:border-gold/50 hover:text-gold transition-colors">
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                          {isUploading ? "Uploading..." : "Upload Skin Background"}
                        </button>
                      </div>
                      
                      <button onClick={addTextLayer} className="w-full flex items-center justify-center gap-2 bg-card border border-border/60 rounded-lg py-3 text-sm hover:border-gold/50 hover:text-gold transition-colors">
                        <Type className="w-4 h-4" /> Add Text
                      </button>
                      
                      <div className="relative">
                        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-full flex items-center justify-center gap-2 bg-card border border-border/60 rounded-lg py-3 text-sm hover:border-gold/50 hover:text-gold transition-colors">
                          <Smile className="w-4 h-4" /> Add Emoji
                        </button>
                        {showEmojiPicker && (
                          <div className="absolute top-full left-0 mt-2 z-50 shadow-2xl">
                            <EmojiPicker theme={Theme.DARK} onEmojiClick={addEmojiLayer} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {activeLayerId && (
                    <div className="bg-background/50 border border-border rounded-xl p-4 animate-in fade-in">
                      <h3 className="text-sm font-semibold mb-4 text-gold flex items-center justify-between">
                        <span>Layer Properties</span>
                        <button onClick={removeActiveLayer} className="text-red-400 hover:text-red-300"><Trash className="w-4 h-4" /></button>
                      </h3>
                      
                      {layers.find(l => l.id === activeLayerId)?.type === 'text' && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">Text Content</label>
                            <input 
                              type="text" 
                              value={layers.find(l => l.id === activeLayerId)?.content}
                              onChange={(e) => updateActiveLayer({ content: e.target.value })}
                              className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-gold/50"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">Color</label>
                            <input 
                              type="color" 
                              value={layers.find(l => l.id === activeLayerId)?.color}
                              onChange={(e) => updateActiveLayer({ color: e.target.value })}
                              className="w-full h-8 bg-card border border-border rounded-md cursor-pointer"
                            />
                          </div>
                           <div>
                            <label className="text-xs text-muted-foreground block mb-1">Font Size</label>
                            <input 
                              type="range" 
                              min="12" max="120"
                              value={layers.find(l => l.id === activeLayerId)?.fontSize}
                              onChange={(e) => updateActiveLayer({ fontSize: parseInt(e.target.value) })}
                              className="w-full accent-gold"
                            />
                          </div>
                           <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={layers.find(l => l.id === activeLayerId)?.glow}
                              onChange={(e) => updateActiveLayer({ glow: e.target.checked })}
                              className="accent-gold rounded bg-card border-border"
                            />
                            <span className="text-muted-foreground">Neon Glow Effect</span>
                          </label>
                        </div>
                      )}
                      
                      {layers.find(l => l.id === activeLayerId)?.type === 'emoji' && (
                        <div className="space-y-4">
                           <div>
                            <label className="text-xs text-muted-foreground block mb-1">Emoji Size</label>
                            <input 
                              type="range" 
                              min="24" max="200"
                              value={layers.find(l => l.id === activeLayerId)?.fontSize}
                              onChange={(e) => updateActiveLayer({ fontSize: parseInt(e.target.value) })}
                              className="w-full accent-gold"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Canvas Area */}
                <div className="bg-black/50 border border-border/50 rounded-2xl flex items-center justify-center overflow-hidden min-h-[500px] relative p-8">
                  {/* CSS Device Silhouette Mask */}
                  <div className="relative w-full max-w-[300px] aspect-[9/19] bg-card rounded-[3rem] border-[8px] border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden" ref={editorRef}>
                     {uploadedDesignUrl ? (
                        <img src={uploadedDesignUrl} alt="Skin Base" className="absolute inset-0 w-full h-full object-cover z-0 opacity-80" />
                     ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30 z-0 p-8 text-center bg-zinc-900/50">
                          <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                          <span className="text-sm">Upload background or add layers</span>
                        </div>
                     )}

                     {/* Interactive Layers */}
                     {layers.map((layer) => (
                       <Rnd
                         key={layer.id}
                         bounds="parent"
                         position={{ x: layer.x as number, y: layer.y as number }}
                         onDragStop={(e, d) => {
                           setLayers(layers.map(l => l.id === layer.id ? { ...l, x: d.x, y: d.y } : l));
                           setActiveLayerId(layer.id);
                         }}
                         size={{ width: layer.width, height: layer.height }}
                         onResizeStop={(e, direction, ref, delta, position) => {
                           setLayers(layers.map(l => l.id === layer.id ? {
                             ...l,
                             width: ref.style.width,
                             height: ref.style.height,
                             ...position
                           } : l));
                         }}
                         className={`absolute cursor-move ${activeLayerId === layer.id ? 'ring-2 ring-gold ring-offset-2 ring-offset-black/50 rounded-sm z-50' : 'z-40'}`}
                         onClick={() => setActiveLayerId(layer.id)}
                       >
                         {layer.type === 'text' && (
                           <div 
                             style={{ 
                               color: layer.color, 
                               fontFamily: layer.fontFamily,
                               fontSize: `${layer.fontSize}px`,
                               textShadow: layer.glow ? `0 0 10px ${layer.color}, 0 0 20px ${layer.color}` : 'none',
                               width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                             }}
                             className="whitespace-nowrap font-bold"
                           >
                             {layer.content}
                           </div>
                         )}
                         {layer.type === 'emoji' && (
                           <div style={{ fontSize: `${layer.fontSize}px`, lineHeight: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             {layer.content}
                           </div>
                         )}
                       </Rnd>
                     ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Payment Selection */}
          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-display uppercase tracking-wide mb-2 text-center">
                Finalize Request
              </h2>
              <p className="text-muted-foreground text-sm text-center mb-8">
                Confirm your details and securely complete the checkout.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-card border border-border/50">
                    <h3 className="text-sm font-semibold tracking-wide text-foreground mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                      />
                      <input
                        type="tel"
                        placeholder="WhatsApp Number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold tracking-wide text-foreground mb-1">
                    Payment Method
                  </h3>
                  {PAYMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedPayment(opt.id)}
                      className={`w-full relative text-left flex flex-col gap-1 p-5 rounded-2xl border transition-all duration-300
                        ${selectedPayment === opt.id
                          ? "border-gold bg-gold/5 shadow-[0_0_20px_rgba(212,160,23,0.1)]"
                          : "border-border/60 bg-card/40 hover:border-gold/40 hover:bg-card/60"
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`font-semibold tracking-wide ${selectedPayment === opt.id ? "text-gold" : "text-foreground"}`}>
                          {opt.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">
                          {opt.badge}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground mt-1">{opt.desc}</span>
                      {selectedPayment === opt.id && (
                         <div className="absolute inset-0 border-2 border-gold rounded-2xl pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Success */}
          {currentStep === 5 && (
            <div className="animate-in zoom-in-95 duration-500 text-center py-12">
              <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <ShieldCheck className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-display uppercase tracking-wide mb-3">
                Request <span className="text-green-400">Received</span>
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Your custom skin request for {selectedModel} has been successfully secured. 
                Reference ID: <span className="font-mono text-gold">{orderId}</span>
              </p>
              <div className="inline-flex items-center justify-center p-4 rounded-xl bg-card border border-border text-sm text-muted-foreground max-w-md mx-auto">
                <Check className="w-4 h-4 text-green-400 mr-2 shrink-0" />
                We will contact you via WhatsApp shortly to confirm the design.
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="mt-8 flex justify-end gap-4 reveal">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep((prev) => (prev - 1) as Step)}
                className="px-6 py-3 rounded-full font-medium text-muted-foreground hover:text-foreground transition"
              >
                Back
              </button>
            )}
            <button
              onClick={skipUploadIfNeeded}
              disabled={
                (currentStep === 1 && !selectedModel) ||
                (currentStep === 2 && !selectedSkinType) ||
                (currentStep === 4 && (!customerName || !customerPhone))
              }
              className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-sm font-semibold text-primary-foreground transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold/90 active:scale-[0.98]"
            >
              {currentStep === 4 ? (
                <>
                  Proceed to Checkout <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next Step <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Premium Checkout Modal */}
    {isCheckoutOpen && selectedModel && selectedSkinType && (
      <PremiumCheckoutModal
        type="skin"
        skin={{
          deviceModel: selectedModel,
          skinType: SKIN_TYPES.find(s => s.id === selectedSkinType)?.name || selectedSkinType,
          uploadedDesignUrl: uploadedDesignUrl || undefined,
          designMetadata: { category: selectedCategory, brand: selectedBrand, model: selectedModel, layers },
          priceBase: parseInt(SKIN_TYPES.find(s => s.id === selectedSkinType)?.price.replace(/\D/g, '') || '299', 10),
        }}
        onClose={() => setIsCheckoutOpen(false)}
        prefillName={customerName}
        prefillPhone={customerPhone}
      />
    )}
  </>
  );
}
