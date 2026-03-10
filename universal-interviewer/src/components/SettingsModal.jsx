import { useState, useEffect } from 'react';
import { Key, X } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, apiKey, onSave }) {
  const [tempKey, setTempKey] = useState(apiKey);

  useEffect(() => {
    if (isOpen) {
      setTempKey(apiKey);
    }
  }, [isOpen, apiKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2 mb-4 text-brand-700">
          <Key className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Configuración de API</h2>
        </div>
        
        <p className="text-sm text-slate-600 mb-6">
          Para generar preguntas debes configurar tu API Key de Google Gemini. Tus claves solo se guardan localmente en tu navegador.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-1">
              Gemini API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white/50"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onSave(tempKey);
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              Guardar Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
