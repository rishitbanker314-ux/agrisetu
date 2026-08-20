'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceCopilotProps {
  fieldData: any;
  crop: string;
}

export default function VoiceCopilot({ fieldData, crop }: VoiceCopilotProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        // Optional: you can set lang here based on user preference, e.g., 'en-US', 'hi-IN'
        recognitionRef.current.lang = 'en-US'; 

        recognitionRef.current.onresult = async (event: any) => {
          const currentTranscript = event.results[0][0].transcript;
          setTranscript(currentTranscript);
          setIsListening(false);
          await processVoiceQuery(currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setError("Microphone error. Please try again.");
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [fieldData, crop]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setError(null);
      setTranscript('');
      setResponse('');
      setIsListening(true);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const processVoiceQuery = async (query: string) => {
    setIsProcessing(true);
    try {
      const { data, error: funcError } = await supabase.functions.invoke('advisory-engine', {
        body: {
          crop,
          language: 'English',
          fieldData,
          voice_query: query
        }
      });

      if (funcError) throw funcError;
      
      const responseText = data.recommendation_text;
      setResponse(responseText);
      speakResponse(responseText);
      
    } catch (err: any) {
      console.error(err);
      setError("Failed to get advice. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      // Optional: Set specific voice or language
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!recognitionRef.current) {
    return null; // Speech recognition not supported
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden group">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              Voice Copilot
            </h3>
            <p className="text-indigo-200 text-sm mt-1">Ask any agronomy question</p>
          </div>
          
          <button 
            onClick={toggleListening}
            className={`p-4 rounded-full shadow-lg transition-all \${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-500/30' 
                : 'bg-indigo-500 hover:bg-indigo-600 hover:scale-105'
            }`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>

        <div className="bg-black/20 rounded-2xl p-4 min-h-[100px] border border-white/10 backdrop-blur-sm flex flex-col justify-end">
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          
          {isListening && (
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-medium animate-pulse">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
              </div>
              Listening...
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              AI is analyzing...
            </div>
          )}

          {!isListening && !isProcessing && transcript && (
            <div className="mb-2">
              <p className="text-xs text-indigo-300 uppercase tracking-wider font-bold mb-1">You asked:</p>
              <p className="text-sm italic text-white/90">"{transcript}"</p>
            </div>
          )}

          {!isListening && !isProcessing && response && (
            <div className="mt-2 border-t border-white/10 pt-2">
               <p className="text-xs text-emerald-400 uppercase tracking-wider font-bold mb-1 flex items-center gap-1"><Volume2 className="w-3 h-3"/> AI replied:</p>
               <p className="text-sm text-white font-medium leading-relaxed">{response}</p>
            </div>
          )}
          
          {!isListening && !isProcessing && !transcript && !error && (
            <p className="text-sm text-white/50 text-center my-auto">
              Tap the microphone and ask: "Is it safe to add fertilizer today?"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
