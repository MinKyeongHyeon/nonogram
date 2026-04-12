import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-headline font-black text-primary">Admin</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
        <Link
          href="/admin/editor"
          className="flex flex-col items-center gap-4 p-8 bg-surface-container-lowest rounded-2xl shadow-pudding border border-outline-variant/10 hover:-translate-y-1 transition-all"
        >
          <span
            className="material-symbols-outlined text-5xl text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            edit_square
          </span>
          <span className="text-xl font-headline font-bold">Puzzle Editor</span>
          <span className="text-sm text-on-surface-variant text-center">Create and edit nonogram puzzles</span>
        </Link>
        <Link
          href="/admin/packages"
          className="flex flex-col items-center gap-4 p-8 bg-surface-container-lowest rounded-2xl shadow-pudding border border-outline-variant/10 hover:-translate-y-1 transition-all"
        >
          <span
            className="material-symbols-outlined text-5xl text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            inventory_2
          </span>
          <span className="text-xl font-headline font-bold">Manage Packages</span>
          <span className="text-sm text-on-surface-variant text-center">Configure puzzle packs and pricing</span>
        </Link>
      </div>
      <Link href="/" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
        ← Back to Home
      </Link>
    </main>
  );
}
