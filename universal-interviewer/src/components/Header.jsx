import { Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full border-b border-white/20 bg-white/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-brand-700">
          <Sparkles className="w-6 h-6 text-brand-500" />
          <h1 className="text-xl font-bold tracking-tight">Entrevistador Universal</h1>
        </div>
      </div>
    </header>
  );
}
