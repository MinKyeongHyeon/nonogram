import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Nonogram Play",
  description: "Terms of Service for Nonogram Play",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <div className="max-w-3xl mx-auto px-6 py-16 pb-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary font-headline font-bold mb-10 hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          Back to Home
        </Link>

        <h1 className="text-4xl font-headline font-black tracking-tight mb-2">Terms of Service</h1>
        <p className="text-on-surface-variant mb-10">Last updated: April 13, 2026</p>

        <div className="space-y-8 text-on-surface-variant leading-relaxed">
          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using <span className="text-primary font-semibold">nonogramplay.com</span> (&ldquo;the
              Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, please do not use
              the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">2. Description of Service</h2>
            <p>
              Nonogram Play provides a browser-based nonogram puzzle game. We offer free puzzle packs as well as
              optional paid puzzle packs. Features include daily challenges, leaderboards, and user profiles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">3. User Accounts</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You must be at least 13 years old to create an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You may not create accounts using automated means or under false pretenses.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">4. Purchases</h2>
            <p className="mb-3">
              Some puzzle packs require payment. All purchases are processed securely via{" "}
              <span className="font-semibold text-on-surface">Toss Payments</span>. Prices are listed in Korean Won
              (KRW).
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>All sales are final unless required by applicable law.</li>
              <li>Purchased packs are tied to your account and are not transferable.</li>
              <li>We reserve the right to modify pricing at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">5. Advertising</h2>
            <p>
              The Service displays third-party advertisements served by Google AdSense. We are not responsible for the
              content of these advertisements. Ad display may be reduced or removed for users who purchase premium
              content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">6. Prohibited Conduct</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Use automated tools, bots, or scripts to interact with the Service</li>
              <li>Attempt to manipulate leaderboard rankings through illegitimate means</li>
              <li>Reverse engineer, decompile, or attempt to extract the source code of the Service</li>
              <li>Use the Service for any unlawful purpose</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">7. Intellectual Property</h2>
            <p>
              All content within the Service, including puzzle designs, graphics, and software, is owned by or licensed
              to Nonogram Play. You may not reproduce, distribute, or create derivative works without our written
              permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">8. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee
              uninterrupted, error-free operation. We reserve the right to modify or discontinue the Service at any time
              without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">9. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Nonogram Play shall not be liable for any indirect, incidental, or
              consequential damages arising from your use of or inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">10. Changes to Terms</h2>
            <p>
              We may update these Terms at any time. Changes will be posted on this page with an updated date. Continued
              use of the Service after changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">11. Contact</h2>
            <p>
              For questions about these Terms, contact us at:{" "}
              <a href="mailto:contact@nonogramplay.com" className="text-primary underline">
                contact@nonogramplay.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
