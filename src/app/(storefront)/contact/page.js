"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        submitted: false,
        error: true,
        message: "Please fill in all required fields."
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({
        submitted: false,
        error: true,
        message: "Please enter a valid email address."
      });
      return;
    }

    // Simulate form submission (replace with actual API call)
    try {
      // Here you would typically send the data to your backend
      console.log("Form submitted:", formData);
      
      setFormStatus({
        submitted: true,
        error: false,
        message: "Thank you for contacting us! We'll get back to you within 24 hours."
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setFormStatus({ submitted: false, error: false, message: "" });
      }, 5000);
    } catch (error) {
      setFormStatus({
        submitted: false,
        error: true,
        message: "Something went wrong. Please try again or email us directly."
      });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1 className={styles.title}>Get in Touch</h1>
          <p className={styles.subtitle}>
            Have a question or need assistance? We'd love to hear from you!
          </p>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Contact Info Cards */}
          <div className={styles.section}>
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <div className={styles.cardIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <h3>Email Us</h3>
                <p>For inquiries, orders, or support</p>
                <a href="mailto:radhikavibgyor@gmail.com">radhikavibgyor@gmail.com</a>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.cardIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3>Response Time</h3>
                <p>We typically respond within</p>
                <a href="#">24 Hours</a>
              </div>

              <div className={styles.infoCard}>
                <div className={styles.cardIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
                <h3>Follow Us</h3>
                <p>Stay connected on social media</p>
                <div className={styles.socialLinks}>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                  <span>•</span>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Send Us a Message</h2>
            <p className={styles.sectionIntro}>
              Fill out the form below and we'll get back to you as soon as possible.
            </p>

            {formStatus.message && (
              <div className={`${styles.statusMessage} ${formStatus.error ? styles.error : styles.success}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {formStatus.error ? (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </>
                  ) : (
                    <>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </>
                  )}
                </svg>
                <span>{formStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">
                    Email Address <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    <option value="">Select a subject</option>
                    <option value="order">Order Inquiry</option>
                    <option value="custom">Custom Design Request</option>
                    <option value="bulk">Bulk Order</option>
                    <option value="shipping">Shipping & Delivery</option>
                    <option value="return">Return & Refund</option>
                    <option value="product">Product Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">
                  Your Message <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  rows="6"
                  required
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Send Message
              </button>
            </form>
          </div>

          {/* About Section */}
          <div className={styles.section}>
            <div className={styles.aboutBox}>
              <h3>About The Design Factory</h3>
              <p>
                The Design Factory provides complete solutions to adorn your lives in a unique way.
                We endeavor to enrich your gifting experience with international-quality standards.
                Every piece is curated with extreme attention to detail, ensuring that your personalized
                gifts leave a lasting impression.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Link href="/" className={styles.backBtn}>
            ← Back to Home
          </Link>
          <div className={styles.footerLinks}>
            <Link href="/faq" className={styles.footerLink}>FAQs</Link>
            <Link href="/shipping-policy" className={styles.footerLink}>Shipping</Link>
            <Link href="/refund-policy" className={styles.footerLink}>Returns</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
