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
    <div className="bg-gray-800 rounded-md p-6 shadow-sm border-2 border-gray-900 text-white relative flex flex-col h-full">
      
      <div className="flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2">
              VOICE COPILOT
            </h3>
            <p className="text-gray-400 text-sm font-bold mt-1 uppercase tracking-widest">Ask any agronomy question</p>
          </div>
          
          <button 
            onClick={toggleListening}
            className={`p-4 rounded-sm border-2 border-gray-900 shadow-sm transition-all \${
              isListening 
                ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </button>
        </div>

        <div className="bg-gray-900 rounded-sm p-4 min-h-[80px] border-2 border-gray-700 flex flex-col justify-end">
          {error && <p className="text-red-400 text-sm font-bold">{error}</p>}
          
          {isListening && (
            <div className="flex items-center gap-2 text-green-400 text-sm font-black animate-pulse">
              LISTENING...
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-blue-400 text-sm font-black">
              <Loader2 className="w-4 h-4 animate-spin" />
              ANALYZING...
            </div>
          )}

          {!isListening && !isProcessing && transcript && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">YOU ASKED:</p>
              <p className="text-sm font-medium text-gray-300">"{transcript}"</p>
            </div>
          )}

          {!isListening && !isProcessing && response && (
            <div className="mt-2 border-t-2 border-gray-700 pt-3">
               <p className="text-xs text-green-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1"><Volume2 className="w-3 h-3"/> AI REPLIED:</p>
               <p className="text-sm text-white font-bold leading-relaxed">{response}</p>
            </div>
          )}
          
          {!isListening && !isProcessing && !transcript && !error && (
            <p className="text-sm text-gray-500 font-bold text-center my-auto">
              TAP THE MICROPHONE TO SPEAK
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
