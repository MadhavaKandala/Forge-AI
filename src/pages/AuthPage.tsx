import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';

const OTP_LENGTH = 6;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthPage: React.FC = () => {
    const navigate = useNavigate();
    const requestOtp = useAppStore((s) => s.requestOtp);
    const verifyOtp = useAppStore((s) => s.verifyOtp);

    const [email, setEmail] = useState('');
    const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [isOtpScreen, setIsOtpScreen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const otp = useMemo(() => otpDigits.join(''), [otpDigits]);

    const validateEmail = (value: string): boolean => emailRegex.test(value.trim());

    const handleSendOtp = async () => {
        if (!validateEmail(email)) {
            toast.error('Enter valid email.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            await requestOtp(email);
            setIsOtpScreen(true);
            toast.success('OTP sent.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerify = async () => {
        if (otp.length !== OTP_LENGTH) {
            toast.error('Enter 6-digit code.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            const ok = await verifyOtp(email, otp);
            if (ok) {
                toast.success('Authenticated.');
                navigate('/');
                return;
            }
            setError('Invalid code. Try again.');
            toast.error('Invalid code. Try again.');
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
                {!isOtpScreen ? (
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
                            disabled={isSubmitting}
                            className="w-full h-12 bg-[#C8FF00] text-black hover:bg-[#b8ef00] font-black tracking-[0.14em] uppercase"
                        >
                            SEND OTP
                        </Button>
                    </div>
                ) : (
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

                        <Button
                            type="button"
                            onClick={handleVerify}
                            disabled={isSubmitting}
                            className="w-full h-12 bg-[#C8FF00] text-black hover:bg-[#b8ef00] font-black tracking-[0.14em] uppercase"
                        >
                            VERIFY
                        </Button>

                        <button
                            type="button"
                            onClick={handleResend}
                            className="w-full text-center text-sm text-zinc-400 hover:text-[#C8FF00]"
                        >
                            Resend OTP
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthPage;
