import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  Sparkles, 
  RefreshCw, 
  Download, 
  Image as ImageIcon, 
  X,
  Wand2,
  Zap,
  Layers,
  Palette
} from 'lucide-react';

const mockPrompts = [
  'Add a retro filter with warm tones',
  'Show the landscape at golden hour sunset',
  'Remove background and add industrial setting',
  'Enhance with professional mining aesthetics',
];

export default function AIStudio() {
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
      await new Promise(resolve => setTimeout(resolve, 3000));
      setGeneratedImage(previewUrl);
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

  const features = [
    { icon: Wand2, title: 'AI Enhancement', description: 'Transform imagery with intelligent editing' },
    { icon: Layers, title: 'Background Removal', description: 'Isolate subjects with precision' },
    { icon: Palette, title: 'Style Transfer', description: 'Apply artistic and professional styles' },
    { icon: Zap, title: 'Instant Results', description: 'Get results in seconds with Gemini 2.5' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors duration-500" data-testid="page-ai-studio">
      <div className="pt-32 pb-20 bg-stone-100 dark:bg-stone-900 transition-colors duration-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold font-bold tracking-[0.2em] text-xs uppercase mb-4 block">
            Powered by Gemini 2.5 Flash
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6 text-stone-900 dark:text-stone-100">
            Lithium <span className="text-gold">AI Studio</span>
          </h1>
          <p className="text-lg text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
            Visualize site enhancements, simulate environmental conditions, 
            or style your corporate imagery with our advanced AI editing suite.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-center p-6">
              <div className="h-12 w-12 rounded-lg bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-gold" />
              </div>
              <h3 className="font-serif font-semibold mb-2 text-stone-900 dark:text-stone-100">{feature.title}</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
                  <Upload className="h-5 w-5 text-gold" />
                  1. Upload Source Imagery
                </CardTitle>
                <CardDescription className="text-stone-500 dark:text-stone-400">
                  Drag and drop or click to upload your image
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer ${
                    previewUrl 
                      ? 'border-gold/50 bg-gold/5' 
                      : 'border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => !previewUrl && fileInputRef.current?.click()}
                  data-testid="upload-zone"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                    data-testid="input-file-upload"
                  />
                  
                  {previewUrl ? (
                    <div className="relative group">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-64 mx-auto rounded-lg shadow-lg"
                        data-testid="image-preview"
                      />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSelection();
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        data-testid="button-clear-image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                      <p className="text-stone-900 dark:text-stone-100 font-medium mb-2">Click to upload or drag and drop</p>
                      <p className="text-stone-500 dark:text-stone-400 text-sm">High-res PNG or JPG recommended</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
                  <Sparkles className="h-5 w-5 text-gold" />
                  2. Describe Enhancement
                </CardTitle>
                <CardDescription className="text-stone-500 dark:text-stone-400">
                  Tell the AI what changes you want to make
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., 'Add a retro filter', 'Show the landscape at sunset', 'Remove the truck in the background'..."
                  className="min-h-[120px] bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 focus:border-gold focus:ring-gold/20 resize-none"
                  data-testid="textarea-prompt"
                />
                
                <div className="flex flex-wrap gap-2">
                  {mockPrompts.map((p) => (
                    <Badge 
                      key={p}
                      variant="outline" 
                      className="cursor-pointer border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-400 hover:border-gold hover:text-gold transition-all"
                      onClick={() => setPrompt(p)}
                    >
                      {p}
                    </Badge>
                  ))}
                </div>

                <Button 
                  className="w-full h-12 font-bold tracking-widest uppercase bg-gold text-white hover:bg-gold/90 shadow-lg transition-all duration-300"
                  onClick={handleGenerate} 
                  disabled={!selectedFile || !prompt || isLoading}
                  data-testid="button-generate"
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
                
                {error && (
                  <p className="text-red-500 text-sm text-center" data-testid="text-error">
                    {error}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:sticky lg:top-32 lg:self-start">
            <Card className="min-h-[500px] flex items-center justify-center relative overflow-hidden bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
              {!generatedImage && !isLoading && (
                <div className="text-center text-stone-400 p-8">
                  <ImageIcon className="w-20 h-20 mx-auto mb-6 opacity-30" />
                  <p className="font-serif text-2xl opacity-50 mb-2">Result will appear here</p>
                  <p className="text-sm opacity-40">Upload an image and describe your enhancement</p>
                </div>
              )}

              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm z-10">
                  <div className="w-20 h-20 border-4 border-gold/30 border-t-gold rounded-full animate-spin mb-6" />
                  <p className="text-gold font-serif text-xl tracking-widest animate-pulse">
                    REFINING PIXELS...
                  </p>
                </div>
              )}

              {generatedImage && !isLoading && (
                <div className="relative w-full h-full animate-fade-in group p-4">
                  <img 
                    src={generatedImage} 
                    alt="Generated Vision" 
                    className="w-full h-auto max-h-[600px] object-contain mx-auto rounded-lg shadow-lg"
                    data-testid="image-result"
                  />
                  <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={generatedImage} 
                      download="lithium-ai-studio-edit.png"
                      className="inline-flex items-center bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-4 py-2 rounded-lg font-bold text-sm text-stone-900 dark:text-stone-100 hover:bg-gold hover:text-white hover:border-gold transition-all shadow-lg"
                      data-testid="button-download"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download
                    </a>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
