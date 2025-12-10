import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import ImageModal from './ImageModal';

interface ResultCardProps {
  image: GeneratedImage;
  onRedo: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ image, onRedo }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!image.url) return;
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `mockup-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!image.url) return;
    window.open(image.url, '_blank');
  };

  return (
    <>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 flex flex-col h-full group hover:shadow-md transition-shadow">
        <div 
          className="relative aspect-square bg-gray-100 w-full overflow-hidden cursor-pointer"
          onClick={() => image.url && setIsModalOpen(true)}
        >
          {image.loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center animate-pulse cursor-default">
               <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mb-4"></div>
               <p className="text-gray-400 text-sm font-medium">Criando...</p>
            </div>
          ) : image.error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center cursor-default">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-red-400 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <p className="text-sm text-gray-500">Falha ao gerar</p>
              <button onClick={(e) => { e.stopPropagation(); onRedo(); }} className="mt-2 text-sm text-brand-600 font-medium hover:underline">Tentar novamente</button>
            </div>
          ) : image.url ? (
            <>
              <img
                src={image.url}
                alt="Mockup gerado"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay for hover/preview indication */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                 <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                 </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Actions */}
        <div className="p-3 flex gap-2 mt-auto bg-white border-t border-gray-100">
          <button
            onClick={handleDownload}
            disabled={image.loading || !!image.error || !image.url}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Baixar imagem"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 9.75V3m0 0 4.5 4.5M12 3l-4.5 4.5" />
            </svg>
            <span className="hidden sm:inline">Baixar</span>
          </button>
          
          <button
            onClick={handleOpenNewTab}
            disabled={image.loading || !!image.error || !image.url}
            className="flex items-center justify-center p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 disabled:opacity-50 transition-colors"
            title="Abrir em nova guia"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </button>

          <button
            onClick={onRedo}
            disabled={image.loading}
            className="flex items-center justify-center p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-brand-600 disabled:opacity-50 transition-colors"
            title="Refazer este mockup"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      <ImageModal 
        isOpen={isModalOpen} 
        imageUrl={image.url} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default ResultCard;