import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  PhoneCall, 
  PhoneOff, 
  Radio, 
  Sparkles, 
  Activity, 
  RotateCcw, 
  Send, 
  AlertCircle,
  Headphones,
  CheckCircle2
} from 'lucide-react';

interface TranscriptEntry {
  id: string;
  sender: 'user' | 'model';
  text: string;
  time: string;
}

export const LiveVoiceView: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakingModel, setIsSpeakingModel] = useState(false);
  const [isSpeakingUser, setIsSpeakingUser] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([
    {
      id: 'welcome',
      sender: 'model',
      text: "NexusAI Voice Studio ready. Connect to start a live low-latency conversation with Zephyr Voice (Gemini 3.8 Live). You can practice system design interviews, ask rapid-fire architecture questions, or brainstorm AI roadmaps.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [textInput, setTextInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Audio & WebSocket references
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackQueueRef = useRef<{ buffer: AudioBuffer; startTime: number }[]>([]);
  const nextPlayTimeRef = useRef<number>(0);
  const currentSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnectSession();
    };
  }, []);

  // Convert raw 24kHz Int16 PCM base64 string to an AudioBuffer
  const pcmToAudioBuffer = (base64Audio: string, audioCtx: AudioContext): AudioBuffer => {
    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.copyToChannel(float32Array, 0);
    return audioBuffer;
  };

  // Play model PCM audio chunk smoothly in sequence
  const queueAudioChunk = (base64Audio: string) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const buffer = pcmToAudioBuffer(base64Audio, ctx);
    const now = ctx.currentTime;
    const startTime = Math.max(now, nextPlayTimeRef.current);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(startTime);

    currentSourceNodeRef.current = source;
    nextPlayTimeRef.current = startTime + buffer.duration;

    setIsSpeakingModel(true);
    source.onended = () => {
      if (ctx.currentTime >= nextPlayTimeRef.current - 0.05) {
        setIsSpeakingModel(false);
      }
    };
  };

  // Stop playback immediately upon user interruption
  const stopPlayback = () => {
    if (currentSourceNodeRef.current) {
      try {
        currentSourceNodeRef.current.stop();
      } catch {}
      currentSourceNodeRef.current = null;
    }
    if (audioContextRef.current) {
      nextPlayTimeRef.current = audioContextRef.current.currentTime;
    }
    setIsSpeakingModel(false);
  };

  // Convert microphone Float32Array to 16kHz Int16 PCM Base64
  const processMicBuffer = (inputData: Float32Array, inputSampleRate: number) => {
    if (isMuted || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    // Calculate audio level for visualizer
    let sum = 0;
    for (let i = 0; i < inputData.length; i++) {
      sum += inputData[i] * inputData[i];
    }
    const rms = Math.sqrt(sum / inputData.length);
    const level = Math.min(100, Math.round(rms * 250));
    setAudioLevel(level);
    setIsSpeakingUser(level > 15);

    // Downsample to 16000Hz if needed
    const targetSampleRate = 16000;
    const compression = inputSampleRate / targetSampleRate;
    const length = Math.floor(inputData.length / compression);
    const result = new Int16Array(length);

    let index = 0;
    let inputIndex = 0;
    while (index < length) {
      const sample = Math.max(-1, Math.min(1, inputData[Math.floor(inputIndex)]));
      result[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      index++;
      inputIndex += compression;
    }

    // Convert Int16Array to Base64
    const uint8 = new Uint8Array(result.buffer);
    let binary = '';
    const chunkLen = 8192;
    for (let i = 0; i < uint8.length; i += chunkLen) {
      const chunk = uint8.subarray(i, i + chunkLen);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64 = btoa(binary);

    wsRef.current.send(JSON.stringify({ audio: base64 }));
  };

  // Start Live Session
  const connectSession = async () => {
    setErrorMessage(null);
    setIsConnecting(true);

    try {
      // 1. Initialize AudioContext
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      // 2. Request User Media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      // 3. Setup Audio Processing Node
      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        processMicBuffer(inputData, audioCtx.sampleRate);
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

      // 4. Connect WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setTranscripts((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: 'model',
            text: "Connected to Gemini 3.8 Live session! You can start speaking into your microphone now.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            setErrorMessage(data.error);
          }
          if (data.interrupted) {
            stopPlayback();
          }
          if (data.audio) {
            queueAudioChunk(data.audio);
          }
          if (data.text) {
            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.sender === 'model' && !last.text.endsWith('.')) {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: last.text + ' ' + data.text },
                ];
              }
              return [
                ...prev,
                {
                  id: `mod-${Date.now()}`,
                  sender: 'model',
                  text: data.text,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ];
            });
          }
        } catch (err) {
          console.error('Error handling WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('Live WebSocket error:', err);
        setErrorMessage('WebSocket connection error. Please verify server connectivity.');
        setIsConnecting(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };
    } catch (err: any) {
      console.error('Connection failed:', err);
      setErrorMessage(err.message || 'Microphone access denied or browser AudioContext error.');
      setIsConnecting(false);
      disconnectSession();
    }
  };

  // Disconnect session and release hardware
  const disconnectSession = () => {
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }
    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      micStreamRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeakingModel(false);
    setIsSpeakingUser(false);
    setAudioLevel(0);
  };

  // Send optional text to live session
  const handleSendText = () => {
    if (!textInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({ text: textInput.trim() }));
    setTranscripts((prev) => [
      ...prev,
      {
        id: `usr-${Date.now()}`,
        sender: 'user',
        text: textInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setTextInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
                GEMINI 3.8 LIVE • ULTRA LOW-LATENCY WEBSOCKET
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">• Bidirectional Audio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Real-Time Voice Conversations
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Talk directly with an AI Principal Architect in natural spoken English with sub-second response times using Gemini 3.8 Live and Zephyr prebuilt voice.
            </p>
          </div>

          {/* Connect / Disconnect Action */}
          <div className="flex items-center space-x-3">
            {!isConnected ? (
              <button
                onClick={connectSession}
                disabled={isConnecting}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting Live...' : 'Start Voice Conversation'}</span>
              </button>
            ) : (
              <button
                onClick={disconnectSession}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 flex items-center space-x-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <div className="flex-1">
            <span className="font-bold">Session Notice: </span>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-rose-400 hover:text-white underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Voice Status & Visualizer Stage */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center relative overflow-hidden shadow-xl">
        <div className="max-w-md mx-auto space-y-4">
          {/* Avatar / Status Ring */}
          <div className="relative inline-block">
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
                isSpeakingModel
                  ? 'bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 shadow-2xl shadow-purple-500/50 scale-105 animate-pulse'
                  : isSpeakingUser
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-2xl shadow-emerald-500/40 scale-105'
                  : isConnected
                  ? 'bg-indigo-900/60 border-2 border-indigo-500/50'
                  : 'bg-slate-800 border-2 border-slate-700'
              }`}
            >
              <div className="w-24 h-24 rounded-full bg-slate-950 flex flex-col items-center justify-center">
                {isSpeakingModel ? (
                  <Sparkles className="w-10 h-10 text-purple-400 animate-spin" />
                ) : isSpeakingUser ? (
                  <Mic className="w-10 h-10 text-emerald-400 animate-bounce" />
                ) : (
                  <Headphones className="w-10 h-10 text-slate-400" />
                )}
              </div>
            </div>

            {/* Live Indicator Dot */}
            {isConnected && (
              <span className="absolute bottom-1 right-2 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full animate-ping"></span>
            )}
          </div>

          {/* State Text */}
          <div>
            <div className="text-lg font-bold text-white">
              {isSpeakingModel
                ? 'Zephyr is speaking...'
                : isSpeakingUser
                ? 'Listening to you...'
                : isConnected
                ? 'Connected • Ready for your voice'
                : 'Offline • Click Start to Talk'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Model: <span className="text-purple-300 font-mono">gemini-3.8-live</span> • Voice: <span className="text-purple-300 font-semibold">Zephyr</span> • Low Latency
            </p>
          </div>

          {/* Waveform Visualizer Bars */}
          <div className="flex items-center justify-center gap-1.5 h-12 pt-2">
            {[...Array(24)].map((_, i) => {
              const active = isSpeakingModel || isSpeakingUser;
              const barHeight = active
                ? Math.max(8, (Math.sin(i * 0.4 + Date.now() * 0.005) * 20 + 25) * (audioLevel / 40 + 0.5))
                : 6;

              return (
                <div
                  key={i}
                  style={{ height: `${Math.min(48, Math.max(6, barHeight))}px` }}
                  className={`w-1.5 rounded-full transition-all duration-75 ${
                    isSpeakingModel
                      ? 'bg-purple-400'
                      : isSpeakingUser
                      ? 'bg-emerald-400'
                      : 'bg-slate-800'
                  }`}
                />
              );
            })}
          </div>

          {/* Controls Bar */}
          {isConnected && (
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isMuted
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                <span>{isMuted ? 'Microphone Muted' : 'Mute Mic'}</span>
              </button>

              <button
                onClick={stopPlayback}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-all cursor-pointer"
                title="Interrupt and stop model audio"
              >
                <VolumeX className="w-4 h-4 text-amber-400" />
                <span>Interrupt</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Transcript & Fallback Text Input */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col h-80 shadow-xl overflow-hidden">
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-300 font-bold">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Spoken Conversation Transcript</span>
          </div>
          <button
            onClick={() => setTranscripts([])}
            className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            Clear Transcript
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {transcripts.map((entry) => (
            <div
              key={entry.id}
              className={`flex flex-col ${entry.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs ${
                  entry.sender === 'user'
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 rounded-tl-none'
                }`}
              >
                <div className="text-[10px] text-slate-400 mb-0.5 flex items-center justify-between gap-3">
                  <span className="font-bold text-white/90">
                    {entry.sender === 'user' ? 'You' : 'Zephyr (Gemini 3.8 Live)'}
                  </span>
                  <span>{entry.time}</span>
                </div>
                <div>{entry.text}</div>
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>

        {/* Text fallback input */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              placeholder={isConnected ? "Send text to live session (optional)..." : "Connect first to chat via text or voice..."}
              disabled={!isConnected}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 disabled:opacity-50"
            />
            <button
              onClick={handleSendText}
              disabled={!isConnected || !textInput.trim()}
              className="px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
