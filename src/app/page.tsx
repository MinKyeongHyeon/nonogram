import Header from "@/components/Header";
import PuzzleGrid from "@/components/PuzzleGrid";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-100 font-sans text-gray-900 pb-20">
      <Header />
      
      <div className="max-w-4xl mx-auto mt-8 px-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800 drop-shadow-sm">
          Solve the Nonogram
        </h2>
        
        <PuzzleGrid />
      </div>
    </main>
  );
}
