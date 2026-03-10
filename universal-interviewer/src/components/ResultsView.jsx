import { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare, UserCheck, Sparkles } from 'lucide-react';

function QuestionCard({ item, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-start text-left gap-4 hover:bg-slate-50 transition-colors focus:outline-none"
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-sm shrink-0">
          {index + 1}
        </span>
        <div className="flex-1 mt-1">
          <p className="font-semibold text-slate-800 leading-snug">{item.question}</p>
        </div>
        <div className="shrink-0 mt-1.5 text-slate-400">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
          <div className="flex gap-3">
            <UserCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Estrategia sugerida de respuesta basada en el CV:</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{item.answer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsView({ isGenerating, results }) {
  if (isGenerating) {
    return (
      <div className="glass-panel p-8 h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-brand-400 blur-xl opacity-30 rounded-full animate-pulse"></div>
          <Sparkles className="w-16 h-16 text-brand-500 animate-bounce relative z-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Analizando Perfil...</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Cruzando los datos del currículum con la vacante y los valores de la empresa para generar las mejores preguntas personalizadas.
          </p>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="glass-panel p-8 h-full min-h-[500px] flex flex-col items-center justify-center text-center border-dashed border-2 bg-transparent border-slate-300">
        <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-xl font-medium text-slate-600">No hay datos por ahora</h3>
        <p className="text-slate-400 text-sm max-w-xs mt-2">
          Completa el formulario en el panel lateral para generar el test de entrevista personalizado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-panel px-6 py-4 sticky top-24 z-40">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Preguntas Sugeridas</h2>
          <p className="text-sm text-slate-500">{results.length} preguntas generadas para la entrevista</p>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((item, index) => (
          <QuestionCard key={index} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
