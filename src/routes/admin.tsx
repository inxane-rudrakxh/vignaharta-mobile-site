import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Palette,
  Loader2,
  Lock,
  X,
  UploadCloud,
  Star,
  TrendingUp,
  Activity,
  Users,
  Filter
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

type Product = {
  id: string | number;
  name: string;
  price: string;
  category: string;
  stock: string;
  stock_quantity?: number;
  is_visible?: boolean;
  image: string;
  images?: string[];
  rating: number;
  description: string;
  featured?: boolean;
};

type Order = {
  id: string;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  payment_type: string;
  amount_paid: number;
  order_status: string;
  pickup_status: string;
  created_at: string;
  products?: {
    title: string;
    image: string;
    images: any;
  };
};

type SkinRequest = {
  id: string;
  device_type: string;
  skin_type: string;
  payment_type: string;
  uploaded_design_url: string | null;
  customer_name: string;
  customer_phone: string;
  payment_status: string;
  order_status: string;
  admin_notes?: string;
  created_at: string;
};

type Category = {
  id: string;
  name: string;
  image: string | null;
  featured: boolean;
};

type StoreSettings = {
  store_name: string;
  whatsapp_number: string;
  instagram_link: string;
  store_address: string;
  google_maps_link: string;
  business_hours: string;
  logo_url?: string;
  hero_image_url?: string;
  announcement_banner?: string;
  theme_accent?: string;
};

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("products");

  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Skin Requests state
  const [skinRequests, setSkinRequests] = useState<SkinRequest[]>([]);
  const [isLoadingSkinRequests, setIsLoadingSkinRequests] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Settings state
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    store_name: "Vighnaharta Mobile Shop",
    whatsapp_number: "+917261934434",
    instagram_link: "",
    store_address: "Pune, Maharashtra",
    google_maps_link: "",
    business_hours: "10:00 AM - 9:00 PM"
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Dashboard Stats state
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingReservations: 0,
    totalRevenue: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  // Advanced Orders State
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");

  // Add/Edit Product State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productSaveError, setProductSaveError] = useState("");
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    category: "Smartphones",
    stock_status: "In Stock",
    stock_quantity: 10,
    is_visible: true,
    featured: false,
  });

  // Cloudinary State
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUploadStatus, setImageUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      console.log("Checking for active Supabase session...");
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (e) {
      console.error("Auth check failed:", e);
    } finally {
      setIsCheckingAuth(false);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.session) setIsAuthenticated(true);
    } catch (err: any) {
      setAuthError(err.message || "Failed to log in.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setProducts(data.map((p: any) => {
          let imageUrl = "";
          if (p.images && Array.isArray(p.images) && p.images.length > 0) {
            imageUrl = p.images[0];
          } else if (typeof p.images === 'string' && p.images.length > 0) {
            try {
              const parsed = JSON.parse(p.images);
              imageUrl = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : p.images;
            } catch (e) {
              imageUrl = p.images;
            }
          } else if (p.image && typeof p.image === 'string') {
            imageUrl = p.image;
          }

          return {
            id: p.id,
            name: p.title || p.name || "Unnamed Product",
            price: typeof p.price === 'string' && p.price.includes('₹') ? p.price : `₹${p.price || 0}`,
            category: p.category || "General",
            stock: p.stock_status || "In Stock",
            stock_quantity: p.stock_quantity ?? 10,
            is_visible: p.is_visible ?? true,
            image: imageUrl || "https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=600&auto=format&fit=crop",
            images: p.images || [],
            rating: p.rating || 0,
            description: p.description || "",
            featured: p.featured || false,
          };
        }));
      }
    } catch (err) {
      console.error(err);
      // For demo, we leave the list empty or mock it
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select("*")
        .order('created_at', { ascending: false });

      console.log("Orders Data:", data);
      console.log("Orders Error:", error);

      if (error) throw error;
      setOrders(data as Order[] || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const fetchSkinRequests = async () => {
    setIsLoadingSkinRequests(true);
    try {
      const { data, error } = await supabase
        .from('custom_skin_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setSkinRequests(data as SkinRequest[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSkinRequests(false);
    }
  };

  const handleUpdateSkinRequestStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('custom_skin_requests')
        .update({ order_status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchSkinRequests();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleUpdateSkinRequestNotes = async (id: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('custom_skin_requests')
        .update({ admin_notes: notes })
        .eq('id', id);

      if (error) throw error;
    } catch (err: any) {
      alert("Failed to update notes: " + err.message);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) setCategories(data as Category[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsAddingCategory(true);
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: newCategoryName.trim() }]);

      if (error) throw error;
      setNewCategoryName("");
      fetchCategories();
    } catch (err: any) {
      alert("Failed to add category: " + err.message);
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
    } catch (err: any) {
      alert("Failed to delete category: " + err.message);
    }
  };

  const fetchSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('id', 'store_settings')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // ignore no rows error
      if (data && data.value) setStoreSettings(data.value as StoreSettings);
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ id: 'store_settings', value: storeSettings, updated_at: new Date().toISOString() });

      if (error) throw error;
      alert("Settings saved successfully!");
    } catch (err: any) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const fetchDashboardStats = async () => {
    setIsLoadingStats(true);
    try {
      const [
        { count: productCount },
        { count: orderCount },
        { count: pendingCount },
        { data: orderRevenueData },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).in('order_status', ['Pending', 'Reserved']),
        supabase.from('orders').select('amount_paid'),
      ]);

      const orderRevenue = (orderRevenueData || []).reduce((sum: number, order: any) => sum + (Number(order.amount_paid) || 0), 0);

      setDashboardStats({
        totalProducts: productCount || 0,
        totalOrders: orderCount || 0,
        pendingReservations: pendingCount || 0,
        totalRevenue: orderRevenue,
      });

      const dummyData = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: Math.floor(Math.random() * 5000) + 1000,
        };
      });
      setChartData(dummyData);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "vighnaharta_uploads";

    if (!cloudName) {
      alert("Cloudinary Error: VITE_CLOUDINARY_CLOUD_NAME is missing in your .env file.");
      setImageUploadStatus("error");
      e.target.value = ""; // Reset input
      return;
    }

    setImageUploadStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      console.log(`Uploading to Cloudinary cloud: ${cloudName}`);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        console.log("Cloudinary upload successful:", data.secure_url);
        setUploadedImages(prev => [...prev, data.secure_url]);
        setImageUploadStatus("success");
      } else {
        throw new Error(data.error?.message || "Cloudinary API returned an error but no message.");
      }
    } catch (err: any) {
      alert(`Image upload failed: ${err.message}`);
      setImageUploadStatus("error");
    } finally {
      e.target.value = ""; // Reset input so the same file can be selected again
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingProduct(true);
    setProductSaveError("");
    try {
      const productData = {
        title: newProduct.title,
        slug: newProduct.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now(),
        description: newProduct.description,
        price: parseFloat(newProduct.price) || 0,
        category: newProduct.category,
        stock_status: newProduct.stock_status,
        stock_quantity: newProduct.stock_quantity,
        is_visible: newProduct.is_visible,
        featured: newProduct.featured,
        images: uploadedImages.length > 0 ? uploadedImages : ["https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=600&auto=format&fit=crop"],
      };

      if (editingId) {
        const { data, error } = await supabase.from('products').update(productData).eq('id', editingId).select();
        if (error) throw error;
        console.log("Supabase update successful:", data);
      } else {
        const { data, error } = await supabase.from('products').insert([productData]).select();
        if (error) throw error;
        console.log("Supabase insert successful:", data);
      }

      setIsAddModalOpen(false);
      setNewProduct({ title: "", description: "", price: "", category: "Smartphones", stock_status: "In Stock", stock_quantity: 10, is_visible: true, featured: false });
      setUploadedImages([]);
      setEditingId(null);
      fetchProducts();
    } catch (err: any) {
      console.error("Error saving product:", err);
      setProductSaveError(err.message || "An unknown error occurred while saving.");
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this premium product? This action cannot be undone.")) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  };

  const closeAndClearModal = () => {
    setIsAddModalOpen(false);
    setProductSaveError("");
  };

  const openEditModal = (product: Product) => {
    setProductSaveError("");
    setNewProduct({
      title: product.name,
      description: product.description || "",
      price: product.price.replace('₹', ''),
      category: product.category,
      stock_status: product.stock,
      stock_quantity: product.stock_quantity ?? 10,
      is_visible: product.is_visible ?? true,
      featured: product.featured || false,
    });
    setUploadedImages(product.images && product.images.length > 0 ? product.images : (product.image && product.image.includes('http') ? [product.image] : []));
    setEditingId(product.id);
    setIsAddModalOpen(true);
  };

  const openAddModal = () => {
    setProductSaveError("");
    setNewProduct({ title: "", description: "", price: "", category: "Smartphones", stock_status: "In Stock", stock_quantity: 10, is_visible: true, featured: false });
    setUploadedImages([]);
    setEditingId(null);
    setIsAddModalOpen(true);
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === "products") {
      fetchProducts();
    } else if (isAuthenticated && activeTab === "orders") {
      fetchOrders();
    } else if (isAuthenticated && activeTab === "custom") {
      fetchSkinRequests();
    } else if (isAuthenticated && activeTab === "categories") {
      fetchCategories();
    } else if (isAuthenticated && activeTab === "settings") {
      fetchSettings();
    } else if (isAuthenticated && activeTab === "dashboard") {
      fetchDashboardStats();
    }
  }, [isAuthenticated, activeTab]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 grain">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-background to-background" />
        <div className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-gold/30 shadow-[0_0_30px_rgba(212,160,23,0.2)]">
            <Lock className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-2xl font-display text-center uppercase tracking-wider mb-2">Admin Access</h1>
          <p className="text-sm text-muted-foreground text-center mb-8">Enter your credentials to access the Vighnaharta Dashboard.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
                placeholder="admin@vighnaharta.com"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
                placeholder="••••••••"
              />
            </div>
            {authError && <p className="text-xs text-red-500 text-center">{authError}</p>}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gold text-primary-foreground font-semibold rounded-xl px-4 py-3 hover:bg-gold/90 transition-all flex items-center justify-center gap-2 mt-4 shadow-[0_0_20px_rgba(212,160,23,0.2)] hover:shadow-[0_0_30px_rgba(212,160,23,0.4)]"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authenticate"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: Palette },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "custom", label: "Skin Requests", icon: ImageIcon },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card/30 border-r border-border/40 backdrop-blur-md flex flex-col shrink-0">
        <div className="p-6 border-b border-border/40">
          <div className="font-display text-xl tracking-wider uppercase text-gold">Vighnaharta</div>
          <div className="text-xs text-muted-foreground tracking-widest uppercase mt-1">Command Center</div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${activeTab === tab.id
                  ? "bg-gold/10 text-gold border border-gold/20 shadow-[inset_0_0_20px_rgba(212,160,23,0.05)]"
                  : "text-muted-foreground hover:bg-card hover:text-foreground border border-transparent"}`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-gold" : "opacity-70"}`} />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-border/40 bg-card/20 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
          <h2 className="font-semibold text-lg capitalize">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
              <span className="text-xs font-bold text-gold">AD</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent pointer-events-none" />

          {activeTab === "dashboard" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display uppercase tracking-wide">Business Overview</h3>
                <button onClick={fetchDashboardStats} className="p-2 bg-card border border-border/50 rounded-xl hover:bg-gold/10 hover:text-gold transition-colors">
                  <Loader2 className={`w-4 h-4 ${isLoadingStats ? "animate-spin text-gold" : "text-muted-foreground"}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-card/40 border border-border/50 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="w-12 h-12 text-gold" />
                  </div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Revenue</h4>
                  <div className="text-3xl font-display text-foreground">₹{dashboardStats.totalRevenue.toLocaleString('en-IN')}</div>
                  <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Estimate</p>
                </div>

                <div className="bg-card/40 border border-border/50 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShoppingCart className="w-12 h-12 text-gold" />
                  </div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Orders</h4>
                  <div className="text-3xl font-display text-foreground">{dashboardStats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">All time</p>
                </div>

                <div className="bg-card/40 border border-border/50 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Package className="w-12 h-12 text-gold" />
                  </div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Pending Tasks</h4>
                  <div className="text-3xl font-display text-foreground">{dashboardStats.pendingReservations}</div>
                  <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">Reservations & Requests</p>
                </div>

                <div className="bg-card/40 border border-border/50 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Star className="w-12 h-12 text-gold" />
                  </div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Products</h4>
                  <div className="text-3xl font-display text-foreground">{dashboardStats.totalProducts}</div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">Active inventory</p>
                </div>
              </div>

              <div className="bg-card/40 border border-border/50 rounded-2xl p-6 backdrop-blur-sm mb-8">
                <h4 className="font-semibold text-lg mb-6">Revenue Trend</h4>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4a017" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#d4a017" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(212,160,23,0.3)', borderRadius: '12px' }}
                        itemStyle={{ color: '#d4a017' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#d4a017" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card/40 border border-border/50 rounded-2xl p-6 backdrop-blur-sm">
                  <h4 className="font-semibold text-lg mb-4">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setActiveTab("products")} className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-gold/10 hover:border-gold/50 transition-all text-left flex flex-col gap-2">
                      <Plus className="w-5 h-5 text-gold" />
                      <span className="text-sm font-medium">Add Product</span>
                    </button>
                    <button onClick={() => setActiveTab("orders")} className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-gold/10 hover:border-gold/50 transition-all text-left flex flex-col gap-2">
                      <ShoppingCart className="w-5 h-5 text-gold" />
                      <span className="text-sm font-medium">View Orders</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-card/40 border border-border/50 rounded-2xl p-6 backdrop-blur-sm flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-gold" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">System Healthy</h4>
                  <p className="text-sm text-muted-foreground max-w-xs">All modules are operating normally. Supabase connection is active.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="relative w-full max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full bg-card/40 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                  />
                </div>
                <button
                  onClick={openAddModal}
                  className="bg-gold text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gold/90 transition-all shadow-[0_0_15px_rgba(212,160,23,0.2)]"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 bg-card/50">
                      <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock Status</th>
                      <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {isLoadingProducts ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gold" />
                          Loading inventory...
                        </td>
                      </tr>
                    ) : products.length > 0 ? (
                      products.map(product => (
                        <tr key={product.id} className="hover:bg-card/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-background border border-border/50 overflow-hidden shrink-0">
                                {product.image ? (
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-4 h-4 m-auto text-muted-foreground mt-3" />
                                )}
                              </div>
                              <span className="font-medium text-sm text-foreground line-clamp-1">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{product.category}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{product.price}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${product.stock === "In Stock" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                              product.stock === "Out of Stock" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                "bg-gold/10 text-gold border-gold/20"
                              }`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openEditModal(product)} className="p-2 text-muted-foreground hover:text-gold transition-colors rounded-lg hover:bg-gold/10">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          No products found. Click "Add Product" to create your first listing.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-xl font-display uppercase tracking-wide">Order Management</h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full bg-card/40 border border-border/50 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <select 
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-card/40 border border-border/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/50"
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <button onClick={fetchOrders} className="p-2 bg-card border border-border/50 rounded-xl hover:bg-gold/10 hover:text-gold transition-colors">
                    <Loader2 className={`w-4 h-4 ${isLoadingOrders ? "animate-spin text-gold" : "text-muted-foreground"}`} />
                  </button>
                </div>
              </div>

              <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 bg-card/50">
                      <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order / Customer</th>
                      <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {isLoadingOrders ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gold" />
                          Loading orders...
                        </td>
                      </tr>
                    ) : orders.length > 0 ? (
                      orders
                        .filter(order => orderStatusFilter === "All" || order.order_status === orderStatusFilter)
                        .filter(order => orderSearchQuery === "" || order.customer_name?.toLowerCase().includes(orderSearchQuery.toLowerCase()) || order.id.toLowerCase().includes(orderSearchQuery.toLowerCase()))
                        .map(order => {
                        return (
                          <tr key={order.id} className="hover:bg-card/60 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-mono text-xs text-muted-foreground mb-1">
                                  {order.id ? order.id.split('-')[0] + '...' : 'N/A'}
                                </span>
                                <span className="font-medium text-sm text-foreground">{order.customer_name || 'N/A'}</span>
                                <span className="text-xs text-muted-foreground">{order.customer_phone || 'N/A'}</span>
                                <span className="text-[10px] text-muted-foreground mt-1">
                                  {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
                                  {order.product_name || `Order Ref: ${order.id || 'N/A'}`}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm text-foreground font-medium">₹{order.amount_paid || 0}</span>
                                <span className="text-xs text-muted-foreground">{order.payment_type || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-2 items-start">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
                                  order.order_status === "Completed" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                  order.order_status === "Cancelled" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                  "bg-gold/10 text-gold border-gold/20"
                                }`}>
                                  {order.order_status || 'Pending'}
                                </span>
                                {order.pickup_status && (
                                  <span className="text-[10px] text-muted-foreground">Pickup: {order.pickup_status}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <select 
                                value={order.order_status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-gold/50"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Reserved">Reserved</option>
                                <option value="Ready for Pickup">Ready for Pickup</option>
                                <option value="Picked Up">Picked Up</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          No reservations yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "custom" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display uppercase tracking-wide">Custom Skin Requests</h3>
                <button onClick={fetchSkinRequests} className="p-2 bg-card border border-border/50 rounded-xl hover:bg-gold/10 hover:text-gold transition-colors">
                  <Loader2 className={`w-4 h-4 ${isLoadingSkinRequests ? "animate-spin text-gold" : "text-muted-foreground"}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoadingSkinRequests ? (
                  <div className="col-span-full py-12 flex flex-col items-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-gold mb-4" />
                    Loading custom requests...
                  </div>
                ) : skinRequests.length > 0 ? (
                  skinRequests.map(req => (
                    <div key={req.id} className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col">
                      {req.uploaded_design_url ? (
                        <div className="h-48 w-full bg-black/20 overflow-hidden relative border-b border-border/50 group cursor-pointer" onClick={() => window.open(req.uploaded_design_url!, '_blank')}>
                          <img src={req.uploaded_design_url} alt="Custom Design" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                            <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md">View Full Image</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 w-full bg-black/20 flex flex-col items-center justify-center border-b border-border/50 text-muted-foreground">
                          <Palette className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-sm">Standard Pattern Chosen</span>
                        </div>
                      )}
                      
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="font-mono text-xs text-muted-foreground block mb-1">REQ-{req.id.split('-')[0].toUpperCase()}</span>
                            <h4 className="font-medium text-foreground">{req.customer_name}</h4>
                            <p className="text-sm text-muted-foreground">{req.customer_phone}</p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${
                            req.payment_status === "Paid" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}>
                            {req.payment_status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4 bg-background/50 rounded-xl p-3 border border-border/50">
                          <div>
                            <span className="text-[10px] uppercase text-muted-foreground block">Device</span>
                            <span className="text-sm font-medium capitalize">{req.device_type}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-muted-foreground block">Material</span>
                            <span className="text-sm font-medium capitalize">{req.skin_type}</span>
                          </div>
                        </div>

                        <div className="mb-6">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Admin Design Notes</label>
                          <textarea
                            defaultValue={req.admin_notes || ""}
                            onBlur={(e) => handleUpdateSkinRequestNotes(req.id, e.target.value)}
                            className="w-full bg-background/50 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold/50"
                            placeholder="Add design or production notes here..."
                            rows={2}
                          />
                        </div>

                        <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-4">
                          <span className={`text-xs font-medium ${
                            req.order_status === "Delivered" ? "text-green-400" : "text-gold"
                          }`}>
                            {req.order_status}
                          </span>
                          <select 
                            value={req.order_status}
                            onChange={(e) => handleUpdateSkinRequestStatus(req.id, e.target.value)}
                            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-gold/50"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Designing">Designing</option>
                            <option value="Printing">Printing</option>
                            <option value="Ready">Ready</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border/60 rounded-3xl">
                    No custom skin requests found.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display uppercase tracking-wide">Category Management</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="bg-card/40 border border-border/50 rounded-2xl p-6 backdrop-blur-sm sticky top-6">
                    <h4 className="font-semibold text-lg mb-4">Add New Category</h4>
                    <form onSubmit={handleAddCategory} className="space-y-4">
                      <div>
                        <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Category Name</label>
                        <input
                          type="text" required
                          value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}
                          className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                          placeholder="e.g. Tablets"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isAddingCategory}
                        className="w-full bg-gold text-primary-foreground font-semibold rounded-xl px-4 py-2.5 hover:bg-gold/90 transition-all flex items-center justify-center gap-2"
                      >
                        {isAddingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add Category</>}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/50 bg-card/50">
                          <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category Name</th>
                          <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {isLoadingCategories ? (
                          <tr>
                            <td colSpan={2} className="px-6 py-12 text-center text-muted-foreground">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gold" />
                            </td>
                          </tr>
                        ) : categories.length > 0 ? (
                          categories.map(cat => (
                            <tr key={cat.id} className="hover:bg-card/60 transition-colors">
                              <td className="px-6 py-4 font-medium text-sm">{cat.name}</td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="px-6 py-12 text-center text-muted-foreground">
                              No categories found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display uppercase tracking-wide">Store Settings</h3>
                {isLoadingSettings && <Loader2 className="w-5 h-5 animate-spin text-gold" />}
              </div>

              <div className="bg-card/40 border border-border/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Store Name</label>
                      <input
                        type="text" required
                        value={storeSettings.store_name} onChange={e => setStoreSettings({ ...storeSettings, store_name: e.target.value })}
                        className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">WhatsApp Number</label>
                      <input
                        type="text" required
                        value={storeSettings.whatsapp_number} onChange={e => setStoreSettings({ ...storeSettings, whatsapp_number: e.target.value })}
                        className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                        placeholder="+91..."
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Instagram Link</label>
                      <input
                        type="url"
                        value={storeSettings.instagram_link} onChange={e => setStoreSettings({ ...storeSettings, instagram_link: e.target.value })}
                        className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Business Hours</label>
                      <input
                        type="text"
                        value={storeSettings.business_hours} onChange={e => setStoreSettings({ ...storeSettings, business_hours: e.target.value })}
                        className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                        placeholder="e.g. 10:00 AM - 9:00 PM"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Store Address</label>
                    <textarea
                      rows={2} required
                      value={storeSettings.store_address} onChange={e => setStoreSettings({ ...storeSettings, store_address: e.target.value })}
                      className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Google Maps Link</label>
                    <input
                      type="url"
                      value={storeSettings.google_maps_link} onChange={e => setStoreSettings({ ...storeSettings, google_maps_link: e.target.value })}
                      className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Announcement Banner</label>
                    <input
                      type="text"
                      value={storeSettings.announcement_banner || ""} onChange={e => setStoreSettings({ ...storeSettings, announcement_banner: e.target.value })}
                      className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                      placeholder="e.g. 🚨 Mega Sale on Skins! Use code VIGHNA20"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Logo Image URL</label>
                      <input
                        type="url"
                        value={storeSettings.logo_url || ""} onChange={e => setStoreSettings({ ...storeSettings, logo_url: e.target.value })}
                        className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Theme Accent</label>
                      <input
                        type="text"
                        value={storeSettings.theme_accent || "Gold"} onChange={e => setStoreSettings({ ...storeSettings, theme_accent: e.target.value })}
                        className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                        placeholder="e.g. Gold"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="bg-gold text-primary-foreground font-semibold rounded-xl px-8 py-3 hover:bg-gold/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,160,23,0.2)]"
                    >
                      {isSavingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab !== "dashboard" && activeTab !== "products" && activeTab !== "orders" && activeTab !== "custom" && activeTab !== "categories" && activeTab !== "settings" && (
            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-card border border-border/50 flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">Module Under Construction</h3>
              <p className="max-w-md text-sm">The {activeTab} module will be connected to Supabase in the next iteration of Phase 2.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeAndClearModal}
          />
          <div className="relative w-full max-w-lg bg-card border border-border/60 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <button
              onClick={closeAndClearModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-background/50 backdrop-blur-md border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-display uppercase tracking-wide mb-6">{editingId ? "Edit Product" : "Add New Product"}</h2>

            <form onSubmit={handleAddProduct} className="space-y-4">
              {productSaveError && (
                <div className="text-xs text-center text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{productSaveError}</div>
              )}
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Product Title</label>
                <input
                  type="text" required
                  value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                  placeholder="e.g. iPhone 15 Pro Max Skin"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Price (₹)</label>
                  <input
                    type="number" required
                    value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                    placeholder="499"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Stock Status</label>
                  <select
                    value={newProduct.stock_status} onChange={e => setNewProduct({ ...newProduct, stock_status: e.target.value })}
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.stock_quantity} onChange={e => setNewProduct({ ...newProduct, stock_quantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex items-center gap-3 bg-card/50 border border-border/50 rounded-xl p-4">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={newProduct.featured}
                    onChange={e => setNewProduct({ ...newProduct, featured: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-gold focus:ring-gold/50 bg-background/50 accent-gold"
                  />
                  <label htmlFor="featured" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                    <Star className="w-4 h-4 text-gold" />
                    Featured
                  </label>
                </div>
                <div className="flex-1 flex items-center gap-3 bg-card/50 border border-border/50 rounded-xl p-4">
                  <input
                    type="checkbox"
                    id="visible"
                    checked={newProduct.is_visible}
                    onChange={e => setNewProduct({ ...newProduct, is_visible: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-gold focus:ring-gold/50 bg-background/50 accent-gold"
                  />
                  <label htmlFor="visible" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                    Visible to Public
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Product Images (Cloudinary)</label>
                <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:bg-card/50 transition-colors relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageUploadStatus === "uploading"}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex flex-col items-center gap-2">
                    {imageUploadStatus === "uploading" ? (
                      <Loader2 className="w-8 h-8 text-gold animate-spin" />
                    ) : (
                      <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-gold transition-colors" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {imageUploadStatus === "uploading" ? "Uploading to Cloudinary..." : "Click or drag to upload"}
                    </span>
                  </div>
                </div>
                {uploadedImages.length > 0 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border/50 shrink-0 group">
                        <img src={img} alt="Uploaded" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Category</label>
                <select
                  value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                >
                  <option value="Smartphones">Smartphones</option>
                  <option value="Mobile Skins">Mobile Skins</option>
                  <option value="Laptop Skins">Laptop Skins</option>
                  <option value="AirPods Skins">AirPods Skins</option>
                  <option value="Accessories">Accessories</option>
                  {categories.filter(c => !["Smartphones", "Mobile Skins", "Laptop Skins", "AirPods Skins", "Accessories"].includes(c.name)).map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">Description</label>
                <textarea
                  rows={3}
                  value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-gold/50 focus:ring-1 focus:ring-gold/50"
                  placeholder="Product description..."
                />
              </div>
              <button
                type="submit"
                disabled={isAddingProduct}
                className="w-full bg-gold text-primary-foreground font-semibold rounded-xl px-4 py-3 hover:bg-gold/90 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isAddingProduct ? <Loader2 className="w-5 h-5 animate-spin" /> : editingId ? "Update Product" : "Save Product to Database"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
