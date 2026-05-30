"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import ContactForm from "@/components/checkout/ContactForm";
import DeliveryForm from "@/components/checkout/DeliveryForm";
import ShippingMethod from "@/components/checkout/ShippingMethod";
import BillingAddress from "@/components/checkout/BillingAddress";
import OrderSummary from "@/components/checkout/OrderSummary";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, cartSubtotal, comboDiscount } = useCart();
  
  // Form state
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
  });
  
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

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push("/cart");
    }
  }, [cart, router]);

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("checkoutData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setContactInfo(parsed.contactInfo || contactInfo);
      setDeliveryInfo(parsed.deliveryInfo || deliveryInfo);
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const dataToSave = {
      contactInfo,
      deliveryInfo,
    };
    localStorage.setItem("checkoutData", JSON.stringify(dataToSave));
  }, [contactInfo, deliveryInfo]);

  // Calculate shipping based on address
  useEffect(() => {
    if (deliveryInfo.pinCode && deliveryInfo.pinCode.length === 6) {
      // Simulate shipping calculation
      // In production, call your shipping API here
      setShippingCost(100); // Flat rate for now
    }
  }, [deliveryInfo.pinCode]);

  const handleApplyDiscount = () => {
    // Implement discount code validation
    // For now, just a placeholder
    if (discountCode.toUpperCase() === "WELCOME10") {
      setAppliedDiscount({
        code: discountCode,
        type: "percentage",
        value: 10,
        amount: Math.round(cartSubtotal * 0.1),
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
    if (appliedDiscount) {
      total -= appliedDiscount.amount;
    }
    return Math.max(0, total);
  };

  const handlePayment = async () => {
    // Validate form
    if (!contactInfo.email || !contactInfo.phone || !deliveryInfo.firstName || !deliveryInfo.phone) {
      alert("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);

    // For now, just show an alert since backend isn't ready
    setTimeout(() => {
      alert("Payment integration will be completed in the next phase. For now, you can see the checkout UI!");
      setIsProcessing(false);
    }, 1000);

    /* 
    // This will be enabled once backend is ready
    try {
      const orderData = {
        contact: contactInfo,
        delivery: deliveryInfo,
        billing: billingAddressSame ? deliveryInfo : billingInfo,
        cart,
        subtotal: cartSubtotal,
        comboDiscount,
        appliedDiscount,
        shippingCost,
        total: calculateTotal(),
      };

      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const { orderId, amount, currency } = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "The Design Factory",
        description: "Order Payment",
        order_id: orderId,
        handler: async function (response) {
          const verifyResponse = await fetch("/api/checkout/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            localStorage.removeItem("checkoutData");
            router.push(`/checkout/success?orderId=${verifyData.orderId}`);
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: `${deliveryInfo.firstName} ${deliveryInfo.lastName}`,
          email: contactInfo.email,
          contact: deliveryInfo.phone,
        },
        theme: {
          color: "#C4A574",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
    */
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className={styles.checkoutPage}>
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
            hasAddress={deliveryInfo.pinCode.length === 6}
          />

          <BillingAddress
            billingAddressSame={billingAddressSame}
            setBillingAddressSame={setBillingAddressSame}
            billingInfo={billingInfo}
            setBillingInfo={setBillingInfo}
          />

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
