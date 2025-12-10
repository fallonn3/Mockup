import React, { useState, useCallback, useEffect } from 'react';
import { MockupCategory, GeneratedImage } from './types';
import { generateMockupImage } from './services/geminiService';
import UploadZone from './components/UploadZone';
import Controls from './components/Controls';
import ResultCard from './components/ResultCard';

const INITIAL_RESULTS_COUNT = 4;

export default function App() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [category, setCategory] = useState<MockupCategory>(MockupCategory.STATIONERY);
  const [description, setDescription] = useState<string>('');
  
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setConfigError("API Key não configurada. Verifique as configurações do Netlify.");
    }
  }, []);

  const isGeneratingAny = results.some(r => r.loading);

  const handleGenerateAll = useCallback(async () => {
    if (!sourceImage) return;

    setHasStarted(true);
    
    // Initialize 4 placeholder slots
    const newResults: GeneratedImage[] = Array.from({ length: INITIAL_RESULTS_COUNT }).map((_, i) => ({
      id: `img-${Date.now()}-${i}`,
      url: null,
      loading: true,
      error: null
    }));
    setResults(newResults);

    // SEQUENTIAL GENERATION
    // Processing one by one avoids Rate Limits (429) on free tiers and improves reliability
    for (let i = 0; i < INITIAL_RESULTS_COUNT; i++) {
      // Check if the user hasn't reset/changed something mid-process
      // We pass the current ID to ensure we update the correct slot
      await generateSingle(i, newResults[i].id, sourceImage, category, description);
      
      // Small delay between requests to be gentle on the API
      if (i < INITIAL_RESULTS_COUNT - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }, [sourceImage, category, description]);

  const generateSingle = async (
    index: number,
    id: string,
    img: string,
    cat: MockupCategory,
    desc: string
  ) => {
    try {
      const generatedUrl = await generateMockupImage(img, cat, desc);
      
      setResults(prev => {
        const next = [...prev];
        // Only update if the slot still exists and matches ID (user hasn't cleared)
        if (next[index] && next[index].id === id) {
           next[index] = { ...next[index], loading: false, url: generatedUrl, error: null };
        }
        return next;
      });
    } catch (err: any) {
      setResults(prev => {
        const next = [...prev];
        if (next[index] && next[index].id === id) {
           const errorMessage = typeof err === 'string' ? err : (err.message || 'Falha na geração');
           next[index] = { ...next[index], loading: false, error: errorMessage };
        }
        return next;
      });
    }
  };

  const handleRedo = (index: number) => {
    if (!sourceImage) return;

    setResults(prev => {
      const next = [...prev];
      const newItem = { ...next[index], loading: true, error: null, url: null, id: `img-${Date.now()}-${index}` };
      next[index] = newItem;
      
      // Trigger regeneration for this specific slot immediately
      generateSingle(index, newItem.id, sourceImage, category, description);
      
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              MockupGen AI
            </h1>
          </div>
          <a href="https://ai.google.dev/" target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-brand-600 transition-colors">
            Powered by Gemini
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {configError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-pulse">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
             <div>
               <h3 className="font-bold text-red-800">Atenção: Chave de API Ausente</h3>
               <p className="text-red-700 mt-1">
                 O app não encontrou a chave <code>API_KEY</code>. Se você já configurou no Netlify, 
                 tente fazer um novo deploy (Trigger Deploy) para garantir que o build pegou a variável.
               </p>
             </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Transforme seu design em <span className="text-brand-600">Realidade</span>
          </h2>
          <p className="text-lg text-gray-600">
            Faça upload do seu logo ou arte e gere mockups profissionais em segundos usando inteligência artificial.
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-3xl mx-auto">
          <UploadZone 
            onImageSelected={setSourceImage} 
            selectedImage={sourceImage} 
          />
          
          <Controls 
            category={category} 
            setCategory={setCategory}
            description={description}
            setDescription={setDescription}
            onGenerate={handleGenerateAll}
            isGenerating={isGeneratingAny}
            canGenerate={!!sourceImage && !configError}
          />
        </div>

        {/* Results Section */}
        {hasStarted && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Resultados</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((result, index) => (
                <ResultCard
                  key={result.id} // Use ID as key to force re-render on redo new ID
                  image={result}
                  onRedo={() => handleRedo(index)}
                />
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}