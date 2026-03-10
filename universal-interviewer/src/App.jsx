import { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultsView from './components/ResultsView';
import { generateInterviewQuestions } from './lib/llm';

function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async ({ cvText, jobDescription, companyInfo }) => {
    setIsGenerating(true);
    setResults(null);
    setError(null);
    
    try {
      const generatedQuestions = await generateInterviewQuestions(cvText, jobDescription, companyInfo);
      setResults(generatedQuestions);
    } catch (err) {
      console.error(err);
      setError(err.message || "Hubo un error al generar las preguntas.");
      alert(`Error de Gemini API: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-50">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-300/30 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-400/20 blur-3xl pointer-events-none"></div>

      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 relative z-10 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-5/12 lg:w-1/3">
          <InputForm onGenerate={handleGenerate} isGenerating={isGenerating} />
        </div>
        <div className="w-full md:w-7/12 lg:w-2/3">
          <ResultsView isGenerating={isGenerating} results={results} />
        </div>
      </main>
    </div>
  );
}

export default App;
