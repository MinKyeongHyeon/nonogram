import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Nonogram Play",
  description: "Privacy Policy for Nonogram Play",
};

export default function PrivacyPage() {
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

        <h1 className="text-4xl font-headline font-black tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-on-surface-variant mb-10">Last updated: April 13, 2026</p>

        <div className="space-y-8 text-on-surface-variant leading-relaxed">
          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">1. Overview</h2>
            <p>
              Nonogram Play (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the website{" "}
              <span className="text-primary font-semibold">nonogramplay.com</span>. This Privacy Policy explains how we
              collect, use, and protect information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">2. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <span className="font-semibold text-on-surface">Account Information</span> — email address and profile
                data when you sign in via OAuth (Kakao, Naver, or Google).
              </li>
              <li>
                <span className="font-semibold text-on-surface">Gameplay Data</span> — puzzle progress, completion
                times, star ratings, and streaks, stored to sync your experience across devices.
              </li>
              <li>
                <span className="font-semibold text-on-surface">Usage Data</span> — pages visited, device type, browser
                type, and approximate location (country level), collected automatically via standard web logs.
              </li>
              <li>
                <span className="font-semibold text-on-surface">Cookies</span> — session cookies for authentication and
                preference cookies for dark mode and sound settings.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">3. Third-Party Advertising</h2>
            <p className="mb-3">
              We use <span className="font-semibold text-on-surface">Google AdSense</span> to display advertisements.
              Google AdSense uses cookies to serve ads based on your prior visits to this and other websites.
            </p>
            <p className="mb-3">
              Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to
              our site and/or other sites on the Internet.
            </p>
            <p>
              You may opt out of personalized advertising by visiting{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Google Ads Settings
              </a>
              . You can also opt out via{" "}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                aboutads.info
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">4. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide and maintain the game service</li>
              <li>To sync your puzzle progress and achievements</li>
              <li>To display personalized or contextual advertisements</li>
              <li>To analyze usage patterns and improve the service</li>
              <li>To maintain leaderboard rankings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">5. Data Storage</h2>
            <p>
              Your data is stored securely using <span className="font-semibold text-on-surface">Supabase</span>{" "}
              (PostgreSQL). Authentication is handled via Supabase Auth with OAuth providers. We do not sell your
              personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">6. Data Retention</h2>
            <p>
              We retain your account and gameplay data for as long as your account is active. You may request deletion
              of your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">7. Children&apos;s Privacy</h2>
            <p>
              Our service is not directed at children under 13. We do not knowingly collect personal information from
              children under 13. If you believe we have inadvertently collected such information, please contact us
              immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated
              date. Continued use of the service after changes constitutes acceptance of the new policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-3">9. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:{" "}
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
