import Link from "next/link";
import styles from "./refund.module.css";

export const metadata = {
  title: "Return & Refund Policy | The Design Factory",
  description: "Learn about our return and refund policy for personalized products at The Design Factory.",
};

export default function RefundPolicyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Return & Refund Policy</h1>
          <p className={styles.subtitle}>
            Your satisfaction is our priority. Please read our policy carefully.
          </p>
        </header>

        <div className={styles.content}>
          {/* Introduction */}
          <section className={styles.section}>
            <div className={styles.introBox}>
              <p>
                We at The Design Factory are working hard to ensure the product quality and also that the product reaches you in perfect condition.
              </p>
            </div>
          </section>

          {/* No Exchange/Refund on Personalized Products */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Personalized Products</h2>
            <div className={styles.highlightBox}>
              <svg className={styles.icon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>
                <strong>We don't have an exchange or refund policy on personalized products</strong> as they are specially manufactured for you.
              </p>
            </div>
          </section>

          {/* Damaged or Defective Products */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Damaged or Defective Products</h2>
            <p>
              However, if the product arrives to you in damaged condition or has a manufacturing defect, then the same can be replaced or refunded.
            </p>
            
            <div className={styles.processBox}>
              <h3 className={styles.processTitle}>How to Report an Issue</h3>
              <div className={styles.steps}>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepContent}>
                    <h4>Contact Us Within 48 Hours</h4>
                    <p>Email us at <a href="mailto:radhikavibgyor@gmail.com">radhikavibgyor@gmail.com</a> within 48 hours of receiving your order.</p>
                  </div>
                </div>

                <div className={styles.step}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepContent}>
                    <h4>Include a Photo</h4>
                    <p>Attach a clear photo of the damaged or defective product in your email.</p>
                  </div>
                </div>

                <div className={styles.step}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepContent}>
                    <h4>Keep Product Unused</h4>
                    <p>Please try to ensure that the product is unused and also in the same packing materials.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Return Process */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Return Process</h2>
            <div className={styles.infoBox}>
              <p>
                We at present do not have a reverse pickup arrangement, so the wrong product or damaged product will have to be shipped by you.
              </p>
            </div>

            <div className={styles.returnSteps}>
              <div className={styles.returnStep}>
                <div className={styles.returnIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <h4>Ship the Product</h4>
                  <p>Ship the damaged or defective product back to us at your own cost.</p>
                </div>
              </div>

              <div className={styles.returnStep}>
                <div className={styles.returnIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h4>Share Shipment Details</h4>
                  <p>Email us the tracking number and shipment details once dispatched.</p>
                </div>
              </div>

              <div className={styles.returnStep}>
                <div className={styles.returnIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div>
                  <h4>Inspection & Resolution</h4>
                  <p>Once we receive the shipment in our workshop, we will do a quick inspection to ensure that it's unused and not damaged in transit. We will then either replace the product or provide you a refund.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Important Notes */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Important Notes</h2>
            <div className={styles.notesList}>
              <div className={styles.note}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <p>Report issues within <strong>48 hours</strong> of receiving your order</p>
              </div>
              <div className={styles.note}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <p>Products must be <strong>unused</strong> and in original packaging</p>
              </div>
              <div className={styles.note}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <p>Include <strong>clear photos</strong> of the damaged or defective product</p>
              </div>
              <div className={styles.note}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <p>Customer is responsible for <strong>return shipping costs</strong></p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className={styles.section}>
            <div className={styles.contactBox}>
              <h3 className={styles.contactTitle}>Need Help?</h3>
              <p>If you have any questions about our return and refund policy, please don't hesitate to contact us.</p>
              <div className={styles.contactDetails}>
                <div className={styles.contactItem}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <a href="mailto:radhikavibgyor@gmail.com">radhikavibgyor@gmail.com</a>
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
          <Link href="/terms" className={styles.termsLink}>
            View Terms & Conditions →
          </Link>
        </div>
      </div>
    </main>
  );
}
