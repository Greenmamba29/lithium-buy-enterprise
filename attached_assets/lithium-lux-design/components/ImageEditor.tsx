import React, { useState, useRef } from 'react';
import { Upload, Sparkles, RefreshCw, Download, Image as ImageIcon, X } from 'lucide-react';
import { Button } from './Button';
import { editImageWithGemini } from '../services/geminiService';

export const ImageEditor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedImage(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedImage(null);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || !prompt) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await editImageWithGemini(selectedFile, prompt);
      setGeneratedImage(result);
    } catch (err) {
      setError("Failed to generate image. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setGeneratedImage(null);
    setPrompt('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div id="studio-section" className="py-24 bg-gradient-to-b from-obsidian to-[#111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-gold-500 font-bold tracking-widest uppercase text-xs">Powered by Gemini 2.5 Flash</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white mt-3 mb-6">Lithium AI Studio</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Visualize site enhancements, simulate environmental conditions, or style your corporate imagery with our advanced AI editing suite.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Controls Section */}
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 p-8 rounded-sm backdrop-blur-md">
              <h3 className="text-xl font-serif text-white mb-6">1. Upload Source Imagery</h3>
              
              <div 
                className={`relative border-2 border-dashed rounded-sm p-8 text-center transition-all duration-300 ${
                  previewUrl ? 'border-gold-500/50 bg-gold-500/5' : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                {previewUrl ? (
                  <div className="relative group">
                    <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto shadow-2xl" />
                    <button 
                      onClick={clearSelection}
                      className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-300 font-medium">Click to upload or drag and drop</p>
                    <p className="text-gray-500 text-sm mt-2">High-res PNG or JPG recommended</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-sm backdrop-blur-md">
              <h3 className="text-xl font-serif text-white mb-6">2. Describe Enhancement</h3>
              <div className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., 'Add a retro filter', 'Show the landscape at sunset', 'Remove the truck in the background'..."
                  className="w-full bg-obsidian border border-white/20 text-white p-4 focus:ring-1 focus:ring-gold-500 focus:border-gold-500 outline-none rounded-sm min-h-[120px] placeholder-gray-600 resize-none"
                />
                <Button 
                  fullWidth 
                  onClick={handleGenerate} 
                  disabled={!selectedFile || !prompt || isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Processing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" /> Generate Vision
                    </span>
                  )}
                </Button>
                {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="lg:h-full">
            <div className="h-full bg-black border border-white/10 p-1 relative min-h-[500px] flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
              
              {!generatedImage && !isLoading && (
                <div className="text-center text-gray-600">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="font-serif text-xl opacity-40">Result will appear here</p>
                </div>
              )}

              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                  <div className="w-16 h-16 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-gold-500 font-serif tracking-widest animate-pulse">REFINING PIXELS...</p>
                </div>
              )}

              {generatedImage && (
                <div className="relative w-full h-full animate-fade-in group">
                  <img 
                    src={generatedImage} 
                    alt="Generated Vision" 
                    className="w-full h-auto max-h-[700px] object-contain mx-auto shadow-2xl"
                  />
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={generatedImage} 
                      download="lithium-lux-edit.png"
                      className="inline-flex items-center bg-white text-obsidian px-4 py-2 rounded-sm font-bold text-sm hover:bg-gold-500 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
