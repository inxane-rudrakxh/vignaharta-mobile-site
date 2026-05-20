-- PHASE 2: Supabase Database Schema

-- 1. PRODUCTS TABLE
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category text NOT NULL,
  price numeric NOT NULL,
  stock_quantity integer DEFAULT 0,
  stock_status text DEFAULT 'In Stock',
  featured boolean DEFAULT false,
  images text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CATEGORIES TABLE
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name text UNIQUE NOT NULL,
  icon text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ORDERS TABLE
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  payment_type text NOT NULL,
  payment_status text DEFAULT 'Pending',
  order_status text DEFAULT 'Processing',
  amount numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CUSTOM_SKIN_REQUESTS TABLE
CREATE TABLE custom_skin_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text,
  customer_phone text,
  device_type text NOT NULL,
  skin_type text NOT NULL,
  uploaded_design_url text,
  payment_type text NOT NULL,
  payment_status text DEFAULT 'Pending',
  order_status text DEFAULT 'Pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Enable Row Level Security (RLS) on these tables and set up appropriate policies.
-- For the admin dashboard, you would typically restrict write access to authenticated admin users.

-- =========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_skin_requests ENABLE ROW LEVEL SECURITY;

-- 1. PRODUCTS POLICIES
-- Anyone can view products (needed for the public catalog)
CREATE POLICY "Public can view products" ON products FOR SELECT TO anon, authenticated USING (true);
-- Only authenticated users (admins) can insert/update/delete products
CREATE POLICY "Admins can insert products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update products" ON products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete products" ON products FOR DELETE TO authenticated USING (true);

-- 2. CATEGORIES POLICIES
CREATE POLICY "Public can view categories" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. ORDERS POLICIES
-- Anyone can insert an order
CREATE POLICY "Public can insert orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Only authenticated admins can view and manage all orders
CREATE POLICY "Admins can manage orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. CUSTOM SKIN REQUESTS POLICIES
-- Anyone can insert a skin request
CREATE POLICY "Public can insert custom skin requests" ON custom_skin_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Only authenticated admins can view and manage requests
CREATE POLICY "Admins can manage custom skin requests" ON custom_skin_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
