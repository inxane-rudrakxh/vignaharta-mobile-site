import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, currency = "INR", customerDetails } = await req.json();

    const appId = Deno.env.get("CASHFREE_APP_ID");
    const secretKey = Deno.env.get("CASHFREE_SECRET_KEY");
    const environment = Deno.env.get("CASHFREE_ENVIRONMENT") || "sandbox"; // 'sandbox' or 'production'

    if (!appId || !secretKey) {
      throw new Error("Cashfree credentials are not configured in edge function.");
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Construct Cashfree API URL based on environment
    const cashfreeUrl = environment === "production"
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    console.log(`[Cashfree] Creating order ${orderId} for ₹${amount} (${environment})`);

    const customer_id = customerDetails?.phone 
      ? `cust_${customerDetails.phone.replace(/\D/g, '')}` 
      : `cust_${Math.random().toString(36).substring(2, 10)}`;

    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: currency,
      customer_details: {
        customer_id,
        customer_name: customerDetails?.name || "Guest Customer",
        customer_phone: customerDetails?.phone || "9999999999",
        customer_email: customerDetails?.email || "guest@example.com",
      },
      order_meta: {
        // Return URL is not strictly necessary for modal checkout since it's handled inline,
        // but adding a dummy one is required by some API versions if omitted.
        return_url: "https://example.com/payment-success?order_id={order_id}"
      }
    };

    const response = await fetch(cashfreeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Cashfree API Error]:", data);
      throw new Error(`Cashfree API Error: ${data.message || 'Unknown error'}`);
    }

    if (!data.payment_session_id) {
      console.error("[Cashfree Error] Missing session ID in response:", data);
      throw new Error("Failed to generate payment_session_id");
    }

    console.log(`[Cashfree] Successfully generated session for ${orderId}`);

    return new Response(
      JSON.stringify({
        payment_session_id: data.payment_session_id,
        order_id: data.order_id,
        amount: data.order_amount,
        currency: data.order_currency,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[Function Error]:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
