"use client";
import { useCallback, useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import ContactForm from "@/components/checkout/ContactForm";
import DeliveryForm from "@/components/checkout/DeliveryForm";
import ShippingMethod from "@/components/checkout/ShippingMethod";
import BillingAddress from "@/components/checkout/BillingAddress";
import OrderSummary from "@/components/checkout/OrderSummary";
import styles from "./page.module.css";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, comboDiscount } = useCart();

  // Form state
  const [contactInfo, setContactInfo] = useState({ email: "", phone: "" });
  const [deliveryInfo, setDeliveryInfo] = useState({
    country: "India",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
    saveInfo: false,
    textOffers: false,
  });
  const [shippingMethod, setShippingMethod] = useState(null);
  const [billingAddressSame, setBillingAddressSame] = useState(true);
  const [billingInfo, setBillingInfo] = useState({});
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Redirect if cart is empty — but NOT while a payment is being
  // processed. Without this guard, the success-page redirect from the
  // Razorpay handler races against this effect (the cart is briefly
  // empty between clearCart and the push) and the user lands on /cart.
  useEffect(() => {
    if (cart.length === 0 && !isProcessing) {
      router.push("/cart");
    }
  }, [cart, router, isProcessing]);

  // Restore + persist checkout draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem("checkoutData");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.contactInfo) setContactInfo(parsed.contactInfo);
        if (parsed.deliveryInfo) setDeliveryInfo(parsed.deliveryInfo);
      }
    } catch {
      // ignore corrupt draft
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "checkoutData",
        JSON.stringify({ contactInfo, deliveryInfo })
      );
    } catch {
      // quota exceeded — ignore
    }
  }, [contactInfo, deliveryInfo]);

  // Shipping is currently free across the catalog. We keep the effect
  // so the field updates when the address is entered, but it always
  // resolves to 0 — matching the server-side total.
  useEffect(() => {
    setShippingCost(0);
  }, [deliveryInfo.pinCode, cartSubtotal, comboDiscount, appliedDiscount]);

  const handleApplyDiscount = () => {
    if (discountCode.toUpperCase() === "WELCOME10") {
      setAppliedDiscount({
        code: discountCode.toUpperCase(),
        type: "percentage",
        value: 10,
        amount: Math.round((cartSubtotal - comboDiscount) * 0.1),
      });
    } else {
      alert("Invalid discount code");
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
  };

  const calculateTotal = () => {
    let total = cartSubtotal - comboDiscount + shippingCost;
    if (appliedDiscount) total -= appliedDiscount.amount;
    return Math.max(0, total);
  };

  // Build the lean cart payload the server expects (slug + qty + personalisation).
  const buildCartPayload = useCallback(
    () =>
      cart.map((item) => ({
        slug: item.slug,
        quantity: item.quantity,
        personalisation: item.personalisation || null,
      })),
    [cart]
  );

  const validateForCheckout = () => {
    if (!contactInfo.email) return "Please enter your email.";
    if (!deliveryInfo.firstName) return "Please enter your first name.";
    if (!deliveryInfo.address) return "Please enter your delivery address.";
    if (!deliveryInfo.city) return "Please enter your city.";
    if (!deliveryInfo.state) return "Please select your state.";
    if (!/^\d{6}$/.test(deliveryInfo.pinCode || ""))
      return "Please enter a valid 6-digit PIN code.";
    if (!deliveryInfo.phone) return "Please enter a contact phone number.";
    return null;
  };

  const openRazorpayCheckout = (orderResp) => {
    const Razorpay = typeof window !== "undefined" && window.Razorpay;
    if (!Razorpay) {
      setErrorMessage(
        "Payment gateway is still loading. Please try Pay Now again in a moment."
      );
      setIsProcessing(false);
      return;
    }

    const options = {
      key: orderResp.razorpayKeyId,
      amount: orderResp.amountPaise,
      currency: orderResp.currency,
      name: "The Design Factory",
      description: `Order ${orderResp.orderNumber}`,
      order_id: orderResp.razorpayOrderId,
      prefill: {
        name: `${deliveryInfo.firstName} ${deliveryInfo.lastName || ""}`.trim(),
        email: contactInfo.email,
        contact: contactInfo.phone || deliveryInfo.phone,
      },
      notes: {
        order_number: orderResp.orderNumber,
      },
      theme: { color: "#FCD589" },
      // Force the UPI block to expose all three flows — `collect` is
      // the "Enter UPI ID" path, `qr` is the scannable code, `intent`
      // is the deep-link to UPI apps on mobile. Razorpay sometimes
      // hides `collect` on desktop by default; this guarantees it.
      config: {
        display: {
          blocks: {
            upiBlock: {
              name: "Pay using UPI",
              instruments: [
                {
                  method: "upi",
                  flows: ["collect", "intent", "qr"],
                },
              ],
            },
          },
          sequence: ["block.upiBlock"],
          preferences: {
            show_default_blocks: true, // keeps Cards / Netbanking / Wallet etc.
          },
        },
      },
      handler: async function (response) {
        try {
          const verifyRes = await fetch("/api/checkout/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(
              verifyData.error || "Payment verification failed."
            );
          }
          try {
            localStorage.removeItem("checkoutData");
          } catch {}
          // IMPORTANT: do NOT clearCart() here. The checkout page's
          // cart-empty effect would race the redirect and push us to
          // /cart instead of /checkout/success. The success page
          // clears the cart on mount, after navigation completes.
          router.push(
            `/checkout/success?orderNumber=${encodeURIComponent(
              verifyData.orderNumber
            )}`
          );
        } catch (err) {
          setErrorMessage(
            err?.message ||
              "Payment was received but we couldn't confirm it. Our team will reach out."
          );
          setIsProcessing(false);
        }
      },
      modal: {
        ondismiss: () => {
          // The user closed Razorpay without completing payment.
          // The server-side Order remains as `pending` until Razorpay
          // sends a `payment.failed` webhook or we re-attempt — that's
          // fine and shows up in the admin Orders tab as expected.
          setIsProcessing(false);
        },
      },
    };

    const rzp = new Razorpay(options);
    rzp.on("payment.failed", function (response) {
      setErrorMessage(
        response?.error?.description ||
          "Your payment couldn't be completed. Please try again."
      );
      setIsProcessing(false);
    });
    rzp.open();
  };

  const handlePayment = async () => {
    setErrorMessage(null);
    const validationError = validateForCheckout();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/checkout/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: buildCartPayload(),
          contact: contactInfo,
          delivery: deliveryInfo,
          billingAddressSame,
          billing: billingAddressSame ? null : billingInfo,
          discountCode: appliedDiscount?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Could not start checkout (${res.status}).`);
      }
      openRazorpayCheckout(data);
    } catch (err) {
      setErrorMessage(err?.message || "Could not start checkout.");
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className={styles.checkoutPage}>
      {/* Razorpay Checkout JS */}
      <Script src={RAZORPAY_SCRIPT} strategy="afterInteractive" />

      <div className={styles.container}>
        {/* Left Column - Checkout Form */}
        <div className={styles.leftColumn}>
          <div className={styles.logo}>
            <h1>The Design Factory</h1>
          </div>

          <ContactForm
            contactInfo={contactInfo}
            setContactInfo={setContactInfo}
          />

          <DeliveryForm
            deliveryInfo={deliveryInfo}
            setDeliveryInfo={setDeliveryInfo}
          />

          <ShippingMethod
            shippingMethod={shippingMethod}
            setShippingMethod={setShippingMethod}
            shippingCost={shippingCost}
            hasAddress={deliveryInfo.pinCode?.length === 6}
          />

          <BillingAddress
            billingAddressSame={billingAddressSame}
            setBillingAddressSame={setBillingAddressSame}
            billingInfo={billingInfo}
            setBillingInfo={setBillingInfo}
          />

          {errorMessage ? (
            <div
              role="alert"
              style={{
                background: "rgba(192, 57, 43, 0.08)",
                border: "1px solid rgba(192, 57, 43, 0.3)",
                color: "#a93226",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                margin: "12px 0",
              }}
            >
              {errorMessage}
            </div>
          ) : null}



          <div className={styles.footer}>
            <a href="/refund-policy">Refund policy</a>
            <a href="/privacy-policy">Privacy policy</a>
            <a href="/terms-of-service">Terms of service</a>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className={styles.rightColumn}>
          <OrderSummary
            cart={cart}
            subtotal={cartSubtotal}
            comboDiscount={comboDiscount}
            shippingCost={shippingCost}
            appliedDiscount={appliedDiscount}
            total={calculateTotal()}
            discountCode={discountCode}
            setDiscountCode={setDiscountCode}
            onApplyDiscount={handleApplyDiscount}
            onRemoveDiscount={handleRemoveDiscount}
            onPayNow={handlePayment}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}
