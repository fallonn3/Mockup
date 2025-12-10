import React from 'react';
import { MockupCategory } from '../types';

interface ControlsProps {
  category: MockupCategory;
  setCategory: (c: MockupCategory) => void;
  description: string;
  setDescription: (s: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  category,
  setCategory,
  description,
  setDescription,
  onGenerate,
  isGenerating,
  canGenerate
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Categoria do Mockup</label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MockupCategory)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              {Object.values(MockupCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Optional Description */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Estilo / Detalhes <span className="text-gray-400 font-normal">(Opcional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: fundo escuro, minimalista, luz natural..."
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-brand-500/30 flex items-center gap-2 transition-all transform active:scale-95 ${
            !canGenerate || isGenerating
              ? 'bg-gray-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Gerando...
            </>
          ) : (
            <>
              Gerar Mockups
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Controls;
