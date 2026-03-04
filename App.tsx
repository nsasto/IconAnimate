
import React, { useState, useEffect } from 'react';
import { AppState, GeneratedIcon, DEFAULT_STYLE_CONFIG, StyleConfig } from './types';
import { checkApiKey, generateIconImage, animateIconVideo } from './services/gemini';
import ApiKeyNotice from './components/ApiKeyNotice';
import AnimateModal from './components/AnimateModal';
import SettingsMenu from './components/SettingsMenu';

const COLOR_PRESETS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Slate', value: '#64748b' },
  { name: 'Forest', value: '#2e4b32' },
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    icons: [],
    isGeneratingIcon: false,
    error: null,
    hasApiKey: false,
    styleConfig: DEFAULT_STYLE_CONFIG
  });

  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [animatingIconId, setAnimatingIconId] = useState<string | null>(null);
  const [animationStatus, setAnimationStatus] = useState('');

  useEffect(() => {
    const init = async () => {
      const hasKey = await checkApiKey();
      setState(prev => ({ ...prev, hasApiKey: hasKey }));
    };
    init();
  }, []);

  const handleGenerateIcon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || state.isGeneratingIcon) return;

    setState(prev => ({ ...prev, isGeneratingIcon: true, error: null }));
    try {
      const imageUrl = await generateIconImage(prompt, state.styleConfig);
      const newIcon: GeneratedIcon = {
        id: Math.random().toString(36).substring(7),
        idea: prompt,
        imageUrl,
        isAnimating: false,
        status: 'idle',
        timestamp: Date.now(),
        format: state.styleConfig.format
      };
      setState(prev => ({
        ...prev,
        icons: [newIcon, ...prev.icons],
        isGeneratingIcon: false
      }));
      setPrompt('');
    } catch (err: any) {
      console.error(err);
      let errorMsg = "Failed to generate masterpiece. Please try again.";
      if (err.message?.includes("Requested entity was not found")) {
        setState(prev => ({ ...prev, hasApiKey: false }));
        errorMsg = "API Key error. Please select your key again.";
      }
      setState(prev => ({ ...prev, isGeneratingIcon: false, error: errorMsg }));
    }
  };

  const updateStyleConfig = (key: keyof StyleConfig, value: string) => {
    setState(prev => ({
      ...prev,
      styleConfig: { ...prev.styleConfig, [key]: value }
    }));
  };

  const clearGallery = () => {
    setState(prev => ({ ...prev, icons: [] }));
  };

  const startAnimationProcess = (id: string) => {
    setAnimatingIconId(id);
  };

  const handleConfirmAnimation = async (action: string) => {
    if (!animatingIconId) return;
    const iconId = animatingIconId;
    setAnimatingIconId(null);

    const iconToAnimate = state.icons.find(i => i.id === iconId);
    if (!iconToAnimate) return;

    setState(prev => ({
      ...prev,
      icons: prev.icons.map(icon => 
        icon.id === iconId ? { ...icon, isAnimating: true, status: 'generating-video' } : icon
      )
    }));

    try {
      const videoUrl = await animateIconVideo(
        iconToAnimate.idea,
        iconToAnimate.imageUrl,
        action,
        iconToAnimate.format,
        (status) => setAnimationStatus(status)
      );

      setState(prev => ({
        ...prev,
        icons: prev.icons.map(icon => 
          icon.id === iconId ? { ...icon, videoUrl, isAnimating: false, status: 'complete' } : icon
        )
      }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        icons: prev.icons.map(icon => 
          icon.id === iconId ? { ...icon, isAnimating: false, status: 'idle' } : icon
        ),
        error: "Animation failed. Please try a simpler motion or check your API key."
      }));
    } finally {
      setAnimationStatus('');
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {!state.hasApiKey && <ApiKeyNotice onKeySelected={() => setState(prev => ({ ...prev, hasApiKey: true }))} />}

      <AnimateModal
        isOpen={!!animatingIconId}
        onClose={() => setAnimatingIconId(null)}
        onConfirm={handleConfirmAnimation}
        iconName={state.icons.find(i => i.id === animatingIconId)?.idea || ''}
      />

      <header className="sticky top-0 z-40 glass border-b border-gray-100 px-6 py-4 mb-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-magic"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">IconoAnimate</h1>
              <p className="text-xs text-indigo-500 font-medium tracking-wide uppercase">AI Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live API
            </span>
            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showSettings ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-100 text-gray-400 hover:text-gray-600 hover:border-gray-200 shadow-sm'}`}
              >
                <i className={`fas fa-cog ${showSettings ? 'animate-spin-slow' : ''}`}></i>
              </button>
              <SettingsMenu 
                isOpen={showSettings} 
                onClose={() => setShowSettings(false)} 
                onClearGallery={clearGallery}
                hasIcons={state.icons.length > 0}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <section className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Bring your <span className="gradient-text">Ideas</span> to Life
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Describe an icon or banner and we'll generate a premium 3D isometric version. 
            </p>
          </div>

          <form onSubmit={handleGenerateIcon} className="max-w-3xl mx-auto space-y-6">
            {/* Format Toggle */}
            <div className="flex justify-center p-1 bg-gray-100 rounded-2xl w-fit mx-auto shadow-inner">
              <button
                type="button"
                onClick={() => updateStyleConfig('format', 'icon')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  state.styleConfig.format === 'icon' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-square"></i> Icon
              </button>
              <button
                type="button"
                onClick={() => updateStyleConfig('format', 'banner')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  state.styleConfig.format === 'banner' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-rectangle-ad"></i> Banner
              </button>
            </div>

            <div className="relative group">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={state.styleConfig.format === 'icon' ? "e.g. A futuristic hovering delivery drone" : "e.g. A sprawling cyberpunk city skyline"}
                className="w-full pl-6 pr-40 py-5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg text-gray-900 group-hover:border-indigo-300"
                disabled={state.isGeneratingIcon}
              />
              <button
                type="submit"
                disabled={state.isGeneratingIcon || !prompt.trim()}
                className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold px-8 rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                {state.isGeneratingIcon ? (
                  <><i className="fas fa-spinner animate-spin"></i></>
                ) : (
                  <><i className="fas fa-sparkles"></i> Create</>
                )}
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50"
              >
                <div className="flex items-center gap-2 font-semibold text-gray-700">
                  <i className="fas fa-sliders-h text-indigo-500"></i>
                  <span>Custom Style Options</span>
                </div>
                <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'} text-gray-400 transition-transform`}></i>
              </button>

              {showAdvanced && (
                <div className="p-6 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Color Palette Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-600 uppercase tracking-tight">Primary Palette</label>
                      <span className="text-xs font-medium text-gray-400">Chosen: {state.styleConfig.primaryColor}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => updateStyleConfig('primaryColor', color.value)}
                          className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                            state.styleConfig.primaryColor === color.value ? 'border-gray-900 scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        >
                          {state.styleConfig.primaryColor === color.value && (
                            <i className="fas fa-check text-white text-xs drop-shadow-sm"></i>
                          )}
                        </button>
                      ))}
                      <div className="h-8 w-px bg-gray-200 mx-2"></div>
                      <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-100">
                        <input
                          type="color"
                          value={state.styleConfig.primaryColor}
                          onChange={(e) => updateStyleConfig('primaryColor', e.target.value)}
                          className="w-8 h-8 rounded-full border-0 cursor-pointer overflow-hidden bg-transparent p-0"
                        />
                        <input 
                          type="text"
                          value={state.styleConfig.primaryColor}
                          onChange={(e) => updateStyleConfig('primaryColor', e.target.value)}
                          className="w-20 bg-transparent text-xs font-mono font-bold text-gray-900 focus:outline-none"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600 uppercase tracking-tight">Color Tone</label>
                      <select 
                        value={state.styleConfig.colorTone}
                        onChange={(e) => updateStyleConfig('colorTone', e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-900 font-medium"
                      >
                        <option value="naturalistic with slight saturation boost">Naturalistic</option>
                        <option value="highly vibrant and saturated">Vibrant</option>
                        <option value="soft pastel tones">Pastel</option>
                        <option value="monochromatic with one accent color">Monochrome</option>
                        <option value="futuristic neon aesthetic">Neon</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600 uppercase tracking-tight">Lighting Type</label>
                      <select 
                        value={state.styleConfig.lightingType}
                        onChange={(e) => updateStyleConfig('lightingType', e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-900 font-medium"
                      >
                        <option value="soft ambient light">Soft Ambient</option>
                        <option value="hard dramatic studio lighting">Dramatic Studio</option>
                        <option value="warm golden hour light">Golden Hour</option>
                        <option value="ethereal glowing light">Ethereal</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600 uppercase tracking-tight">Arrangement (Icons Only)</label>
                      <select 
                        disabled={state.styleConfig.format === 'banner'}
                        value={state.styleConfig.arrangement}
                        onChange={(e) => updateStyleConfig('arrangement', e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-900 font-medium disabled:opacity-50"
                      >
                        <option value="central dominant object, with supporting elements symmetrically placed">Symmetrical</option>
                        <option value="central focus with diagonal supporting elements">Diagonal</option>
                        <option value="tilted isometric cluster">Cluster</option>
                        <option value="minimalist single object focus">Minimalist</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600 uppercase tracking-tight">Lighting Source</label>
                      <select 
                        value={state.styleConfig.lightingDirection}
                        onChange={(e) => updateStyleConfig('lightingDirection', e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-900 font-medium"
                      >
                        <option value="subtle top-right direction">Top Right</option>
                        <option value="subtle top-left direction">Top Left</option>
                        <option value="direct front-top direction">Front Top</option>
                        <option value="backlight rim lighting">Backlight</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>

          {state.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2">
              <i className="fas fa-circle-exclamation"></i> {state.error}
            </div>
          )}
        </section>

        <section>
          {state.icons.length === 0 && !state.isGeneratingIcon ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 text-4xl mb-4">
                <i className="fas fa-images"></i>
              </div>
              <p className="text-gray-400 font-medium">Your studio creations will appear here</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${state.icons.some(i => i.format === 'banner') ? 'md:grid-cols-1 lg:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-8`}>
              {state.isGeneratingIcon && (
                <div className={`relative group bg-white p-4 rounded-3xl shadow-lg animate-pulse ${state.styleConfig.format === 'banner' ? 'lg:col-span-2' : ''}`}>
                  <div className={`${state.styleConfig.format === 'banner' ? 'aspect-video' : 'aspect-square'} bg-gray-100 rounded-2xl mb-4 flex items-center justify-center overflow-hidden`}>
                    <div className="flex flex-col items-center">
                      <i className="fas fa-wand-magic-sparkles text-4xl text-indigo-300 mb-3 animate-bounce"></i>
                      <p className="text-gray-400 font-medium text-sm">Crafting your {state.styleConfig.format}...</p>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-100 rounded-full w-1/2"></div>
                </div>
              )}

              {state.icons.map((icon) => (
                <div key={icon.id} className={`group bg-white p-4 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all overflow-hidden relative ${icon.format === 'banner' ? 'lg:col-span-2' : ''}`}>
                  <div className={`${icon.format === 'banner' ? 'aspect-video' : 'aspect-square'} bg-gray-50 rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center border border-gray-50`}>
                    {icon.isAnimating ? (
                      <div className="absolute inset-0 z-10 bg-indigo-600/10 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                        <div className="relative mb-4">
                          <i className="fas fa-circle-notch text-4xl text-indigo-600 loader-spin"></i>
                          <i className="fas fa-film absolute inset-0 flex items-center justify-center text-indigo-600 text-sm"></i>
                        </div>
                        <p className="text-indigo-900 font-bold mb-1">Animating...</p>
                        <p className="text-indigo-600/80 text-xs font-medium px-4 py-1.5 bg-white/80 rounded-full shadow-sm">
                          {animationStatus || 'Rendering video'}
                        </p>
                      </div>
                    ) : null}

                    {icon.videoUrl ? (
                      <video
                        src={icon.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img src={icon.imageUrl} alt={icon.idea} className="w-full h-full object-contain" />
                    )}

                    {!icon.isAnimating && !icon.videoUrl && (
                      <button
                        onClick={() => startAnimationProcess(icon.id)}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 hover:bg-white text-indigo-600 px-4 py-2 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100"
                      >
                        <i className="fas fa-play-circle"></i> Animate {icon.format}
                      </button>
                    )}
                  </div>

                  <div className="px-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${icon.format === 'banner' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {icon.format}
                      </span>
                      <h4 className="font-bold text-gray-900 truncate capitalize flex-1" title={icon.idea}>{icon.idea}</h4>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 font-medium">
                        {new Date(icon.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="flex gap-2">
                         <a 
                          href={icon.videoUrl || icon.imageUrl} 
                          download={`studio-${icon.id}.${icon.videoUrl ? 'mp4' : 'png'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
                          title="Download"
                        >
                          <i className="fas fa-download"></i>
                        </a>
                      </div>
                    </div>
                  </div>

                  {icon.status === 'complete' && (
                    <div className="absolute top-6 right-6 z-20">
                      <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                        ANIMATED
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {state.icons.length > 0 && !state.isGeneratingIcon && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
            <i className="fas fa-lightbulb text-yellow-400"></i>
            <p className="text-sm font-medium">Click "Animate" to see the magic happen!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
