-- =====================================================
-- STRIPE MIGRATION — Vignaharta Mobile Shop
-- Run this in: Supabase Dashboard > SQL Editor
-- SAFE: Uses ADD COLUMN IF NOT EXISTS — no data lost
-- =====================================================

-- 1. Add Stripe-compatible columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_gateway text DEFAULT 'Stripe';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'Pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_name text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_status text DEFAULT 'Pending';

-- 2. Add Stripe-compatible columns to custom_skin_requests
ALTER TABLE custom_skin_requests ADD COLUMN IF NOT EXISTS transaction_id text;
ALTER TABLE custom_skin_requests ADD COLUMN IF NOT EXISTS payment_gateway text DEFAULT 'Stripe';
ALTER TABLE custom_skin_requests ADD COLUMN IF NOT EXISTS payment_reference text;
ALTER TABLE custom_skin_requests ADD COLUMN IF NOT EXISTS design_metadata jsonb;
ALTER TABLE custom_skin_requests ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0;
ALTER TABLE custom_skin_requests ADD COLUMN IF NOT EXISTS customer_email text;

-- 3. Update default payment_gateway for new rows
-- (existing rows keep their old value; only new inserts default to 'Stripe')

-- 4. (OPTIONAL) If you have old Razorpay-only columns with NO DATA,
--    uncomment and run these AFTER confirming:
-- ALTER TABLE orders DROP COLUMN IF EXISTS razorpay_payment_id;
-- ALTER TABLE orders DROP COLUMN IF EXISTS razorpay_order_id;
-- ALTER TABLE orders DROP COLUMN IF EXISTS razorpay_signature;
-- ALTER TABLE custom_skin_requests DROP COLUMN IF EXISTS razorpay_payment_id;
-- ALTER TABLE custom_skin_requests DROP COLUMN IF EXISTS razorpay_order_id;
-- ALTER TABLE custom_skin_requests DROP COLUMN IF EXISTS razorpay_signature;

-- 5. Ensure public insert policy exists for orders (anon users placing orders)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders'
      AND policyname = 'Public insert orders'
  ) THEN
    CREATE POLICY "Public insert orders"
      ON orders FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- 6. Ensure public insert policy exists for custom_skin_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'custom_skin_requests'
      AND policyname = 'Public insert custom skin requests'
  ) THEN
    CREATE POLICY "Public insert custom skin requests"
      ON custom_skin_requests FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Done. No tables dropped. No data lost.
SELECT 'Stripe migration complete. All columns added safely.' AS status;
