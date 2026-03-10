import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f0e8] font-sans selection:bg-amber-500/30">
      <main className="max-w-5xl mx-auto px-6 py-24 flex flex-col items-center">
        {/* HERO SECTION */}
        <section className="text-center mt-12 mb-24 max-w-3xl">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">Uncanny</h1>
          <p className="text-xl sm:text-2xl text-zinc-400 mb-10 leading-relaxed">
            An AI detection tool built for fiction writers. Find out where the machine crept into your prose.
          </p>
          <Button href="/analyse" className="text-lg px-8 py-4">
            Analyse My Writing
          </Button>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="grid md:grid-cols-3 gap-8 w-full mb-32">
          <div className="bg-[#141414] p-8 rounded-xl border border-zinc-800 flex flex-col items-center text-center transition-transform hover:scale-105">
            <svg className="w-10 h-10 text-amber-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h3 className="text-lg font-medium">Paste or upload your prose</h3>
          </div>
          <div className="bg-[#141414] p-8 rounded-xl border border-zinc-800 flex flex-col items-center text-center transition-transform hover:scale-105">
            <svg className="w-10 h-10 text-amber-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            <h3 className="text-lg font-medium">We analyse rhythm, voice & predictability</h3>
          </div>
          <div className="bg-[#141414] p-8 rounded-xl border border-zinc-800 flex flex-col items-center text-center transition-transform hover:scale-105">
            <svg className="w-10 h-10 text-amber-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <h3 className="text-lg font-medium">See exactly where AI patterns appear</h3>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 py-12 text-center text-sm text-zinc-600">
        <p>Open source &middot; MIT License &middot; Built for writers</p>
      </footer>
    </div>
  );
}
