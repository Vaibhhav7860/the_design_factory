import Link from "next/link";
import styles from "./privacy.module.css";

export const metadata = {
  title: "Privacy Policy | The Design Factory",
  description: "Learn how The Design Factory protects your privacy and handles your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.iconWrapper}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>
            Your privacy is important to us. We are committed to protecting your personal information.
          </p>
          <p className={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>

        <div className={styles.content}>
          {/* Main Privacy Statement */}
          <section className={styles.section}>
            <div className={styles.mainStatement}>
              <div className={styles.statementIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="M9 12l2 2 4-4"></path>
                </svg>
              </div>
              <div className={styles.statementContent}>
                <h2 className={styles.statementTitle}>Our Commitment to Your Privacy</h2>
                <p>
                  We respect your privacy; all the information collected by us will be kept strictly confidential and will not be sold, reused, rented, disclosed and loaned to any third parties.
                </p>
              </div>
            </div>
          </section>

          {/* Information Protection */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>How We Protect Your Information</h2>
            <div className={styles.protectionGrid}>
              <div className={styles.protectionCard}>
                <div className={styles.cardIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h3>Strictly Confidential</h3>
                <p>All information collected is kept strictly confidential and secure.</p>
              </div>

              <div className={styles.protectionCard}>
                <div className={styles.cardIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                  </svg>
                </div>
                <h3>Never Sold or Rented</h3>
                <p>We will never sell, reuse, rent, or loan your information to third parties.</p>
              </div>

              <div className={styles.protectionCard}>
                <div className={styles.cardIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
                <h3>Not Disclosed</h3>
                <p>Your personal information is never disclosed to unauthorized parties.</p>
              </div>

              <div className={styles.protectionCard}>
                <div className={styles.cardIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h3>Your Consent</h3>
                <p>Information is only used in ways you have explicitly consented to.</p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Your Rights</h2>
            <div className={styles.rightsBox}>
              <p>Any information you give us will be held with the utmost care and will not be used in ways you have not consented to.</p>
              <div className={styles.rightsList}>
                <div className={styles.rightItem}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>You have the right to know what information we collect</span>
                </div>
                <div className={styles.rightItem}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>You have the right to know how we use your information</span>
                </div>
                <div className={styles.rightItem}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>You have the right to request deletion of your information</span>
                </div>
                <div className={styles.rightItem}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>You have the right to opt-out of communications</span>
                </div>
              </div>
            </div>
          </section>

          {/* Information We Collect */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Information We May Collect</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <h4>Contact Information</h4>
                <p>Name, email address, phone number, and shipping address for order fulfillment.</p>
              </div>
              <div className={styles.infoCard}>
                <h4>Order Information</h4>
                <p>Details about your purchases, personalization preferences, and order history.</p>
              </div>
              <div className={styles.infoCard}>
                <h4>Payment Information</h4>
                <p>Securely processed through our payment gateway. We do not store credit card details.</p>
              </div>
              <div className={styles.infoCard}>
                <h4>Communication Data</h4>
                <p>Records of your communications with us for customer service purposes.</p>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>How We Use Your Information</h2>
            <div className={styles.useList}>
              <div className={styles.useItem}>
                <div className={styles.useNumber}>1</div>
                <div className={styles.useContent}>
                  <h4>Order Processing</h4>
                  <p>To process and fulfill your orders, including personalized products.</p>
                </div>
              </div>
              <div className={styles.useItem}>
                <div className={styles.useNumber}>2</div>
                <div className={styles.useContent}>
                  <h4>Customer Service</h4>
                  <p>To respond to your inquiries and provide support.</p>
                </div>
              </div>
              <div className={styles.useItem}>
                <div className={styles.useNumber}>3</div>
                <div className={styles.useContent}>
                  <h4>Order Updates</h4>
                  <p>To send you order confirmations, shipping updates, and delivery notifications.</p>
                </div>
              </div>
              <div className={styles.useItem}>
                <div className={styles.useNumber}>4</div>
                <div className={styles.useContent}>
                  <h4>Service Improvement</h4>
                  <p>To improve our products, services, and customer experience.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Security Measures */}
          <section className={styles.section}>
            <div className={styles.securityBox}>
              <div className={styles.securityIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 className={styles.securityTitle}>Security Measures</h3>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely and accessed only by authorized personnel.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className={styles.section}>
            <div className={styles.contactSection}>
              <h2 className={styles.contactTitle}>Questions About Privacy?</h2>
              <p className={styles.contactText}>
                If you have any questions about our privacy policy or how we handle your information, please feel free to contact us.
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

          {/* Policy Updates */}
          <section className={styles.section}>
            <div className={styles.updateBox}>
              <h3>Policy Updates</h3>
              <p>
                We may update this privacy policy from time to time to reflect changes in our practices or for legal reasons. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className={styles.footer}>
          <Link href="/" className={styles.backBtn}>
            ← Back to Home
          </Link>
          <div className={styles.footerLinks}>
            <Link href="/terms" className={styles.footerLink}>
              Terms & Conditions
            </Link>
            <Link href="/refund-policy" className={styles.footerLink}>
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
