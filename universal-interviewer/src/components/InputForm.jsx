import { useState, useRef } from 'react';
import { FileText, Briefcase, Building2, Send, Loader2, UploadCloud, FileCheck2 } from 'lucide-react';
import { extractTextFromPDF } from '../lib/pdfReader';

function SmartInput({
  label,
  icon: Icon,
  mode,
  onModeChange,
  textValue,
  onTextChange,
  fileValue,
  onFileChange,
  placeholder,
  disabled,
  optional,
  error,
  onClearError
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (onClearError) onClearError();
    
    if (file && file.type === 'application/pdf') {
      onFileChange(file, '');
    } else if (file) {
      onFileChange(null, 'Por favor selecciona un archivo PDF válido.');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Icon className="w-4 h-4 text-brand-500" />
          {label} {optional && <span className="text-slate-400 font-normal">(Opcional)</span>}
        </label>
        <div className="flex bg-white/60 backdrop-blur-sm border border-slate-200 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onModeChange('text')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              mode === 'text'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white'
            }`}
          >
            Texto
          </button>
          <button
            type="button"
            onClick={() => onModeChange('file')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              mode === 'file'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white'
            }`}
          >
            PDF
          </button>
        </div>
      </div>

      <div className="mt-2">
        {mode === 'text' && (
          <textarea
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full h-32 px-4 py-3 bg-white/50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm placeholder:text-slate-400 disabled:opacity-50"
          />
        )}

        {mode === 'file' && (
          <div
            onClick={() => !disabled && fileInputRef.current?.click()}
            className={`w-full h-32 relative px-4 py-6 border-2 border-dashed rounded-xl transition-all text-center flex flex-col items-center justify-center gap-2 ${
              disabled
                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                : fileValue
                ? 'bg-emerald-50 border-emerald-300 hover:border-emerald-400 cursor-pointer'
                : 'bg-white/50 border-brand-200 hover:border-brand-400 hover:bg-brand-50/50 cursor-pointer'
            }`}
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={disabled}
            />
            {fileValue ? (
              <>
                <FileCheck2 className="w-8 h-8 text-emerald-500" />
                <div className="text-sm font-medium text-emerald-700 w-full truncate px-4">
                  {fileValue.name}
                </div>
                <div className="text-xs text-emerald-600/70">Clic para cambiar archivo</div>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-brand-400" />
                <div className="text-sm font-medium text-slate-600">Sube el archivo aquí</div>
                <div className="text-xs text-slate-400">Solo formato PDF (máx 5MB)</div>
              </>
            )}
          </div>
        )}
      </div>
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  );
}

export default function InputForm({ onGenerate, isGenerating }) {
  // Candidate CV
  const [cvMode, setCvMode] = useState('file');
  const [cvText, setCvText] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [cvError, setCvError] = useState('');

  // Job Description
  const [jobMode, setJobMode] = useState('text');
  const [jobText, setJobText] = useState('');
  const [jobFile, setJobFile] = useState(null);
  const [jobError, setJobError] = useState('');

  // Company Info
  const [companyMode, setCompanyMode] = useState('text');
  const [companyText, setCompanyText] = useState('');
  const [companyFile, setCompanyFile] = useState(null);
  const [companyError, setCompanyError] = useState('');

  const isCvValid = cvMode === 'text' ? cvText.trim().length > 0 : cvFile !== null;
  const isJobValid = jobMode === 'text' ? jobText.trim().length > 0 : jobFile !== null;
  const isFormValid = isCvValid && isJobValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isGenerating) return;

    try {
      setCvError('');
      setJobError('');
      setCompanyError('');

      let finalCvText = cvText;
      if (cvMode === 'file' && cvFile) {
        finalCvText = await extractTextFromPDF(cvFile);
      }

      let finalJobText = jobText;
      if (jobMode === 'file' && jobFile) {
        finalJobText = await extractTextFromPDF(jobFile);
      }

      let finalCompanyText = companyText;
      if (companyMode === 'file' && companyFile) {
        finalCompanyText = await extractTextFromPDF(companyFile);
      }

      if (!finalCvText || !finalJobText) {
        throw new Error("No se pudo extraer texto suficiente de los archivos obligatorios.");
      }

      onGenerate({
        cvText: finalCvText,
        jobDescription: finalJobText,
        companyInfo: finalCompanyText
      });
    } catch (err) {
      console.error(err);
      alert('Error procesando un PDF: ' + (err.message || 'El PDF podría estar dañado o vacío.'));
    }
  };

  return (
    <div className="glass-panel p-6 sticky top-24">
      <h2 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">Datos de la Vacante</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <SmartInput
          label="Curriculum Vitae *"
          icon={FileText}
          mode={cvMode}
          onModeChange={setCvMode}
          textValue={cvText}
          onTextChange={setCvText}
          fileValue={cvFile}
          onFileChange={(f, err) => { setCvFile(f); setCvError(err || ''); }}
          error={cvError}
          onClearError={() => setCvError('')}
          disabled={isGenerating}
          placeholder="Pega el texto del CV completo aquí..."
        />

        <SmartInput
          label="Descripción del Puesto *"
          icon={Briefcase}
          mode={jobMode}
          onModeChange={setJobMode}
          textValue={jobText}
          onTextChange={setJobText}
          fileValue={jobFile}
          onFileChange={(f, err) => { setJobFile(f); setJobError(err || ''); }}
          error={jobError}
          onClearError={() => setJobError('')}
          disabled={isGenerating}
          placeholder="Pega la descripción de la vacante, requisitos..."
        />

        <SmartInput
          label="Misión, Valores y Cultura"
          icon={Building2}
          optional={true}
          mode={companyMode}
          onModeChange={setCompanyMode}
          textValue={companyText}
          onTextChange={setCompanyText}
          fileValue={companyFile}
          onFileChange={(f, err) => { setCompanyFile(f); setCompanyError(err || ''); }}
          error={companyError}
          onClearError={() => setCompanyError('')}
          disabled={isGenerating}
          placeholder="Misión, cultura de trabajo, core values..."
        />

        <button
          type="submit"
          disabled={!isFormValid || isGenerating}
          className="w-full py-3.5 px-4 flex items-center justify-center gap-2 font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 rounded-xl hover:from-brand-700 hover:to-brand-600 shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 mt-4"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analizando perfil...</span>
            </>
          ) : (
            <>
              <span>Generar Entrevista</span>
              <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
