import Link from "next/link";
import styles from "./shipping.module.css";

export const metadata = {
  title: "Shipping Policy | The Design Factory",
  description: "Learn about our shipping policy, delivery times, and free shipping across India.",
};

export default function ShippingPolicyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.iconWrapper}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
          <h1 className={styles.title}>Shipping Policy</h1>
          <p className={styles.subtitle}>
            Fast, reliable delivery across India with free shipping on all orders
          </p>
        </header>

        <div className={styles.content}>
          {/* Free Shipping Banner */}
          <section className={styles.section}>
            <div className={styles.freeShippingBanner}>
              <div className={styles.bannerIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div className={styles.bannerContent}>
                <h2>Free Shipping Across India</h2>
                <p>We offer free shipping within India for all products. No minimum order value required!</p>
              </div>
            </div>
          </section>

          {/* Processing Time */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Order Processing Time</h2>
            <div className={styles.processingBox}>
              <div className={styles.processingIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className={styles.processingContent}>
                <h3>6-7 Days Processing</h3>
                <p>Since we have to curate the product as per your requirement, we need a little extra time to get the order ready for dispatch. We usually dispatch your order within <strong>6-7 days</strong> of placing the order.</p>
              </div>
            </div>
          </section>

          {/* Delivery Timeline */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Delivery Timeline</h2>
            <p className={styles.sectionIntro}>
              Once the product is dispatched from the warehouse, delivery times may vary based on your location.
            </p>
            
            <div className={styles.timelineGrid}>
              <div className={styles.timelineCard}>
                <div className={styles.timelineIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <h3>Metro Cities</h3>
                <div className={styles.timelineDays}>5-6 Days</div>
                <p>Delivery to major metro cities across India</p>
              </div>

              <div className={styles.timelineCard}>
                <div className={styles.timelineIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <h3>Other Destinations</h3>
                <div className={styles.timelineDays}>6-7 Days</div>
                <p>Delivery to other locations across India</p>
              </div>
            </div>

            <div className={styles.totalTimeBox}>
              <h4>Total Estimated Time</h4>
              <div className={styles.totalTimeContent}>
                <div className={styles.totalTimeItem}>
                  <span className={styles.totalTimeLabel}>Processing</span>
                  <span className={styles.totalTimeValue}>6-7 days</span>
                </div>
                <div className={styles.totalTimePlus}>+</div>
                <div className={styles.totalTimeItem}>
                  <span className={styles.totalTimeLabel}>Transit</span>
                  <span className={styles.totalTimeValue}>5-7 days</span>
                </div>
                <div className={styles.totalTimeEquals}>=</div>
                <div className={styles.totalTimeItem}>
                  <span className={styles.totalTimeLabel}>Total</span>
                  <span className={styles.totalTimeValue}>11-14 days</span>
                </div>
              </div>
            </div>
          </section>

          {/* Express Delivery */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Express Delivery</h2>
            <div className={styles.expressBox}>
              <div className={styles.expressHeader}>
                <div className={styles.expressIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <h3>Need It Faster?</h3>
              </div>
              <p>
                If you require an urgent delivery, express delivery charges will be applicable as per actuals.
              </p>
              <div className={styles.expressSteps}>
                <div className={styles.expressStep}>
                  <div className={styles.expressStepNumber}>1</div>
                  <p>Contact us at <a href="mailto:radhikavibgyor@gmail.com">radhikavibgyor@gmail.com</a></p>
                </div>
                <div className={styles.expressStep}>
                  <div className={styles.expressStepNumber}>2</div>
                  <p>Let us know you'd like to opt for express delivery</p>
                </div>
                <div className={styles.expressStep}>
                  <div className={styles.expressStepNumber}>3</div>
                  <p>We'll share the express delivery charges before you make payment</p>
                </div>
              </div>
              <div className={styles.expressNote}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <p>Please contact us <strong>before making the payment online</strong> to arrange express delivery.</p>
              </div>
            </div>
          </section>

          {/* Shipping Process */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Our Shipping Process</h2>
            <div className={styles.processSteps}>
              <div className={styles.processStep}>
                <div className={styles.processNumber}>1</div>
                <div className={styles.processContent}>
                  <h4>Order Placed</h4>
                  <p>You place your order and make payment online</p>
                </div>
              </div>
              <div className={styles.processArrow}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
              <div className={styles.processStep}>
                <div className={styles.processNumber}>2</div>
                <div className={styles.processContent}>
                  <h4>Personalization</h4>
                  <p>We curate your product as per your requirements (6-7 days)</p>
                </div>
              </div>
              <div className={styles.processArrow}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
              <div className={styles.processStep}>
                <div className={styles.processNumber}>3</div>
                <div className={styles.processContent}>
                  <h4>Dispatch</h4>
                  <p>Order is dispatched from our warehouse</p>
                </div>
              </div>
              <div className={styles.processArrow}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
              <div className={styles.processStep}>
                <div className={styles.processNumber}>4</div>
                <div className={styles.processContent}>
                  <h4>Delivery</h4>
                  <p>Product delivered to your doorstep (5-7 days)</p>
                </div>
              </div>
            </div>
          </section>

          {/* Important Information */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Important Information</h2>
            <div className={styles.infoCards}>
              <div className={styles.infoCard}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <h4>Personalized Products</h4>
                <p>Each product is carefully crafted according to your specifications</p>
              </div>
              <div className={styles.infoCard}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <h4>Secure Packaging</h4>
                <p>All orders are securely packaged to ensure safe delivery</p>
              </div>
              <div className={styles.infoCard}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <h4>Order Tracking</h4>
                <p>You'll receive tracking information once your order is dispatched</p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className={styles.section}>
            <div className={styles.contactSection}>
              <h2 className={styles.contactTitle}>Questions About Shipping?</h2>
              <p className={styles.contactText}>
                If you have any questions about our shipping policy or need to arrange express delivery, please contact us.
              </p>
              <div className={styles.contactBox}>
                <div className={styles.contactItem}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <div>
                    <p className={styles.contactLabel}>Email Us</p>
                    <a href="mailto:radhikavibgyor@gmail.com">radhikavibgyor@gmail.com</a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className={styles.footer}>
          <Link href="/" className={styles.backBtn}>
            ← Back to Home
          </Link>
          <div className={styles.footerLinks}>
            <Link href="/refund-policy" className={styles.footerLink}>
              Refund Policy
            </Link>
            <Link href="/terms" className={styles.footerLink}>
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
