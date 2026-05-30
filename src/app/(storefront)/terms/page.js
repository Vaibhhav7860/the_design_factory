import Link from "next/link";
import styles from "./terms.module.css";

export const metadata = {
  title: "Terms and Conditions | The Design Factory",
  description: "Terms and Conditions for The Design Factory - Read our terms of service, policies, and legal information.",
};

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Terms and Conditions</h1>
          <p className={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </header>

        <div className={styles.content}>
          {/* Overview */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Overview</h2>
            <p>Welcome to thedesignfactoryshop! The terms "we", "us" and "our" refer to thedesignfactoryshop. thedesignfactoryshop operates this store and website, including all related information, content, features, tools, products and services in order to provide you, the customer, with a curated shopping experience (the "Services"). thedesignfactoryshop is powered by Shopify, which enables us to provide the Services to you.</p>
            <p>The below terms and conditions, together with any policies referenced herein (these "Terms of Service" or "Terms") describe your rights and responsibilities when you use the Services. Please read these Terms of Service carefully, as they include important information about your legal rights and cover areas such as warranty disclaimers and limitations of liability.</p>
            <p>By visiting, interacting with or using our Services, you agree to be bound by these Terms of Service and our <Link href="/privacy-policy">Privacy Policy</Link>. If you do not agree to these Terms of Service or Privacy Policy, you should not use or access our Services.</p>
          </section>

          {/* Section 1 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 1 - Access and Account</h2>
            <p>By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, and you have given us your consent to allow any of your minor dependents to use the Services on devices you own, purchase or manage.</p>
            <p>To use the Services, including accessing or browsing our online stores or purchasing any of the products or services we offer, you may be asked to provide certain information, such as your email address, billing, payment, and shipping information. You represent and warrant that all the information you provide in our stores is correct, current and complete and that you have all rights necessary to provide this information.</p>
            <p>You are solely responsible for maintaining the security of your account credentials and for all of your account activity. You may not transfer, sell, assign, or license your account to any other person.</p>
          </section>

          {/* Section 2 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 2 - Our Products</h2>
            <p>We have made every effort to provide an accurate representation of our products and services in our online stores. However, please note that colors or product appearance may differ from how they may appear on your screen due to the type of device you use to access the store and your device settings and configuration.</p>
            <p>We do not warrant that the appearance or quality of any products or services purchased by you will meet your expectations or be the same as depicted or rendered in our online stores. All descriptions of products are subject to change at any time without notice at our sole discretion.</p>
            <p>We reserve the right to discontinue any product at any time and may limit the quantities of any products that we offer to any person, geographic region or jurisdiction, on a case-by-case basis.</p>
          </section>

          {/* Section 3 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 3 - Orders</h2>
            <p>When you place an order, you are making an offer to purchase. thedesignfactoryshop reserves the right to accept or decline your order for any reason at its discretion. Your order is not accepted until thedesignfactoryshop confirms acceptance. We must receive and process your payment before your order is accepted.</p>
            <p>Please review your order carefully before submitting, as thedesignfactoryshop may be unable to accommodate cancellation requests after an order is accepted. In the event that we do not accept, make a change to, or cancel an order, we will attempt to notify you by contacting the e‑mail, billing address, and/or phone number provided at the time the order was made.</p>
            <p>Your purchases are subject to return or exchange solely in accordance with our <Link href="/refund-policy">Refund Policy</Link>. You represent and warrant that your purchases are for your own personal or household use and not for commercial resale or export.</p>
          </section>

          {/* Section 4 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 4 - Prices and Billing</h2>
            <p>Prices, discounts and promotions are subject to change without notice. The price charged for a product or service will be the price in effect at the time the order is placed and will be set out in your order confirmation email. Unless otherwise expressly stated, posted prices do not include taxes, shipping, handling, customs or import charges.</p>
            <p>Prices posted in our online stores may be different from prices offered in physical stores or in online or other stores operated by third parties. We may offer, from time to time, promotions on the Services that may affect pricing and that are governed by terms and conditions separate from these Terms. If there is a conflict between the terms for a promotion and these Terms, the promotion terms will govern.</p>
            <p>You agree to provide current, complete and accurate purchase, payment and account information for all purchases made at our stores. You represent and warrant that (i) the credit card information you provide is true, correct, and complete, (ii) you are duly authorized to use such credit card for the purchase, (iii) charges incurred by you will be honored by your credit card company, and (iv) you will pay charges incurred by you at the posted prices, including shipping and handling charges and all applicable taxes, if any.</p>
          </section>

          {/* Section 5 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 5 - Shipping and Delivery</h2>
            <p>We are not liable for shipping and delivery delays. All delivery times are estimates only and are not guaranteed. We are not responsible for delays caused by shipping carriers, customs processing, or events outside our control. Once we transfer products to the carrier, title and risk of loss passes to you.</p>
          </section>

          {/* Section 6 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 6 - Intellectual Property</h2>
            <p>Our Services, including but not limited to all trademarks, brands, text, displays, images, graphics, product reviews, video, and audio, and the design, selection, and arrangement thereof, are owned by thedesignfactoryshop, its affiliates or licensors and are protected by U.S. and foreign patent, copyright and other intellectual property laws.</p>
            <p>These Terms permit you to use the Services for your personal, non-commercial use only. You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on the Services without our prior written consent.</p>
            <p>thedesignfactoryshop's names, logos, product and service names, designs, and slogans are trademarks of thedesignfactoryshop or its affiliates or licensors. You must not use such trademarks without the prior written permission of thedesignfactoryshop.</p>
          </section>

          {/* Section 7 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 7 - Optional Tools</h2>
            <p>You may be provided with access to customer tools offered by third parties as part of the Services, which we neither monitor nor have any control nor input. You acknowledge and agree that we provide access to such tools "as is" and "as available" without any warranties, representations or conditions of any kind and without any endorsement.</p>
            <p>We shall have no liability whatsoever arising from or relating to your use of optional third-party tools. Any use by you of the optional tools offered through the site is entirely at your own risk and discretion.</p>
          </section>

          {/* Section 8 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 8 - Third-Party Links</h2>
            <p>The Services may contain materials and hyperlinks to websites provided or operated by third parties (including any embedded third party functionality). We are not responsible for examining or evaluating the content or accuracy of any third-party materials or websites you choose to access.</p>
            <p>If you decide to leave the Services to access these materials or third party sites, you do so at your own risk. We are not liable for any harm or damages related to your access of any third-party websites, or your purchase or use of any products, services, resources, or content on any third-party websites.</p>
          </section>

          {/* Section 9 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 9 - Relationship with Shopify</h2>
            <p>thedesignfactoryshop is powered by Shopify, which enables us to provide the Services to you. However, any sales and purchases you make in our Store are made directly with thedesignfactoryshop.</p>
            <p>By using the Services, you acknowledge and agree that Shopify is not responsible for any aspect of any sales between you and thedesignfactoryshop, including any injury, damage, or loss resulting from purchased products and services. You hereby expressly release Shopify and its affiliates from all claims, damages, and liabilities arising from or related to your purchases and transactions with thedesignfactoryshop.</p>
          </section>

          {/* Section 10 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 10 - Privacy Policy</h2>
            <p>All personal information we collect through the Services is subject to our <Link href="/privacy-policy">Privacy Policy</Link>, and certain personal information may be subject to Shopify's Privacy Policy. By using the Services, you acknowledge that you have read these privacy policies.</p>
            <p>Because the Services are hosted by Shopify, Shopify collects and processes personal information about your access to and use of the Services in order to provide and improve the Services for you. Information you submit to the Services will be transmitted to and shared with Shopify as well as third parties that may be located in other countries than where you reside.</p>
          </section>

          {/* Section 11 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 11 - Feedback</h2>
            <p>If you submit, upload, post, email, or otherwise transmit any ideas, suggestions, feedback, reviews, proposals, plans, or other content (collectively, "Feedback"), you grant us a perpetual, worldwide, sublicensable, royalty-free license to use, reproduce, modify, publish, distribute and display such Feedback in any medium for any purpose, including for commercial use.</p>
            <p>You represent and warrant that: (i) you own or have all necessary rights to all Feedback; (ii) you have disclosed any compensation or incentives received in connection with your submission of Feedback; and (iii) your Feedback will comply with these Terms.</p>
          </section>

          {/* Section 12 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 12 - Errors, Inaccuracies and Omissions</h2>
            <p>Occasionally there may be information on or in the Services that contain typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times and availability.</p>
            <p>We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders if any information is inaccurate at any time without prior notice (including after you have submitted your order).</p>
          </section>

          {/* Section 13 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 13 - Prohibited Uses</h2>
            <p>You may access and use the Services for lawful purposes only. You may not access or use the Services, directly or indirectly:</p>
            <ul className={styles.list}>
              <li>For any unlawful or malicious purpose</li>
              <li>To violate any international, federal, provincial or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or harm any person</li>
              <li>To transmit false or misleading information</li>
              <li>To impersonate or attempt to impersonate any other person or entity</li>
              <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Services</li>
            </ul>
            <p>We reserve the right to suspend, disable, or terminate your account at any time, without notice, if we determine that you have violated any part of these Terms.</p>
          </section>

          {/* Section 14 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 14 - Agents</h2>
            <p>This section applies if you use, allow, enable, or cause the deployment of an Agent to access, use, or interact with any Services. "Agent" means any software or service that takes autonomous or semi-autonomous action on behalf of, or at the instruction of, any person or entity.</p>
            <p>No Agent may access, use, or interact with Services unless, at all times, it identifies itself and operates in strict accordance with our requirements. Agents must not conceal or obfuscate that any access, use, or interactions are from an Agent, such as by mimicking human behavior or completing CAPTCHAs.</p>
          </section>

          {/* Section 15 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 15 - Termination</h2>
            <p>We may terminate this agreement or your access to the Services (or any part thereof) in our sole discretion at any time without notice, and you will remain liable for all amounts due up to and including the date of termination.</p>
          </section>

          {/* Section 16 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 16 - Disclaimer of Warranties</h2>
            <p className={styles.disclaimer}>EXCEPT AS EXPRESSLY STATED BY thedesignfactoryshop, THE SERVICES AND ALL PRODUCTS OFFERED THROUGH THE SERVICES ARE PROVIDED 'AS IS' AND 'AS AVAILABLE' FOR YOUR USE, WITHOUT ANY REPRESENTATION, WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ALL IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, MERCHANTABLE QUALITY, FITNESS FOR A PARTICULAR PURPOSE, DURABILITY, TITLE, AND NON-INFRINGEMENT.</p>
            <p className={styles.disclaimer}>WE DO NOT GUARANTEE, REPRESENT OR WARRANT THAT YOUR USE OF THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE OR ERROR-FREE. SOME JURISDICTIONS LIMIT OR DO NOT ALLOW THE DISCLAIMER OF IMPLIED OR OTHER WARRANTIES SO THE ABOVE DISCLAIMER MAY NOT APPLY TO YOU.</p>
          </section>

          {/* Section 17 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 17 - Limitation of Liability</h2>
            <p className={styles.disclaimer}>TO THE FULLEST EXTENT PROVIDED BY LAW, IN NO CASE SHALL thedesignfactoryshop, OUR PARTNERS, DIRECTORS, OFFICERS, EMPLOYEES, AFFILIATES, AGENTS, CONTRACTORS, SERVICE PROVIDERS OR LICENSORS, OR THOSE OF SHOPIFY AND ITS AFFILIATES, BE LIABLE FOR ANY INJURY, LOSS, CLAIM, OR ANY DIRECT, INDIRECT, INCIDENTAL, PUNITIVE, SPECIAL, OR CONSEQUENTIAL DAMAGES OF ANY KIND, INCLUDING, WITHOUT LIMITATION, LOST PROFITS, LOST REVENUE, LOST SAVINGS, LOSS OF DATA, REPLACEMENT COSTS, OR ANY SIMILAR DAMAGES.</p>
          </section>

          {/* Section 18 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 18 - Indemnification</h2>
            <p>You agree to indemnify, defend and hold harmless thedesignfactoryshop, Shopify, and our affiliates, partners, officers, directors, employees, agents, contractors, licensors, and service providers from any losses, damages, liabilities or claims, including reasonable attorneys' fees, payable to any third party due to or arising out of (1) your breach of these Terms of Service, (2) your violation of any law or the rights of a third party, or (3) your access to and use of the Services.</p>
          </section>

          {/* Remaining Sections */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 19 - Severability</h2>
            <p>In the event that any provision of these Terms of Service is determined to be unlawful, void or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms of Service.</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 20 - Waiver; Entire Agreement</h2>
            <p>The failure of us to exercise or enforce any right or provision of these Terms of Service shall not constitute a waiver of such right or provision. These Terms of Service and any policies or operating rules posted by us on this site or in respect to the Service constitutes the entire agreement and understanding between you and us.</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 21 - Assignment</h2>
            <p>You may not delegate, transfer or assign this Agreement or any of your rights or obligations under these Terms without our prior written consent. We may transfer, assign, or delegate these Terms and our rights and obligations without consent or notice to you.</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 22 - Governing Law</h2>
            <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the federal and state or territorial courts in the jurisdiction where thedesignfactoryshop is headquartered.</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 23 - Changes to Terms of Service</h2>
            <p>You can review the most current version of the Terms of Service at any time on this page. We reserve the right, in our sole discretion, to update, change, or replace any part of these Terms of Service by posting updates and changes to our website.</p>
            <p>It is your responsibility to check our website periodically for changes. Your continued use of or access to the Services following the posting of any changes to these Terms of Service constitutes acceptance of those changes.</p>
          </section>

          {/* Contact Information */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Section 24 - Contact Information</h2>
            <p>Questions about the Terms of Service should be sent to us at:</p>
            <div className={styles.contactInfo}>
              <p><strong>The Design Factory</strong></p>
              <p>Email: <a href="mailto:radhikavibgyor@gmail.com">radhikavibgyor@gmail.com</a></p>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className={styles.footer}>
          <Link href="/" className={styles.backBtn}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
