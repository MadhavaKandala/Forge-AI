import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PillButton } from '@/components/ui/PillButton';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/store/useUserStore';
import { cn } from '@/lib/utils';
import { Bell, Info } from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';

const ctaStyle = { backgroundColor: '#C8FF00', color: '#000000' };

export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const { updateUser } = useUserStore();
    const [step, setStep] = useState<'privacy' | 'notifications' | 'name'>('privacy');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleAgree = () => {
        setStep('notifications');
    };

    const handleAllowNotifications = async () => {
        try {
            const permStatus = await LocalNotifications.requestPermissions();
            if (permStatus.display === 'granted') {
                await updateUser({ notifications_enabled: 1 });
            }
        } catch (error) {
            console.error("Permission request failed", error);
        } finally {
            setStep('name');
        }
    };

    const handleContinue = async () => {
        if (!firstName || !lastName) return;

        await updateUser({
            name: `${firstName} ${lastName}`,
            display_name: firstName,
            notifications_enabled: 1,
            onboarding_completed: 1,
            joined_at: new Date().toISOString()
        });

        navigate('/');
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col justify-between font-['Space Grotesk']">
            {step === 'privacy' && (
                <div className="flex-1 flex flex-col justify-center">
                    <h1 className="text-3xl font-bold mb-4">Privacy & Data Collection</h1>
                    <p className="text-muted-foreground text-lg mb-8">
                        We collect minimal data to provide you with the best experience. This includes analytics about task completion and focus sessions.
                    </p>
                    <div className="space-y-4">
                        <PillButton onClick={handleAgree} className="w-full py-6 text-xl hover:opacity-90" style={ctaStyle}>AGREE</PillButton>
                        <button
                            onClick={() => setStep('privacy')} // Could show more info or just stay here, avoiding loop
                            className="w-full py-4 text-muted-foreground font-medium"
                        >
                            DISAGREE
                        </button>
                    </div>
                    <div className="mt-auto flex justify-center gap-4 text-sm text-muted-foreground pt-8">
                        <a href="https://example.com/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms & Conditions</a>
                        <a href="https://example.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>
                    </div>
                </div>
            )}

            {step === 'notifications' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                    {/* Backdrop Blur Simulation for Modal */}
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
                    <div className="relative z-50 bg-[#1a1a1a] rounded-3xl p-8 w-full max-w-sm text-center border border-[#262626]">
                        <div className="w-16 h-16 bg-[#dfff4f]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Bell className="w-8 h-8 text-[#dfff4f]" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Enable Reminder</h2>
                        <p className="text-muted-foreground mb-8">
                            Allow notification to get timely reminders for your tasks.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setStep('name')} className="py-3 text-muted-foreground font-medium">Not Now</button>
                            <PillButton onClick={handleAllowNotifications} className="py-3 uppercase" style={ctaStyle}>ALLOW</PillButton>
                        </div>
                    </div>
                </div>
            )}

            {step === 'name' && (
                <div className="flex-1 flex flex-col justify-center">
                    <h1 className="text-3xl font-bold mb-12">Tell us your name?</h1>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-muted-foreground text-sm uppercase tracking-widest ml-1">First name</label>
                            <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="bg-transparent border-b-2 border-x-0 border-t-0 border-[#262626] rounded-none px-1 text-2xl h-14 focus-visible:ring-0 focus-visible:border-[#dfff4f] transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-muted-foreground text-sm uppercase tracking-widest ml-1">Last name</label>
                            <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="bg-transparent border-b-2 border-x-0 border-t-0 border-[#262626] rounded-none px-1 text-2xl h-14 focus-visible:ring-0 focus-visible:border-[#dfff4f] transition-colors"
                            />
                        </div>
                    </div>
                    <div className="mt-auto pt-12">
                        <PillButton
                            onClick={handleContinue}
                            disabled={!firstName || !lastName}
                            className="w-full py-6 text-xl disabled:opacity-50"
                            style={ctaStyle}
                        >
                            CONTINUE
                        </PillButton>
                    </div>
                </div>
            )}
        </div>
    );
};
