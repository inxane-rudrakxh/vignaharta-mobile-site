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
  Star
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

type Product = {
  id: string | number;
  name: string;
  price: string;
  category: string;
  stock: string;
  image: string;
  rating: number;
  description: string;
  featured?: boolean;
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
        setProducts(data.map((p: any) => ({
          id: p.id,
          name: p.title || p.name || "Unnamed Product",
          price: `₹${p.price || 0}`,
          category: p.category || "General",
          stock: p.stock_status || "In Stock",
          image: p.images?.[0] || "",
          rating: 0,
          description: p.description,
          featured: p.featured || false,
        })));
      }
    } catch (err) {
      console.error(err);
      // For demo, we leave the list empty or mock it
    } finally {
      setIsLoadingProducts(false);
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
      setNewProduct({ title: "", description: "", price: "", category: "Smartphones", stock_status: "In Stock", featured: false });
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
      featured: product.featured || false,
    });
    setUploadedImages(product.image && product.image.includes('http') ? [product.image] : []);
    setEditingId(product.id);
    setIsAddModalOpen(true);
  };

  const openAddModal = () => {
    setProductSaveError("");
    setNewProduct({ title: "", description: "", price: "", category: "Smartphones", stock_status: "In Stock", featured: false });
    setUploadedImages([]);
    setEditingId(null);
    setIsAddModalOpen(true);
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === "products") {
      fetchProducts();
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

          {activeTab !== "products" && (
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
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="flex items-center gap-3 bg-card/50 border border-border/50 rounded-xl p-4">
                <input
                  type="checkbox"
                  id="featured"
                  checked={newProduct.featured}
                  onChange={e => setNewProduct({ ...newProduct, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-gold focus:ring-gold/50 bg-background/50 accent-gold"
                />
                <label htmlFor="featured" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                  <Star className="w-4 h-4 text-gold" />
                  Mark as Featured Product
                </label>
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
