import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, X } from 'lucide-react';
import { useVoiceStore } from '@/store/useVoiceStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

export const VoiceRecorder: React.FC = () => {
    const {
        isRecording,
        isProcessing,
        startRecording,
        stopRecording,
        setLiveTranscript,
        liveTranscript,
        clearState
    } = useVoiceStore();

    const [duration, setDuration] = useState(0);
    const recognitionRef = useRef<any>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const platform = Capacitor.getPlatform();

    useEffect(() => {
        const setupListeners = async () => {
            if (platform !== 'web') {
                await SpeechRecognition.addListener('partialResults', (data: any) => {
                    if (data.matches && data.matches.length > 0) {
                        setLiveTranscript(data.matches[0]);
                    }
                });
            }
        };

        setupListeners();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (platform === 'web') {
                if (recognitionRef.current) recognitionRef.current.stop();
            } else {
                SpeechRecognition.stop();
                SpeechRecognition.removeAllListeners();
            }
        };
    }, [platform]);

    const handleStart = async () => {
        // Handle Permissions
        if (platform !== 'web') {
            const perm = await SpeechRecognition.checkPermissions();
            if (perm.speechRecognition !== 'granted') {
                const request = await SpeechRecognition.requestPermissions();
                if (request.speechRecognition !== 'granted') {
                    alert('Microphone/Speech permission is required to use this feature.');
                    return;
                }
            }
        } else if (!('webkitSpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        startRecording();
        setDuration(0);

        timerRef.current = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);

        if (platform === 'web') {
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setLiveTranscript(liveTranscript + event.results[i][0].transcript);
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setLiveTranscript(liveTranscript + interimTranscript);
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                handleStop();
            };

            recognition.start();
            recognitionRef.current = recognition;
        } else {
            await SpeechRecognition.start({
                language: 'en-US',
                maxResults: 1,
                prompt: 'Say something...',
                partialResults: true,
                popup: false,
            });
        }
    };

    const handleStop = async () => {
        if (timerRef.current) clearInterval(timerRef.current);

        // Give a tiny delay for final bits of audio to be processed
        if (platform !== 'web') {
            await SpeechRecognition.stop();
            // Wait a moment for any last partial result updates
            await new Promise(resolve => setTimeout(resolve, 500));
        } else {
            if (recognitionRef.current) recognitionRef.current.stop();
        }

        const finalTranscript = liveTranscript.trim();
        if (!finalTranscript) {
            alert('No voice captured. Please try again.');
            clearState();
            return;
        }

        stopRecording(finalTranscript, duration);
    };

    const formatDuration = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-8 bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
            {/* Background Pulse when recording */}
            <AnimatePresence>
                {isRecording && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1.2 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute inset-0 bg-primary/5 rounded-full filter blur-3xl -z-10"
                    />
                )}
            </AnimatePresence>

            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                    {isRecording ? 'Listening...' : isProcessing ? 'Processing...' : 'Voice Note'}
                </h2>
                <p className="text-zinc-400 text-sm">
                    {isRecording ? 'Tell me what you need to do...' : 'Tap the mic to start'}
                </p>
            </div>

            <div className="relative flex items-center justify-center">
                {isRecording && (
                    <div className="absolute -top-12 text-primary font-mono text-xl font-bold animate-pulse">
                        {formatDuration(duration)}
                    </div>
                )}

                <button
                    onClick={isRecording ? handleStop : handleStart}
                    disabled={isProcessing}
                    className={`
            relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500
            ${isRecording
                            ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] scale-110'
                            : 'bg-primary shadow-[0_0_20px_rgba(223,255,79,0.3)] hover:scale-105 active:scale-95'}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
                >
                    {isProcessing ? (
                        <Loader2 className="w-10 h-10 text-black animate-spin" />
                    ) : isRecording ? (
                        <Square className="w-10 h-10 text-white fill-white" />
                    ) : (
                        <Mic className="w-10 h-10 text-black" />
                    )}
                </button>
            </div>

            <div className="w-full max-w-xs h-32 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-4 overflow-y-auto custom-scrollbar">
                {liveTranscript ? (
                    <p className="text-zinc-200 text-sm italic leading-relaxed">
                        "{liveTranscript}"
                    </p>
                ) : (
                    <p className="text-zinc-600 text-sm text-center mt-8">
                        Transcription will appear here...
                    </p>
                )}
            </div>

            {(!isRecording && !isProcessing && liveTranscript) && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearState}
                    className="text-zinc-500 hover:text-white"
                >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                </Button>
            )}
        </div>
    );
};
