import { useState, useEffect } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultsView from './components/ResultsView';
import SettingsModal from './components/SettingsModal';
import { generateInterviewQuestions } from './lib/llm';

function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  // Settings / API Key State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  // Open settings on first load if no key is present
  useEffect(() => {
    if (!apiKey) {
      setIsSettingsOpen(true);
    }
  }, [apiKey]);

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleGenerate = async ({ cvText, jobDescription, companyInfo }) => {
    if (!apiKey) {
      alert("Por favor, configura tu API Key de Gemini desde el icono de Ajustes arriba a la derecha.");
      setIsSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    setResults(null);
    setError(null);
    
    try {
      const generatedQuestions = await generateInterviewQuestions(apiKey, cvText, jobDescription, companyInfo);
      setResults(generatedQuestions);
    } catch (err) {
      console.error(err);
      setError(err.message || "Hubo un error al generar las preguntas.");
      
      // If error is 403, specifically advise to check the API key
      if (err.message && err.message.includes("403")) {
          alert(`Error de Gemini API: Tu API Key fue rechazada o reportada (403). Por favor introduce una nueva desde Ajustes.`);
          setIsSettingsOpen(true);
      } else {
          alert(`Error de Gemini API: ${err.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-50">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-300/30 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-400/20 blur-3xl pointer-events-none"></div>

      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 relative z-10 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-5/12 lg:w-1/3">
          <InputForm onGenerate={handleGenerate} isGenerating={isGenerating} />
        </div>
        <div className="w-full md:w-7/12 lg:w-2/3">
          <ResultsView isGenerating={isGenerating} results={results} />
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSave={handleSaveApiKey}
      />
    </div>
  );
}

export default App;
