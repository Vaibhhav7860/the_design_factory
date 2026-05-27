"use client";
import Image from "next/image";
import styles from "./page.module.css";

export default function BulkOrdersPage() {
  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroLabel}>FOR SCHOOLS, CORPORATES & EVENTS</p>
          <h1 className={styles.heroTitle}>Bulk Orders</h1>
          <p className={styles.heroSubtitle}>
            Personalized products crafted at scale — for schools, corporate gifting, 
            events, and celebrations. Premium quality, competitive pricing.
          </p>
          <a href="#enquiry" className={styles.heroCta}>Get a Quote</a>
        </div>
      </section>

      {/* Why Bulk */}
      <section className={styles.benefits}>
        <h2 className={styles.sectionTitle}>Why Order in Bulk?</h2>
        <div className={styles.benefitsGrid}>
          {[
            { icon: "💰", title: "Volume Discounts", desc: "Significant savings on orders of 50+ units with tiered pricing." },
            { icon: "🎨", title: "Full Customization", desc: "Every product personalized with names, logos, or custom designs." },
            { icon: "📦", title: "Hassle-Free Delivery", desc: "Individually packed and labeled for easy distribution." },
            { icon: "⏱️", title: "Quick Turnaround", desc: "Dedicated production line for bulk orders with priority processing." },
            { icon: "🤝", title: "Dedicated Manager", desc: "A single point of contact from order to delivery." },
            { icon: "✅", title: "Quality Assured", desc: "Same premium quality across every single unit, guaranteed." },
          ].map((item, i) => (
            <div key={i} className={styles.benefitCard}>
              <span className={styles.benefitIcon}>{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className={styles.process}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.processSteps}>
          {[
            { step: "01", title: "Share Your Requirements", desc: "Tell us what you need — products, quantity, personalization details, and timeline." },
            { step: "02", title: "Get a Custom Quote", desc: "We'll prepare a tailored quote with the best pricing for your order size." },
            { step: "03", title: "Approve & Confirm", desc: "Review a sample or digital proof, approve the design, and confirm your order." },
            { step: "04", title: "We Deliver", desc: "Sit back while we produce, pack individually, and ship directly to you." },
          ].map((item, i) => (
            <div key={i} className={styles.stepCard}>
              <span className={styles.stepNumber}>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className={styles.gallery}>
        <h2 className={styles.sectionTitle}>Our Bulk Order Showcase</h2>
        <p className={styles.gallerySubtitle}>Real projects, real impact — see what we've created for schools, corporates, and events.</p>
        
        <div className={styles.masonryGrid}>
          {/* Left Column - 3 small squares */}
          <div className={`${styles.gridItem} ${styles.leftSmall1}`}>
            <Image 
              src="/images/grid images/grid_1.jpeg"
              alt="Bulk Order Showcase 1"
              fill
              className={styles.gridImage}
            />
          </div>
          
          <div className={`${styles.gridItem} ${styles.leftSmall2}`}>
            <Image 
              src="/images/grid images/grid_2.jpeg"
              alt="Bulk Order Showcase 2"
              fill
              className={styles.gridImage}
            />
          </div>

          <div className={`${styles.gridItem} ${styles.leftSmall3}`}>
            <video 
              className={styles.gridVideo}
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/images/grid images/grid_3.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Middle - 1 tall rectangle */}
          <div className={`${styles.gridItem} ${styles.middleTall}`}>
            <Image 
              src="/images/grid images/grid_4.jpeg"
              alt="Bulk Order Showcase 4"
              fill
              className={styles.gridImage}
            />
          </div>

          {/* Right - 1 tall rectangle (video) */}
          <div className={`${styles.gridItem} ${styles.rightTall}`}>
            <video 
              className={styles.gridVideo}
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/images/grid images/grid_5.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Bottom row - 1 wide medium (spans 2 columns) */}
          <div className={`${styles.gridItem} ${styles.middleMedium1}`}>
            <Image 
              src="/images/grid images/grid_6.jpeg"
              alt="Bulk Order Showcase 6"
              fill
              className={styles.gridImage}
            />
          </div>

          {/* Bottom right - 1 small square (video) */}
          <div className={`${styles.gridItem} ${styles.rightSmall1}`}>
            <video 
              className={styles.gridVideo}
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/images/grid images/grid_7.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* Enquiry Form */}
      <section className={styles.enquiry} id="enquiry">
        <div className={styles.enquiryInner}>
          <div className={styles.enquiryInfo}>
            <h2 className={styles.sectionTitle}>Request a Quote</h2>
            <p>Fill in the form and our bulk orders team will get back to you within 24 hours with a custom quote.</p>
            <div className={styles.contactDetails}>
              <p>📧 bulk@thedesignfactory.in</p>
              <p>📞 +91 98765 43210</p>
              <p>⏰ Mon – Sat, 10 AM – 7 PM</p>
            </div>
          </div>
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" placeholder="Your name" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="you@example.com" />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone</label>
                <input type="tel" id="phone" placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="quantity">Approximate Quantity</label>
                <select id="quantity">
                  <option value="">Select range</option>
                  <option value="50-100">50 – 100 units</option>
                  <option value="100-250">100 – 250 units</option>
                  <option value="250-500">250 – 500 units</option>
                  <option value="500+">500+ units</option>
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="message">Tell Us About Your Requirements</label>
              <textarea id="message" rows="5" placeholder="Products needed, personalization details, timeline, etc."></textarea>
            </div>
            <button type="submit" className={styles.submitBtn}>Submit Enquiry</button>
          </form>
        </div>
      </section>
    </main>
  );
}
