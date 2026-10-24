import React, { useState, useRef } from 'react';
import { 
  Music, 
  Image as ImageIcon, 
  Video, 
  Sparkles, 
  Upload, 
  Play, 
  Pause, 
  Download, 
  RefreshCw, 
  Sliders, 
  AlertCircle, 
  CheckCircle2, 
  Film, 
  Wand2, 
  Layers, 
  Radio, 
  Volume2,
  Maximize2
} from 'lucide-react';

export const MediaStudioView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'music' | 'image' | 'video'>('music');

  // -------------------------------------------------------------
  // STATE: Music Studio (Lyria)
  // -------------------------------------------------------------
  const [musicPrompt, setMusicPrompt] = useState('Deep ambient synthesizer with gentle binaural pulses designed for focused software architecture coding.');
  const [musicTrackType, setMusicTrackType] = useState<'clip' | 'full'>('clip');
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [musicResult, setMusicResult] = useState<{ audioUrl: string; lyrics?: string; modelUsed: string } | null>(null);
  const [musicError, setMusicError] = useState<string | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // -------------------------------------------------------------
  // STATE: Image Studio (Gemini Nano Banana 2.1)
  // -------------------------------------------------------------
  const [imageMode, setImageMode] = useState<'create' | 'edit'>('create');
  const [imagePrompt, setImagePrompt] = useState('Minimalist dark mode technical diagram showing distributed agents communicating via Model Context Protocol, glowing cyan and violet nodes on obsidian background, 8k resolution');
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [uploadImageBase64, setUploadImageBase64] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageResult, setImageResult] = useState<{ imageUrl: string; textDescription?: string; modelUsed: string } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // STATE: Veo Video Studio (Veo 3.1)
  // -------------------------------------------------------------
  const [videoMode, setVideoMode] = useState<'text' | 'animate'>('text');
  const [videoPrompt, setVideoPrompt] = useState('A sleek drone camera moving through a glowing futuristic data center with fiber optic server racks pulsing with blue and magenta light, cinematic 4k.');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoSourceImage, setVideoSourceImage] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoPollStatus, setVideoPollStatus] = useState<string | null>(null);
  const [videoResultUrl, setVideoResultUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // File upload helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // -------------------------------------------------------------
  // HANDLER: Generate Music (Lyria)
  // -------------------------------------------------------------
  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim() || isGeneratingMusic) return;
    setIsGeneratingMusic(true);
    setMusicError(null);
    setMusicResult(null);

    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: musicPrompt,
          trackType: musicTrackType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Music generation failed');
      }

      setMusicResult(data);
    } catch (err: any) {
      console.error('Music generation error:', err);
      setMusicError(err.message || 'Failed to generate music');
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLER: Generate/Edit Image (Gemini Nano Banana 2.1)
  // -------------------------------------------------------------
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;
    setIsGeneratingImage(true);
    setImageError(null);
    setImageResult(null);

    try {
      const body: any = {
        prompt: imagePrompt,
        aspectRatio: imageAspectRatio,
      };
      if (imageMode === 'edit' && uploadImageBase64) {
        body.editImageBase64 = uploadImageBase64;
      }

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Image generation failed');
      }

      setImageResult(data);
    } catch (err: any) {
      console.error('Image generation error:', err);
      setImageError(err.message || 'Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLER: Generate/Animate Video (Veo 3.1)
  // -------------------------------------------------------------
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() || isGeneratingVideo) return;
    setIsGeneratingVideo(true);
    setVideoError(null);
    setVideoResultUrl(null);
    setVideoPollStatus('Initiating Veo 3.1 generation operation...');

    try {
      const body: any = {
        prompt: videoPrompt,
        aspectRatio: videoAspectRatio,
      };
      if (videoMode === 'animate' && videoSourceImage) {
        body.imageBase64 = videoSourceImage;
      }

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Video generation initiation failed');
      }

      const opName = data.operationName;
      setVideoPollStatus('Rendering frames with Veo 3.1 (this may take 1-2 minutes)...');

      // Poll until ready
      let isDone = false;
      let attempts = 0;
      while (!isDone && attempts < 40) {
        attempts++;
        await new Promise((r) => setTimeout(r, 6000));
        setVideoPollStatus(`Rendering video in progress (step ${attempts}/40)...`);

        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });
        const statusData = await statusRes.json();

        if (statusData.done) {
          isDone = true;
          if (statusData.error) {
            throw new Error(statusData.error.message || 'Video operation reported error');
          }
          setVideoPollStatus('Downloading rendered MP4 video...');

          // Download stream
          const dlRes = await fetch('/api/video-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: opName }),
          });

          if (!dlRes.ok) {
            throw new Error('Failed to retrieve video stream from server.');
          }

          const blob = await dlRes.blob();
          const videoObjectUrl = URL.createObjectURL(blob);
          setVideoResultUrl(videoObjectUrl);
          setVideoPollStatus(null);
          break;
        }
      }

      if (!isDone) {
        throw new Error('Video generation timed out. Please try again.');
      }
    } catch (err: any) {
      console.error('Video generation error:', err);
      setVideoError(err.message || 'Failed to generate video');
      setVideoPollStatus(null);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-fuchsia-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-fuchsia-400" />
                MULTIMODAL AI CREATIVE STUDIO
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">• Music • Images • Veo Video</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Nexus<span className="text-fuchsia-400">AI</span> Creative Studio
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Equip your engineering presentations, podcasts, and architectural designs with frontier generative models: <strong>Lyria 3</strong> (audio), <strong>Gemini Nano Banana 2.1</strong> (images), and <strong>Veo 3.1</strong> (cinematic video).
            </p>
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveSubTab('music')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'music'
                  ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Music Studio</span>
            </button>

            <button
              onClick={() => setActiveSubTab('image')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'image'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Image Studio</span>
            </button>

            <button
              onClick={() => setActiveSubTab('video')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'video'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Veo Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MUSIC STUDIO TAB (Lyria 3) */}
      {/* ========================================================================= */}
      {activeSubTab === 'music' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls & Configuration */}
          <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <Music className="w-4 h-4 text-fuchsia-400" />
                <span>Lyria 3 Music Generator</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                {musicTrackType === 'full' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview'}
              </span>
            </div>

            {/* Track Type Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 block">Track Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMusicTrackType('clip')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    musicTrackType === 'clip'
                      ? 'bg-fuchsia-950/60 border-fuchsia-500/60 shadow-md shadow-fuchsia-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-extrabold text-white">Short Audio Clip</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Up to 30s • lyria-3-clip-preview</div>
                </button>

                <button
                  type="button"
                  onClick={() => setMusicTrackType('full')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    musicTrackType === 'full'
                      ? 'bg-fuchsia-950/60 border-fuchsia-500/60 shadow-md shadow-fuchsia-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-extrabold text-white">Full Track Preview</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Extended piece • lyria-3-pro-preview</div>
                </button>
              </div>
            </div>

            {/* Prompt Input */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 block">Music Style Prompt</label>
              <textarea
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-fuchsia-500 resize-none"
                placeholder="Describe genre, instruments, mood, tempo, or sonic textures..."
              />
            </div>

            {/* Prompt Presets */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-1.5">Presets for Professionals:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Focus Ambient Synth with binaural alpha waves for deep engineering',
                  'High-energy Electronic Hackathon Intro with bass drop and synth arpeggio',
                  'Minimalist Acoustic Lo-Fi for coffee break and paper review',
                  'Futuristic Cyberpunk Tech Podcast theme song with crisp percussion',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMusicPrompt(preset)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  >
                    {preset.slice(0, 36)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateMusic}
              disabled={isGeneratingMusic || !musicPrompt.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-fuchsia-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {isGeneratingMusic ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Track with Lyria 3...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Music with {musicTrackType === 'full' ? 'Lyria 3 Pro' : 'Lyria 3 Clip'}</span>
                </>
              )}
            </button>
          </div>

          {/* Results Preview & Player */}
          <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-xs font-bold text-slate-300">Audio Preview & Waveform</span>
                {musicResult && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Generated Ready
                  </span>
                )}
              </div>

              {/* Error Notice */}
              {musicError && (
                <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 text-xs text-rose-300 space-y-1 mb-4">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Generation Message</span>
                  </div>
                  <p>{musicError}</p>
                  <p className="text-[11px] text-rose-400">
                    Note: Lyria models require an authorized API key with audio generation capabilities.
                  </p>
                </div>
              )}

              {/* Empty / Loading State */}
              {!musicResult && !musicError && (
                <div className="h-64 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center">
                    <Volume2 className="w-8 h-8 text-fuchsia-400/50" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-300">No Audio Generated Yet</div>
                    <div className="text-[11px] text-slate-400 mt-1 max-w-xs">
                      Enter a prompt above and click generate to synthesize audio using Google Lyria 3.
                    </div>
                  </div>
                </div>
              )}

              {/* Generated Player */}
              {musicResult && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center shadow-md">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Generated Composition</div>
                          <div className="text-[10px] text-slate-400 font-mono">{musicResult.modelUsed}</div>
                        </div>
                      </div>

                      <a
                        href={musicResult.audioUrl}
                        download="nexus-ai-generated-track.wav"
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .WAV</span>
                      </a>
                    </div>

                    {/* Standard Audio Player */}
                    <audio
                      ref={audioPlayerRef}
                      src={musicResult.audioUrl}
                      controls
                      className="w-full h-10 rounded-lg accent-fuchsia-500"
                    />

                    {musicResult.lyrics && (
                      <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-300 italic border border-slate-800">
                        "{musicResult.lyrics}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 pt-4 border-t border-slate-800 mt-6 flex items-center justify-between">
              <span>Powered by Lyria 3 Clip & Pro models</span>
              <span>PCM 24kHz Audio Stream</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. IMAGE STUDIO TAB (Gemini Nano Banana 2.1) */}
      {/* ========================================================================= */}
      {activeSubTab === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span>Create & Edit Images</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                gemini-nano-banana-2.1
              </span>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setImageMode('create')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  imageMode === 'create'
                    ? 'bg-indigo-950/60 border-indigo-500/60 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-extrabold text-white">Create New Image</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Generate from text prompt</div>
              </button>

              <button
                type="button"
                onClick={() => setImageMode('edit')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  imageMode === 'edit'
                    ? 'bg-indigo-950/60 border-indigo-500/60 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-extrabold text-white">Edit Existing Photo</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Upload image + modify with prompt</div>
              </button>
            </div>

            {/* If Edit Mode: Upload Image File */}
            {imageMode === 'edit' && (
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Source Image to Edit</label>
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-700 hover:border-indigo-500 rounded-xl bg-slate-950/60 cursor-pointer transition-all">
                  {uploadImageBase64 ? (
                    <div className="relative group">
                      <img src={uploadImageBase64} alt="Source" className="max-h-36 rounded-lg object-contain" />
                      <span className="text-[10px] text-indigo-400 block mt-1 text-center font-bold">Click to change image</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-1 text-slate-400">
                      <Upload className="w-6 h-6 text-indigo-400" />
                      <span className="text-xs font-semibold">Upload Photo for Editing</span>
                      <span className="text-[10px] text-slate-500">PNG, JPG, WebP supported</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setUploadImageBase64)}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Aspect Ratio Selector */}
            {imageMode === 'create' && (
              <div>
                <label className="text-xs font-bold text-slate-300 mb-2 block">Aspect Ratio</label>
                <div className="flex items-center gap-2">
                  {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setImageAspectRatio(ratio)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        imageAspectRatio === ratio
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 block">
                {imageMode === 'create' ? 'Image Generation Prompt' : 'Modification Instructions'}
              </label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                placeholder={
                  imageMode === 'create'
                    ? 'E.g., High-tech architecture diagram with glowing neon links...'
                    : 'E.g., Change the lighting to cyberpunk neon blue and add futuristic holographic data overlays...'
                }
              />
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || !imagePrompt.trim() || (imageMode === 'edit' && !uploadImageBase64)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {isGeneratingImage ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing with Gemini Nano Banana 2.1...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>{imageMode === 'create' ? 'Generate Image' : 'Apply Edits to Image'}</span>
                </>
              )}
            </button>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-xs font-bold text-slate-300">Generated Visual</span>
                {imageResult && (
                  <a
                    href={imageResult.imageUrl}
                    download="nexus-ai-image.png"
                    className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-white"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </a>
                )}
              </div>

              {/* Error Notice */}
              {imageError && (
                <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 text-xs text-rose-300 space-y-1 mb-4">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Generation Message</span>
                  </div>
                  <p>{imageError}</p>
                  <p className="text-[11px] text-rose-400">
                    Note: gemini-nano-banana-2.1 requires an authorized API key with image generation permissions.
                  </p>
                </div>
              )}

              {/* Empty State */}
              {!imageResult && !imageError && (
                <div className="h-72 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-indigo-400/50" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-300">No Image Generated Yet</div>
                    <div className="text-[11px] text-slate-400 mt-1 max-w-xs">
                      Provide a prompt or upload an image to edit with gemini-nano-banana-2.1.
                    </div>
                  </div>
                </div>
              )}

              {/* Image Result Display */}
              {imageResult && (
                <div className="space-y-3">
                  <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                    <img
                      src={imageResult.imageUrl}
                      alt="Generated AI artwork"
                      className="w-full max-h-[420px] object-contain mx-auto"
                    />
                  </div>
                  {imageResult.textDescription && (
                    <p className="text-xs text-slate-400 italic">
                      {imageResult.textDescription}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 pt-4 border-t border-slate-800 mt-6 flex items-center justify-between">
              <span>Model: gemini-nano-banana-2.1</span>
              <span>1K Resolution Native Output</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VEO VIDEO STUDIO TAB (Veo 3.1) */}
      {/* ========================================================================= */}
      {activeSubTab === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <Video className="w-4 h-4 text-cyan-400" />
                <span>Veo 3 Video Generator & Animator</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                veo-3.1-fast-generate-preview
              </span>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVideoMode('text')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  videoMode === 'text'
                    ? 'bg-cyan-950/60 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-extrabold text-white">Generate Video from Text</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Veo 3 text-to-video</div>
              </button>

              <button
                type="button"
                onClick={() => setVideoMode('animate')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  videoMode === 'animate'
                    ? 'bg-cyan-950/60 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-extrabold text-white">Animate Photo into Video</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Upload photo + add motion</div>
              </button>
            </div>

            {/* Aspect Ratio Selector (16:9 or 9:16) */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 block">Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVideoAspectRatio('16:9')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    videoAspectRatio === '16:9'
                      ? 'bg-cyan-600 text-white border-cyan-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold">16:9 Widescreen</div>
                  <div className="text-[10px] opacity-80">Presentations, YouTube, Desktop</div>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoAspectRatio('9:16')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    videoAspectRatio === '9:16'
                      ? 'bg-cyan-600 text-white border-cyan-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold">9:16 Vertical</div>
                  <div className="text-[10px] opacity-80">Reels, Shorts, Mobile</div>
                </button>
              </div>
            </div>

            {/* If Animate Mode: Upload Photo */}
            {videoMode === 'animate' && (
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Source Photo to Animate</label>
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-700 hover:border-cyan-500 rounded-xl bg-slate-950/60 cursor-pointer transition-all">
                  {videoSourceImage ? (
                    <div className="relative group">
                      <img src={videoSourceImage} alt="Source" className="max-h-36 rounded-lg object-contain" />
                      <span className="text-[10px] text-cyan-400 block mt-1 text-center font-bold">Click to change source photo</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-1 text-slate-400">
                      <Upload className="w-6 h-6 text-cyan-400" />
                      <span className="text-xs font-semibold">Upload Photo for Video Animation</span>
                      <span className="text-[10px] text-slate-500">Supports PNG and JPG</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setVideoSourceImage)}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 block">
                {videoMode === 'text' ? 'Cinematic Video Prompt' : 'Camera Motion & Animation Description'}
              </label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                placeholder={
                  videoMode === 'text'
                    ? 'E.g., Drone camera orbiting futuristic semiconductor fabrication facility with liquid nitrogen mist...'
                    : 'E.g., The camera gently zooms into the central hologram while subtle light particles drift across the screen...'
                }
              />
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo || !videoPrompt.trim() || (videoMode === 'animate' && !videoSourceImage)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {isGeneratingVideo ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Veo 3.1 Rendering Video...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  <span>{videoMode === 'text' ? 'Generate Video with Veo 3.1' : 'Animate Photo with Veo 3.1'}</span>
                </>
              )}
            </button>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-xs font-bold text-slate-300">Veo Video Output</span>
                {videoResultUrl && (
                  <a
                    href={videoResultUrl}
                    download="nexus-ai-veo-video.mp4"
                    className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-white"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4</span>
                  </a>
                )}
              </div>

              {/* Error Notice */}
              {videoError && (
                <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 text-xs text-rose-300 space-y-1 mb-4">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Video Engine Message</span>
                  </div>
                  <p>{videoError}</p>
                  <p className="text-[11px] text-rose-400">
                    Note: veo-3.1-fast-generate-preview requires an authorized API key with video generation access.
                  </p>
                </div>
              )}

              {/* Progress Polling Banner */}
              {videoPollStatus && (
                <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-4 text-xs text-cyan-300 flex items-center space-x-3 mb-4 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400 flex-shrink-0" />
                  <span>{videoPollStatus}</span>
                </div>
              )}

              {/* Empty State */}
              {!videoResultUrl && !videoError && !videoPollStatus && (
                <div className="h-72 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center">
                    <Film className="w-8 h-8 text-cyan-400/50" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-300">No Video Rendered Yet</div>
                    <div className="text-[11px] text-slate-400 mt-1 max-w-xs">
                      Generate from text or animate a photo in 16:9 or 9:16 aspect ratio using Veo 3.1.
                    </div>
                  </div>
                </div>
              )}

              {/* Video Player */}
              {videoResultUrl && (
                <div className="space-y-3">
                  <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
                    <video
                      src={videoResultUrl}
                      controls
                      autoPlay
                      loop
                      className={`w-full max-h-[420px] object-contain mx-auto ${
                        videoAspectRatio === '9:16' ? 'max-w-[280px]' : ''
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 pt-4 border-t border-slate-800 mt-6 flex items-center justify-between">
              <span>Model: veo-3.1-fast-generate-preview</span>
              <span>720p Resolution • 16:9 / 9:16</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
