'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Volume2, X, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
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
      } else {
        setHasSpeechSupport(false);
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
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!hasSpeechSupport) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[500] flex flex-col items-end">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-4 w-[320px] bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white tracking-wide text-sm">Voice Copilot</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-4 flex-grow flex flex-col justify-end min-h-[150px] max-h-[300px] overflow-y-auto bg-gray-900/50">
              
              {error && <p className="text-red-400 text-sm font-medium mb-3">{error}</p>}
              
              {!isListening && !isProcessing && transcript && (
                <div className="mb-4 bg-gray-800/80 p-3 rounded-xl rounded-tr-sm self-end max-w-[85%] border border-gray-700">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">You</p>
                  <p className="text-sm text-gray-200">{transcript}</p>
                </div>
              )}

              {isProcessing && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-4 bg-emerald-900/20 p-3 rounded-xl self-start">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing context...
                </div>
              )}

              {!isListening && !isProcessing && response && (
                <div className="mb-4 bg-emerald-900/20 border border-emerald-800/50 p-3 rounded-xl rounded-tl-sm self-start max-w-[95%]">
                   <p className="text-xs text-emerald-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                     <Volume2 className="w-3 h-3"/> AI Response
                   </p>
                   <p className="text-sm text-white font-medium leading-relaxed">{response}</p>
                </div>
              )}
              
              {!isListening && !isProcessing && !transcript && !error && (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 font-medium">
                    Tap the mic and ask anything.
                  </p>
                </div>
              )}
            </div>

            {/* Mic Button Area */}
            <div className="p-4 border-t border-gray-800 flex justify-center bg-gray-900">
              <button 
                onClick={toggleListening}
                className={`relative p-4 rounded-full shadow-lg transition-all transform active:scale-95 \${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25' 
                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
                }`}
              >
                {isListening && (
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
                )}
                {isListening ? <MicOff className="w-6 h-6 text-white relative z-10" /> : <Mic className="w-6 h-6 text-white relative z-10" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-gray-900 border border-gray-700 hover:border-emerald-500 p-4 rounded-full shadow-2xl text-white flex items-center justify-center relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-green-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <MessageSquare className="w-7 h-7 text-emerald-400" />
        </motion.button>
      )}
    </div>
  );
}
