import React, { useEffect, useState } from 'react';
import { programService, Program } from '../services/programService';
import { Button } from '../components/ui/button';
import { ArrowLeft, Trophy, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '../components/ui/progress';

export const ProgramsPage: React.FC = () => {
    const navigate = useNavigate();
    const [activePrograms, setActivePrograms] = useState<Program[]>([]);
    const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);

    const fetchData = async () => {
        const active = await programService.getActivePrograms();
        setActivePrograms(active);
        const available = await programService.getAvailablePrograms();
        setAvailablePrograms(available);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStart = async (p: any) => {
        await programService.startProgram(p.name, p.type, p.days);
        fetchData();
    };

    return (
        <div className="container mx-auto p-4 max-w-md pb-24 min-h-screen bg-background">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">Programs</h1>
            </div>

            {/* Active Programs */}
            <div className="mb-8">
                <h2 className="text-sm font-bold text-muted-foreground uppercase mb-4">Active Programs</h2>
                {activePrograms.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active programs.</p>
                ) : (
                    <div className="space-y-4">
                        {activePrograms.map(p => (
                            <div key={p.id} className="bg-card border rounded-xl p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-yellow-500" />
                                        <h3 className="font-bold">{p.name}</h3>
                                    </div>
                                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">Day {p.currentDay}/{p.totalDays}</span>
                                </div>
                                <Progress value={(p.currentDay / p.totalDays) * 100} className="h-2 mb-2" />
                                <div className="text-xs text-muted-foreground">
                                    {p.description}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Available Programs */}
            <div>
                <h2 className="text-sm font-bold text-muted-foreground uppercase mb-4">Suggested Programs</h2>
                <div className="grid grid-cols-1 gap-4">
                    {availablePrograms.map(p => (
                        <div key={p.type} className="bg-card border rounded-xl p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold mb-1">{p.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Flame className="w-3 h-3 text-orange-500" />
                                    <span>{p.days} Days</span>
                                </div>
                            </div>
                            <Button size="sm" onClick={() => handleStart(p)}>Start</Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProgramsPage;
