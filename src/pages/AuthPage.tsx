import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { useHabitStore } from '@/store/useHabitStore';
import { seedDemoData } from '@/lib/demoData';

const OTP_LENGTH = 6;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type AuthScreen = 'email' | 'otp' | 'demo';

const AuthPage: React.FC = () => {
    const navigate = useNavigate();
    const requestOtp = useAppStore((s) => s.requestOtp);
    const verifyOtp = useAppStore((s) => s.verifyOtp);
    const authError = useAppStore((s) => s.authError);
    const otpLockUntil = useAppStore((s) => s.otpLockUntil);
    const clearAuthError = useAppStore((s) => s.clearAuthError);
    const markFreshStart = useHabitStore((s) => s.markFreshStart);

    const [email, setEmail] = useState('');
    const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [screen, setScreen] = useState<AuthScreen>('email');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [lockSeconds, setLockSeconds] = useState(0);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const otp = useMemo(() => otpDigits.join(''), [otpDigits]);
    const isLocked = lockSeconds > 0;

    useEffect(() => {
        if (!otpLockUntil) {
            setLockSeconds(0);
            return;
        }

        const tick = () => {
            const remaining = Math.max(0, Math.ceil((otpLockUntil - Date.now()) / 1000));
            setLockSeconds(remaining);
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [otpLockUntil]);

    useEffect(() => {
        if (authError) setError(authError);
    }, [authError]);

    const validateEmail = (value: string): boolean => emailRegex.test(value.trim());

    const handleSendOtp = async () => {
        if (isLocked) {
            setError(`Too many attempts. Try again in ${lockSeconds}s.`);
            return;
        }

        if (!validateEmail(email)) {
            toast.error('Enter valid email.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        clearAuthError();
        try {
            const sent = await requestOtp(email);
            if (sent) {
                setScreen('otp');
                setOtpDigits(Array(OTP_LENGTH).fill(''));
                toast.success('OTP sent.');
                return;
            }
            const message = useAppStore.getState().authError ?? 'Unable to send OTP.';
            setError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerify = async () => {
        if (isLocked) {
            setError(`Too many attempts. Try again in ${lockSeconds}s.`);
            return;
        }

        if (otp.length !== OTP_LENGTH) {
            toast.error('Enter 6-digit code.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        clearAuthError();
        try {
            const ok = await verifyOtp(email, otp);
            if (ok) {
                toast.success('OTP verified. Welcome to Forge AI.');
                setScreen('demo');
                return;
            }
            const message = useAppStore.getState().authError ?? 'Invalid code. Try again.';
            setError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        await handleSendOtp();
    };

    const handleOtpChange = (idx: number, value: string) => {
        const clean = value.replace(/\D/g, '').slice(-1);
        const next = [...otpDigits];
        next[idx] = clean;
        setOtpDigits(next);

        if (clean && idx < OTP_LENGTH - 1) {
            inputRefs.current[idx + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col px-6">
            <div className="pt-10">
                <h1 className="text-2xl font-mono font-black tracking-[0.2em] text-[#C8FF00]">FORGE AI</h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6">
                {screen === 'email' ? (
                    <div className="w-full max-w-sm space-y-5">
                        <p className="text-center text-sm font-black tracking-[0.18em] uppercase text-zinc-300">
                            ENTER YOUR EMAIL TO BEGIN
                        </p>

                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="h-12 bg-[#1C1C1C] border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:border-[#C8FF00]"
                        />

                        <Button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isSubmitting || isLocked}
                            className="w-full h-12 bg-[#C8FF00] text-black hover:bg-[#b8ef00] font-black tracking-[0.14em] uppercase"
                        >
                            SEND OTP
                        </Button>
                    </div>
                ) : screen === 'otp' ? (
                    <div className="w-full max-w-sm space-y-5">
                        <h2 className="text-center text-xl font-black uppercase tracking-[0.12em]">CHECK YOUR EMAIL</h2>
                        <p className="text-center text-sm text-zinc-400 break-all">{email}</p>

                        <div className="flex items-center justify-center gap-2">
                            {otpDigits.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => (inputRefs.current[idx] = el)}
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                    className="h-12 w-11 rounded-md bg-[#1C1C1C] border border-zinc-700 text-center text-xl font-black text-white focus:outline-none focus:border-[#C8FF00]"
                                />
                            ))}
                        </div>

                        {error && <p className="text-center text-sm text-[#FF4444]">{error}</p>}
                        {isLocked && (
                            <p className="text-center text-xs text-zinc-400">LOCKED FOR {lockSeconds}s</p>
                        )}

                        <Button
                            type="button"
                            onClick={handleVerify}
                            disabled={isSubmitting || isLocked}
                            className="w-full h-12 bg-[#C8FF00] text-black hover:bg-[#b8ef00] font-black tracking-[0.14em] uppercase"
                        >
                            VERIFY
                        </Button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isLocked}
                            className="w-full text-center text-sm text-zinc-400 hover:text-[#C8FF00] disabled:opacity-50"
                        >
                            Resend OTP
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-sm space-y-5">
                        <h2 className="text-center text-xl font-black uppercase tracking-[0.12em]">Want to see a sample schedule?</h2>
                        <p className="text-center text-sm text-zinc-400">
                            Load a demo day with meditation, code, gym, LeetCode, review, and sleep. Demo items stay local until you edit them.
                        </p>

                        <Button
                            type="button"
                            onClick={() => { seedDemoData(); navigate('/'); }}
                            className="w-full h-12 bg-[#C8FF00] text-black hover:bg-[#b8ef00] font-black tracking-[0.14em] uppercase"
                        >
                            LOAD DEMO
                        </Button>

                        <button
                            type="button"
                            onClick={() => { markFreshStart(); navigate('/'); }}
                            className="w-full text-center text-sm font-bold uppercase tracking-[0.12em] text-zinc-400 hover:text-[#C8FF00]"
                        >
                            START FRESH
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthPage;
