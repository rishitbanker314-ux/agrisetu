'use client';

import { Activity, Radio, AlertCircle, Wifi, Database, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface AcousticBiosphereProps {
  moisture: number; // Used as the baseline to simulate health/stress probability
}

interface AcousticEvent {
  id: string;
  timestamp: Date;
  type: 'CAVITATION' | 'ROOT_EXTENSION' | 'MICRO_FRACTURE' | 'SOIL_SHIFT';
  amplitude: number; // 0 to 100
  frequency: number; // kHz
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
}

export default function AcousticBiosphere({ moisture }: AcousticBiosphereProps) {
  const [pulse, setPulse] = useState(false);
  const [events, setEvents] = useState<AcousticEvent[]>([]);
  const [connectionState, setConnectionState] = useState<'CONNECTING' | 'CONNECTED'>('CONNECTING');
  
  // Audio Context State
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const stressProbability = Math.max(0.05, (100 - moisture) / 100); // 5% to 100% chance of stress events
  
  // Initialize Web Audio API
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return; // Browser doesn't support Web Audio API
      
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      
      // Create global analyser for the oscilloscope
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
    }
    
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setAudioEnabled(true);
  };

  const toggleAudio = () => {
    if (audioEnabled) {
      if (audioCtxRef.current?.state === 'running') {
        audioCtxRef.current.suspend();
      }
      setAudioEnabled(false);
    } else {
      initAudio();
    }
  };

  // Synthesize realistic acoustic signatures
  const playEventSound = (type: AcousticEvent['type'], amplitude: number) => {
    if (!audioEnabled || !audioCtxRef.current || !analyserRef.current) return;
    
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Connect through the analyser so we can visualize it
    osc.connect(gain);
    gain.connect(analyserRef.current);
    
    const now = ctx.currentTime;
    
    // Scale volume by amplitude, but keep it pleasant
    const vol = (amplitude / 100) * 0.15;
    
    if (type === 'CAVITATION') {
      // High pitch snap (water column snapping under tension)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(4000 + Math.random() * 4000, now); // 4kHz-8kHz
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'MICRO_FRACTURE') {
      // Mid pitch crack (soil matrix fracturing)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1500 + Math.random() * 1000, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'ROOT_EXTENSION') {
      // Low thud (root pushing through soil)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100 + Math.random() * 100, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.2);
      gain.gain.setValueAtTime(vol * 1.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      // Soil shift (low rumble, approximated with square wave + fast decay)
      osc.type = 'square';
      osc.frequency.setValueAtTime(60 + Math.random() * 40, now);
      gain.gain.setValueAtTime(vol * 0.5, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  };

  // Oscilloscope Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let phase = 0;
    
    // Set internal canvas resolution to match display size exactly for crisp lines
    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      
      const width = canvas.width;
      const height = canvas.height;
      
      // Dynamic fade out to create a trailing effect
      ctx.fillStyle = 'rgba(250, 249, 245, 0.2)'; // paper-ivory equivalent
      ctx.fillRect(0, 0, width, height);
      
      ctx.lineWidth = 2 * window.devicePixelRatio;
      ctx.strokeStyle = '#22c55e'; // moss green
      
      ctx.beginPath();
      
      if (audioEnabled && analyserRef.current) {
        // Draw actual audio data
        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);
        
        const sliceWidth = width / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0; // 0 to 2
          const y = v * (height / 2);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
      } else {
        // Draw a flat baseline with subtle noise when audio is off/idle
        phase += 0.05;
        const sliceWidth = width / 100;
        let x = 0;
        for (let i = 0; i < 100; i++) {
          const noise = (Math.random() - 0.5) * 4 * window.devicePixelRatio;
          const y = (height / 2) + Math.sin(phase + i * 0.1) * 2 + noise;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
      }
      
      ctx.stroke();
    };
    
    draw();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [audioEnabled]);

  // Simulate WebSocket Connection Delay
  useEffect(() => {
    const timer = setTimeout(() => setConnectionState('CONNECTED'), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Simulate Live IoT Stream Data Generation
  useEffect(() => {
    if (connectionState !== 'CONNECTED') return;

    const streamInterval = setInterval(() => {
      if (Math.random() < 0.4 + (stressProbability * 0.4)) {
        const isStressEvent = Math.random() < stressProbability;
        
        let type: AcousticEvent['type'] = 'SOIL_SHIFT';
        if (isStressEvent) {
          type = Math.random() > 0.3 ? 'CAVITATION' : 'MICRO_FRACTURE';
        } else {
          type = Math.random() > 0.5 ? 'ROOT_EXTENSION' : 'SOIL_SHIFT';
        }

        const amplitude = 20 + Math.random() * (isStressEvent ? 80 : 40);
        
        const newEvent: AcousticEvent = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
          type,
          amplitude,
          frequency: isStressEvent ? 120 + Math.random() * 80 : 20 + Math.random() * 50,
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80,
        };

        setEvents(prev => [newEvent, ...prev].slice(0, 8)); // Keep last 8 events
        
        // Synthesize the audio for this event!
        playEventSound(type, amplitude);
      }
    }, 600);

    return () => clearInterval(streamInterval);
  }, [connectionState, stressProbability, audioEnabled]);

  // Radar Pulse UI Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 800);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getEventColor = (type: AcousticEvent['type']) => {
    switch (type) {
      case 'CAVITATION': return 'text-red-500';
      case 'MICRO_FRACTURE': return 'text-orange-500';
      case 'ROOT_EXTENSION': return 'text-green-500';
      case 'SOIL_SHIFT': return 'text-blue-400';
    }
  };

  const getEventBgColor = (type: AcousticEvent['type']) => {
    switch (type) {
      case 'CAVITATION': return 'bg-red-500';
      case 'MICRO_FRACTURE': return 'bg-orange-500';
      case 'ROOT_EXTENSION': return 'bg-green-500';
      case 'SOIL_SHIFT': return 'bg-blue-400';
    }
  };

  return (
    <div className="flex flex-col h-full font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-soft-line pb-4 gap-3">
        <h2 className="text-lg font-medium text-deep-forest flex items-center gap-2">
          <Radio className="w-5 h-5 text-moss"/>
          Acoustic Biosphere
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={toggleAudio}
            className={`flex items-center gap-2 border px-3 py-1.5 rounded text-[10px] font-medium tracking-widest uppercase transition-colors ${audioEnabled ? 'bg-moss/10 border-moss/30 text-moss' : 'bg-paper-ivory border-soft-line text-ink/50 hover:text-ink/80'}`}
            title="Toggle Live Audio Stream"
          >
            {audioEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            {audioEnabled ? 'Audio Live' : 'Enable Audio'}
          </button>
          <div className="hidden md:flex items-center gap-2 bg-paper-ivory border border-soft-line px-3 py-1.5 rounded text-ink/70 text-[10px] font-medium tracking-widest uppercase">
            <Database className="w-3 h-3" />
            Sensor Array 04
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-medium tracking-widest uppercase transition-colors ${connectionState === 'CONNECTED' ? 'bg-moss/10 text-moss' : 'bg-yellow-500/10 text-yellow-600'}`}>
            <Wifi className="w-3 h-3" />
            {connectionState === 'CONNECTED' ? 'Stream Active' : 'Connecting...'}
            {connectionState === 'CONNECTED' && <span className={`w-2 h-2 rounded-full ${pulse ? 'bg-moss' : 'bg-moss/30'} transition-colors duration-200 ml-1`}></span>}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center flex-grow">
        
        {/* Radar Visualization */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 bg-deep-forest rounded-full border-4 border-paper-ivory shadow-xl overflow-hidden flex-shrink-0 mx-auto">
          {/* Radar Grid Lines */}
          <div className="absolute inset-0 rounded-full border border-gray-700 m-8"></div>
          <div className="absolute inset-0 rounded-full border border-gray-700 m-16"></div>
          <div className="absolute inset-0 rounded-full border border-gray-700 m-24"></div>
          <div className="absolute w-full h-px bg-gray-700 top-1/2 -translate-y-1/2"></div>
          <div className="absolute h-full w-px bg-gray-700 left-1/2 -translate-x-1/2"></div>

          {/* Sweeping Scanner Element */}
          <div 
            className="absolute inset-0 origin-center animate-spin" 
            style={{ 
              background: 'conic-gradient(from 0deg, transparent 70%, rgba(168, 85, 247, 0.4) 100%)',
              animationDuration: '4s',
              animationTimingFunction: 'linear' 
            }}
          ></div>
          
          {/* Live Dynamic Radar Blips */}
          {events.map((evt) => (
            <div
              key={evt.id}
              className={`absolute rounded-full transition-opacity duration-1000 animate-pulse ${getEventBgColor(evt.type)}`}
              style={{
                left: `${evt.x}%`,
                top: `${evt.y}%`,
                width: `${Math.max(4, evt.amplitude / 10)}px`,
                height: `${Math.max(4, evt.amplitude / 10)}px`,
                boxShadow: `0 0 12px 2px ${getEventBgColor(evt.type)}80`,
                transform: 'translate(-50%, -50%)',
              }}
            ></div>
          ))}

          {/* Depth labels */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 font-mono">0cm</div>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 font-mono">-10cm</div>
          <div className="absolute top-20 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 font-mono">-25cm</div>
          <div className="absolute top-28 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 font-mono">-50cm</div>
        </div>

        {/* Live Data Terminal */}
        <div className="flex flex-col gap-4 w-full flex-grow h-full">
          
          {/* Authentic Real-Time Canvas Oscilloscope */}
          <div className="bg-paper-ivory/50 border border-soft-line p-4 rounded-lg flex flex-col h-32 relative overflow-hidden group">
            <div className="absolute inset-0 z-0">
              <canvas 
                ref={canvasRef} 
                className="w-full h-full opacity-70"
              />
            </div>
            
            <div className="absolute top-3 left-3 flex justify-between w-[calc(100%-24px)] z-10 pointer-events-none">
              <span className="text-[10px] font-sans font-medium text-ink/50 uppercase tracking-widest">
                Real-Time Oscilloscope {audioEnabled ? '(LIVE AUDIO)' : '(MUTED)'}
              </span>
            </div>
            
            {!audioEnabled && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-paper-ivory/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={toggleAudio}
                  className="bg-moss text-white px-4 py-2 rounded-full text-xs font-medium shadow-sm flex items-center gap-2"
                >
                  <Volume2 className="w-3 h-3" /> Enable Audio Context
                </button>
              </div>
            )}
          </div>

          {/* Live Event Stream Log */}
          <div className="bg-[#1e1e1e] rounded-lg p-4 font-mono text-xs overflow-hidden flex flex-col h-64 border border-soft-line shadow-inner">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
              <span className="text-gray-400 font-medium tracking-widest uppercase text-[10px]">Sensor Stream Log</span>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {connectionState === 'CONNECTING' ? (
                <div className="text-gray-500 animate-pulse">Establishing secure WebSocket connection to IoT gateway...</div>
              ) : events.length === 0 ? (
                <div className="text-gray-500">Listening for acoustic anomalies...</div>
              ) : (
                events.map(evt => (
                  <div key={evt.id} className="flex gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
                    <span className="text-gray-500 shrink-0">
                      [{evt.timestamp.toISOString().substring(11, 23)}]
                    </span>
                    <span className={`font-semibold shrink-0 w-32 ${getEventColor(evt.type)}`}>
                      {evt.type}
                    </span>
                    <span className="text-gray-300 truncate">
                      Amp: {evt.amplitude.toFixed(1)}dB | Freq: {evt.frequency.toFixed(1)}kHz
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Legend / Info */}
          <div className="bg-moss/5 border border-moss/20 p-3 rounded-lg flex items-start gap-3 mt-auto">
             <AlertCircle className="w-4 h-4 text-moss flex-shrink-0 mt-0.5" />
             <div>
               <span className="text-xs font-sans font-medium text-moss block mb-1">Acoustic Cavitation Analysis</span>
               <p className="text-[10px] text-ink/70 font-sans leading-tight">
                 Plant roots emit ultrasonic acoustic emissions (cavitation) under water stress. This module uses the Web Audio API to synthesize real-time frequency data from subterranean micro-fractures, allowing early detection of wilting.
               </p>
             </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4b5563;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
