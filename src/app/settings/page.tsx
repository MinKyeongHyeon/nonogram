"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import Link from "next/link";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
        on ? "bg-primary" : "bg-outline-variant/40"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { sound, haptics, darkMode, toggleSound, toggleHaptics, toggleDarkMode } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-surface">
        <div className="h-16 bg-surface" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface text-on-surface font-body pb-32 md:pb-12">
      {/* Top Bar */}
      <header className="w-full bg-surface/70 backdrop-blur-xl shadow-pudding sticky top-0 z-50">
        <div className="flex items-center gap-3 px-4 md:px-8 h-16 max-w-3xl mx-auto">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </Link>
          <h1 className="text-xl font-headline font-bold">Settings</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Preferences */}
        <section className="space-y-1">
          <h2 className="text-sm font-headline font-bold text-on-surface-variant uppercase tracking-widest px-1 mb-3">
            Preferences
          </h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-pudding divide-y divide-outline-variant/20">
            <SettingRow
              icon="volume_up"
              label="Sound Effects"
              description="Play sounds on actions"
              trailing={<Toggle on={sound} onToggle={toggleSound} />}
            />
            <SettingRow
              icon="vibration"
              label="Haptics"
              description="Vibration feedback on mobile"
              trailing={<Toggle on={haptics} onToggle={toggleHaptics} />}
            />
            <SettingRow
              icon="dark_mode"
              label="Dark Mode"
              description="Switch to dark theme"
              trailing={<Toggle on={darkMode} onToggle={toggleDarkMode} />}
            />
          </div>
        </section>

        {/* Account */}
        <section className="space-y-1">
          <h2 className="text-sm font-headline font-bold text-on-surface-variant uppercase tracking-widest px-1 mb-3">
            Account
          </h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-pudding divide-y divide-outline-variant/20">
            <Link href="/profile">
              <SettingRow icon="person" label="Profile Details" description="View and edit your profile" chevron />
            </Link>
            <SettingRow
              icon="logout"
              label="Log Out"
              description="Sign out of your account"
              trailing={
                <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              }
            />
          </div>
        </section>

        {/* Support */}
        <section className="space-y-1">
          <h2 className="text-sm font-headline font-bold text-on-surface-variant uppercase tracking-widest px-1 mb-3">
            Support
          </h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-pudding divide-y divide-outline-variant/20">
            <SettingRow
              icon="mail"
              label="Contact Us"
              description="Get help or send feedback"
              trailing={
                <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              }
            />
            <SettingRow
              icon="shield"
              label="Privacy Policy"
              description="How we handle your data"
              trailing={
                <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              }
            />
          </div>
        </section>

        {/* App Info */}
        <p className="text-center text-xs text-on-surface-variant/60 pt-4">Pudding Puzzles v0.1.0</p>
      </div>
    </main>
  );
}

function SettingRow({
  icon,
  label,
  description,
  trailing,
  chevron,
}: {
  icon: string;
  label: string;
  description: string;
  trailing?: React.ReactNode;
  chevron?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-on-surface-variant text-xl">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-headline font-semibold text-on-surface">{label}</p>
        <p className="text-xs text-on-surface-variant">{description}</p>
      </div>
      {trailing}
      {chevron && <span className="material-symbols-outlined text-on-surface-variant text-xl">chevron_right</span>}
    </div>
  );
}
