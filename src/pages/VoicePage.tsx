import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Button } from '@/components/ui/button';

interface WebSpeechRecognitionResultEvent {
    resultIndex: number;
    results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

type WebSpeechRecognition = {
    start: () => void;
    stop: () => void;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: WebSpeechRecognitionResultEvent) => void) | null;
};

const VoicePage: React.FC = () => {
    const navigate = useNavigate();
    const webRecognitionRef = useRef<WebSpeechRecognition | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [hasPermission, setHasPermission] = useState(false);
    const [isNativeAvailable, setIsNativeAvailable] = useState(false);

    useEffect(() => {
        let mounted = true;

        const setup = async () => {
            try {
                const { available } = await SpeechRecognition.available();
                if (!mounted) return;

                setIsNativeAvailable(available);

                if (available) {
                    const permission = await SpeechRecognition.requestPermissions();
                    if (!mounted) return;
                    setHasPermission(permission.speechRecognition === 'granted');
                    await SpeechRecognition.addListener('partialResults', (data) => {
                        setTranscript(data.matches?.[0] ?? '');
                    });
                    return;
                }

                const SpeechCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                if (!SpeechCtor) {
                    setHasPermission(false);
                    return;
                }

                const webRecognition: WebSpeechRecognition = new SpeechCtor();
                webRecognition.lang = 'en-US';
                webRecognition.continuous = true;
                webRecognition.interimResults = true;
                webRecognition.onresult = (event) => {
                    let combined = '';
                    for (let i = event.resultIndex; i < event.results.length; i += 1) {
                        combined += event.results[i][0].transcript;
                    }
                    setTranscript(combined.trim());
                };

                webRecognitionRef.current = webRecognition;
                setHasPermission(true);
            } catch (error) {
                console.error('Voice setup failed:', error);
                setHasPermission(false);
                toast.error('Voice setup failed.');
            }
        };

        setup();

        return () => {
            mounted = false;
            SpeechRecognition.removeAllListeners();
            webRecognitionRef.current?.stop();
        };
    }, []);

    const startRecording = async () => {
        if (!hasPermission) {
            toast.error('Speech permission required.');
            return;
        }

        try {
            if (isNativeAvailable) {
                await SpeechRecognition.start({
                    language: 'en-US',
                    maxResults: 1,
                    prompt: 'Say your mission...',
                    partialResults: true,
                    popup: false,
                });
            } else if (webRecognitionRef.current) {
                webRecognitionRef.current.start();
            }

            setIsRecording(true);
            toast.success('Recording started.');
        } catch (error) {
            console.error('Failed to start recording:', error);
            setIsRecording(false);
            toast.error('Failed to start recording.');
        }
    };

    const stopRecording = async () => {
        try {
            if (isNativeAvailable) {
                await SpeechRecognition.stop();
            } else {
                webRecognitionRef.current?.stop();
            }
            setIsRecording(false);
            toast.success('Recording stopped.');
        } catch (error) {
            console.error('Failed to stop recording:', error);
            setIsRecording(false);
            toast.error('Failed to stop recording.');
        }
    };

    const toggleMic = async () => {
        if (isRecording) {
            await stopRecording();
            return;
        }
        await startRecording();
    };

    const deployAsMission = () => {
        if (!transcript.trim()) {
            toast.error('No transcript available.');
            return;
        }
        navigate(`/missions/new?title=${encodeURIComponent(transcript.trim())}`);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white px-6 py-10 flex flex-col items-center">
            <h1 className="text-xl font-black tracking-[0.18em] uppercase text-[#C8FF00]">VOICE</h1>
            <p className="mt-2 text-sm text-zinc-400 uppercase tracking-[0.12em]">Say your mission</p>

            <div className="mt-14">
                <motion.button
                    type="button"
                    onClick={toggleMic}
                    animate={isRecording ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                    transition={isRecording ? { repeat: Infinity, duration: 0.9 } : { duration: 0.2 }}
                    className={`h-28 w-28 rounded-full border-2 flex items-center justify-center transition-colors ${isRecording
                            ? 'bg-[#FF4444] border-[#FF4444]'
                            : 'bg-[#1C1C1C] border-zinc-700'
                        }`}
                >
                    {isRecording ? <Square className="w-10 h-10 text-white fill-white" /> : <Mic className="w-10 h-10 text-[#C8FF00]" />}
                </motion.button>
            </div>

            <div className="mt-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-[#141414] p-4 min-h-28">
                <p className="text-xs text-zinc-500 uppercase tracking-[0.12em] mb-2">Transcript</p>
                <p className="text-sm text-zinc-200">{transcript || 'Waiting for input...'}</p>
            </div>

            {!!transcript.trim() && (
                <Button
                    type="button"
                    onClick={deployAsMission}
                    className="mt-6 w-full max-w-md h-11 bg-[#C8FF00] text-black hover:bg-[#b8ef00] font-black uppercase tracking-[0.14em]"
                >
                    DEPLOY AS MISSION
                </Button>
            )}
        </div>
    );
};

export default VoicePage;
