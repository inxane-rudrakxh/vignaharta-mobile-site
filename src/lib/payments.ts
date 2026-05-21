import { load } from "@cashfreepayments/cashfree-js";

// Cashfree Integration Architecture
// Actual keys should be placed in .env.local:
// VITE_CASHFREE_APP_ID=your_app_id

export type PaymentIntent = {
  payment_session_id: string;
  order_id: string;
  amount: number;
  currency: string;
};

export type PaymentVerification = {
  transaction_id: string;
  order_id: string;
};

let cashfreeInstance: any = null;

const getCashfree = async () => {
  if (!cashfreeInstance) {
    cashfreeInstance = await load({
      mode: "sandbox", // Switch to "production" when ready
    });
  }
  return cashfreeInstance;
};

/**
 * Initializes a payment intent with your backend.
 * In a real scenario, this calls a Supabase Edge Function to securely create the Cashfree order and return the payment_session_id.
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = "INR",
  isAdvance: boolean = false
): Promise<PaymentIntent> {
  const finalAmount = isAdvance ? 100 : amount;
  console.log(`[Payment Arch] Creating intent for ${finalAmount} ${currency}`);
  
  // Stubbed for development without backend:
  return {
    payment_session_id: "session_" + Math.random().toString(36).substr(2, 9),
    order_id: "order_" + Math.random().toString(36).substr(2, 9),
    amount: finalAmount, 
    currency,
  };
}

/**
 * Opens the Cashfree checkout modal.
 */
export async function initiateCheckout(
  intent: PaymentIntent,
  customerDetails: { name: string; phone: string; email?: string }
): Promise<PaymentVerification> {
  console.log("[Payment Arch] Initiating checkout...");
  const appId = import.meta.env.VITE_CASHFREE_APP_ID;

  if (!appId) {
    console.warn("[Payment Arch] Cashfree App ID missing. Bypassing payment for development.");
    // Simulate successful payment for development flow
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          transaction_id: "txn_" + Math.random().toString(36).substr(2, 9),
          order_id: intent.order_id,
        });
      }, 1000);
    });
  }

  const cashfree = await getCashfree();

  return new Promise((resolve, reject) => {
    let isHandled = false;

    const handleSuccess = () => {
      if (isHandled) return;
      isHandled = true;
      console.log("STEP 4 - Payment success callback");
      resolve({
        transaction_id: "txn_" + intent.order_id, // In a real scenario, fetch real transaction ID from backend webhook or verify endpoint
        order_id: intent.order_id
      });
    };

    const handleError = (error: any) => {
      if (isHandled) return;
      isHandled = true;
      console.error("Payment Arch Error:", error);
      reject(error);
    };

    const checkoutOptions = {
      paymentSessionId: intent.payment_session_id,
      redirectTarget: "_modal",
    };

    try {
      console.log("STEP 3 - Cashfree modal opened");
      cashfree.checkout(checkoutOptions).then((result: any) => {
        if (result.error) {
          console.log("STEP 5 - Payment failed callback or popup dismissed");
          handleError(new Error(result.error.message || "Payment cancelled or closed."));
        }
        if (result.redirect) {
          console.log("STEP 4 - Payment redirected");
          handleSuccess();
        }
        if (result.paymentDetails) {
          console.log("STEP 4 - Payment details received");
          handleSuccess();
        }
      });
    } catch (err) {
      handleError(err);
    }
  });
}

/**
 * Verifies the payment signature securely on the backend.
 */
export async function verifyPayment(verification: PaymentVerification): Promise<boolean> {
  console.log("[Payment Arch] Verifying payment status...", verification);
  // Stubbed: Real implementation would call a Supabase Edge Function to verify payment status with Cashfree API
  return true;
}

