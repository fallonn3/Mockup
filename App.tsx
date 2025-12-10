import React, { useState, useCallback } from 'react';
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
  
  // State for the 4 result slots
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

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

    // Trigger generations in parallel but independently so one failure doesn't stop others
    newResults.forEach((item, index) => {
      generateSingle(index, item.id, sourceImage, category, description);
    });
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
        if (next[index] && next[index].id === id) {
           next[index] = { ...next[index], loading: false, url: generatedUrl, error: null };
        }
        return next;
      });
    } catch (err) {
      setResults(prev => {
        const next = [...prev];
        if (next[index] && next[index].id === id) {
           next[index] = { ...next[index], loading: false, error: 'Falha na geração' };
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
      
      // Trigger regeneration for this specific slot
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
            canGenerate={!!sourceImage}
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
