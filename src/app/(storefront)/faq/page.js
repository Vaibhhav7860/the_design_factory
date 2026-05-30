"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./faq.module.css";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqCategories = [
    {
      category: "Orders & Customization",
      questions: [
        {
          question: "How do I place an order?",
          answer: "Simply browse our collection, select your desired product, customize it with your preferred design, text, or theme, add it to cart, and proceed to checkout. You can pay securely using various payment methods."
        },
        {
          question: "Can I customize any product?",
          answer: "Yes! All our products are fully customizable. You can add names, choose themes, select colors, and personalize designs according to your preferences. Our design team ensures each product is crafted specially for you."
        },
        {
          question: "How long does it take to process my order?",
          answer: "Since we create personalized products specially for you, we need 6-7 days to prepare your order. This ensures the highest quality and attention to detail for your customized items."
        },
        {
          question: "Can I modify my order after placing it?",
          answer: "Please contact us immediately at radhikavibgyor@gmail.com if you need to make changes. We'll do our best to accommodate modifications if the order hasn't entered production yet."
        },
        {
          question: "Do you offer bulk orders for schools or events?",
          answer: "Yes! We specialize in bulk orders for schools, birthday parties, events, and corporate gifting. Contact us at radhikavibgyor@gmail.com with your requirements, and we'll provide you with a customized quote."
        }
      ]
    },
    {
      category: "Shipping & Delivery",
      questions: [
        {
          question: "Do you offer free shipping?",
          answer: "Yes! We offer FREE shipping across India for all products. There are no minimum order requirements."
        },
        {
          question: "How long does delivery take?",
          answer: "After your order is dispatched (6-7 days processing time), delivery typically takes 5-6 days for metro cities and 6-7 working days for other locations. Total time from order to delivery is approximately 11-14 days."
        },
        {
          question: "Do you ship internationally?",
          answer: "Currently, we only ship within India. We're working on expanding our shipping to international locations soon."
        },
        {
          question: "Can I track my order?",
          answer: "Yes! Once your order is dispatched, you'll receive a tracking number via email. You can use this to track your shipment's progress."
        },
        {
          question: "What if I need express delivery?",
          answer: "Express delivery is available at additional charges (as per actuals). Please contact us at radhikavibgyor@gmail.com before making payment to arrange express shipping."
        }
      ]
    },
    {
      category: "Returns & Refunds",
      questions: [
        {
          question: "Can I return or exchange personalized products?",
          answer: "Since our products are specially manufactured for you with custom designs, we don't offer returns or exchanges on personalized items. However, if your product arrives damaged or has a manufacturing defect, we'll replace it or provide a full refund."
        },
        {
          question: "What should I do if my product arrives damaged?",
          answer: "Please email us at radhikavibgyor@gmail.com with clear photos of the damaged product within 48 hours of receiving it. We'll arrange for a replacement or refund after inspection."
        },
        {
          question: "How do I return a defective product?",
          answer: "Keep the product unused and in its original packaging. Ship it back to us and share the tracking details. Once we receive and inspect the product, we'll process your replacement or refund."
        }
      ]
    },
    {
      category: "Products & Quality",
      questions: [
        {
          question: "What materials do you use?",
          answer: "We use high-quality, child-safe materials for all our products. Our labels are waterproof, durable, and designed to withstand daily wear and tear. All products meet safety standards."
        },
        {
          question: "Are your labels waterproof?",
          answer: "Yes! Our labels are waterproof and dishwasher-safe. They're designed to last through multiple washes and daily use without fading or peeling."
        },
        {
          question: "Can I see a preview before production?",
          answer: "Our product customization interface shows you a preview of your design. If you need additional confirmation, you can contact us at radhikavibgyor@gmail.com before finalizing your order."
        },
        {
          question: "Do you offer gift wrapping?",
          answer: "Yes! We offer beautiful gift wrapping options for special occasions. You can select this option during checkout or contact us for custom gift packaging."
        }
      ]
    },
    {
      category: "Payment & Security",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major payment methods including credit/debit cards, UPI, net banking, and digital wallets. All payments are processed securely through our payment gateway."
        },
        {
          question: "Is my payment information secure?",
          answer: "Absolutely! We use industry-standard encryption and secure payment gateways. We never store your payment information on our servers. Your privacy and security are our top priorities."
        },
        {
          question: "Will I receive an invoice?",
          answer: "Yes! You'll receive a detailed invoice via email immediately after your order is confirmed. This invoice includes all order details and payment information."
        }
      ]
    },
    {
      category: "Contact & Support",
      questions: [
        {
          question: "How can I contact customer support?",
          answer: "You can reach us at radhikavibgyor@gmail.com for any queries, concerns, or assistance. We typically respond within 24 hours."
        },
        {
          question: "Do you have a physical store?",
          answer: "We're primarily an online store, allowing us to offer competitive prices and serve customers across India. All orders are processed from our workshop."
        },
        {
          question: "Can I request a custom design not shown on your website?",
          answer: "Absolutely! We love creating unique designs. Contact us at radhikavibgyor@gmail.com with your ideas, and our design team will work with you to bring your vision to life."
        }
      ]
    }
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h1 className={styles.title}>Frequently Asked Questions</h1>
          <p className={styles.subtitle}>
            Find answers to common questions about our products, orders, shipping, and more.
          </p>
        </div>

        {/* FAQ Content */}
        <div className={styles.content}>
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className={styles.section}>
            <h2 className={styles.categoryTitle}>{category.category}</h2>
            
            <div className={styles.faqList}>
              {category.questions.map((faq, questionIndex) => {
                const globalIndex = `${categoryIndex}-${questionIndex}`;
                const isOpen = openIndex === globalIndex;
                
                return (
                  <div
                    key={questionIndex}
                    className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}
                  >
                    <button
                      className={styles.faqQuestion}
                      onClick={() => toggleFAQ(globalIndex)}
                      aria-expanded={isOpen}
                    >
                      <span className={styles.questionText}>{faq.question}</span>
                      <span className={styles.icon}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {isOpen ? (
                            <line x1="5" y1="12" x2="19" y2="12" />
                          ) : (
                            <>
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </>
                          )}
                        </svg>
                      </span>
                    </button>
                    
                    <div className={styles.faqAnswer}>
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        </div>

        {/* Contact Section */}
        <div className={styles.contactSection}>
          <h3 className={styles.contactTitle}>Still Have Questions?</h3>
          <p className={styles.contactText}>
            Can't find what you're looking for? We're here to help! Reach out to our friendly customer support team.
          </p>
          <div className={styles.contactBox}>
            <div className={styles.contactItem}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <div>
                <div className={styles.contactLabel}>Email Us</div>
                <a href="mailto:radhikavibgyor@gmail.com">radhikavibgyor@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Link href="/" className={styles.backBtn}>
            ← Back to Home
          </Link>
          <div className={styles.footerLinks}>
            <Link href="/contact" className={styles.footerLink}>Contact Us</Link>
            <Link href="/shipping-policy" className={styles.footerLink}>Shipping</Link>
            <Link href="/refund-policy" className={styles.footerLink}>Returns</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
