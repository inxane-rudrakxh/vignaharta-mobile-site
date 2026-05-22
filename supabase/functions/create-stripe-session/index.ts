// Supabase Edge Function: create-stripe-session
// Deploy: supabase functions deploy create-stripe-session
// Or paste into: Supabase Dashboard > Edge Functions > New Function
//
// Required secret (set via Supabase Dashboard > Edge Functions > Secrets):
//   STRIPE_SECRET_KEY = sk_test_... (or sk_live_...)

import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("[create-stripe-session] STRIPE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment service not configured. Contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const body = await req.json();
    const {
      amount,
      currency = "inr",
      paymentType,
      orderType,
      metadata,
      success_url,
      cancel_url,
    } = body;

    // Validate required fields
    if (!amount || amount < 100) {
      return new Response(
        JSON.stringify({ error: "Invalid payment amount." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: "Redirect URLs are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[create-stripe-session] Creating session:", {
      amount,
      currency,
      orderType,
      paymentType,
    });

    // Build line item description
    const productName =
      orderType === "product"
        ? metadata?.productName || "Vighnaharta Product Reservation"
        : `Custom ${metadata?.skinType || "Skin"} — ${metadata?.deviceModel || "Device"}`;

    const description =
      paymentType === "Advance Payment"
        ? `Advance booking fee — ${productName}`
        : `Full payment — ${productName}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: productName,
              description,
              images: [], // Optionally add product image URL here
            },
            unit_amount: amount, // Already in paise
          },
          quantity: 1,
        },
      ],
      customer_email: metadata?.customerEmail || undefined,
      metadata: {
        order_type: orderType || "product",
        payment_type: paymentType || "Full Payment",
        customer_name: metadata?.customerName || "",
        customer_phone: metadata?.customerPhone || "",
        product_name: metadata?.productName || "",
        skin_type: metadata?.skinType || "",
        device_model: metadata?.deviceModel || "",
      },
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url,
      billing_address_collection: "auto",
      phone_number_collection: {
        enabled: false, // Phone already collected in our form
      },
    });

    console.log("[create-stripe-session] Session created:", session.id);

    return new Response(
      JSON.stringify({
        checkout_url: session.url,
        session_id: session.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[create-stripe-session] Error:", error?.message || error);
    return new Response(
      JSON.stringify({
        error: error?.message || "Failed to create checkout session.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
