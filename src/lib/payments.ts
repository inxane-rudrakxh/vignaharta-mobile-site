// Razorpay Integration Architecture - Phase 2 Readiness
// This module provides the structure for integrating Razorpay.
// Actual keys should be placed in .env.local:
// VITE_RAZORPAY_KEY_ID=your_key_id

export type PaymentIntent = {
  id: string;
  amount: number;
  currency: string;
  status: "created" | "attempted" | "paid";
};

export type PaymentVerification = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

/**
 * Initializes a payment intent with your backend.
 * In a real scenario, this calls a Supabase Edge Function to securely create the Razorpay order.
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = "INR",
  isAdvance: boolean = false
): Promise<PaymentIntent> {
  const finalAmount = isAdvance ? 100 : amount;
  console.log(`[Payment Arch] Creating intent for ${finalAmount} ${currency}`);
  
  // Stubbed for Phase 2:
  return {
    id: "order_" + Math.random().toString(36).substr(2, 9),
    amount: finalAmount * 100, // Razorpay uses smallest currency unit (paise)
    currency,
    status: "created"
  };
}

/**
 * Opens the Razorpay checkout modal.
 */
export async function initiateCheckout(
  intent: PaymentIntent,
  customerDetails: { name: string; phone: string; email?: string },
  onSuccess: (verification: PaymentVerification) => void,
  onError: (error: any) => void
) {
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!keyId) {
    console.warn("[Payment Arch] Razorpay Key ID missing. Bypassing payment for development.");
    // Simulate successful payment for development flow
    setTimeout(() => {
      onSuccess({
        razorpay_payment_id: "pay_" + Math.random().toString(36).substr(2, 9),
        razorpay_order_id: intent.id,
        razorpay_signature: "simulated_signature"
      });
    }, 1000);
    return;
  }

  // Load Razorpay script dynamically if not present
  if (!(window as any).Razorpay) {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    await new Promise(resolve => script.onload = resolve);
  }

  const options = {
    key: keyId,
    amount: intent.amount,
    currency: intent.currency,
    name: "Vighnaharta Mobile Shop",
    description: "Premium Gadget Order",
    image: "/logo.png", // Replace with actual logo URL
    order_id: intent.id,
    handler: function (response: PaymentVerification) {
      onSuccess(response);
    },
    prefill: {
      name: customerDetails.name,
      email: customerDetails.email || "",
      contact: customerDetails.phone
    },
    theme: {
      color: "#d4a017" // Matches the Vighnaharta gold theme
    }
  };

  try {
    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      onError(response.error);
    });
    rzp.open();
  } catch (err) {
    onError(err);
  }
}

/**
 * Verifies the payment signature securely on the backend.
 */
export async function verifyPayment(verification: PaymentVerification): Promise<boolean> {
  console.log("[Payment Arch] Verifying payment signature...", verification);
  // Stubbed: Real implementation would call a Supabase Edge Function to verify signature with Secret Key
  return true;
}
