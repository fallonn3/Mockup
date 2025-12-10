import React, { useRef, useState } from 'react';

interface UploadZoneProps {
  onImageSelected: (base64: string) => void;
  selectedImage: string | null;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected, selectedImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    if (!file) return;
    if (file.type !== 'image/png') {
      alert('Por favor, envie apenas imagens PNG.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onImageSelected(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  return (
    <div className="w-full mb-8">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer bg-white ${
          isDragging
            ? 'border-brand-500 bg-brand-50'
            : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png"
          onChange={handleFileChange}
        />

        {selectedImage ? (
          <div className="relative group w-full max-w-xs aspect-square flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <img
              src={selectedImage}
              alt="Preview"
              className="max-h-full max-w-full object-contain"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
              <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">Alterar Imagem</span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Clique ou arraste sua imagem</h3>
            <p className="text-sm text-gray-500 mt-2">Suporta apenas arquivos PNG</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadZone;
