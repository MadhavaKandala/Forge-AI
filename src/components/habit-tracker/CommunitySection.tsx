import React from 'react';
import { Users, Crown, Medal, Trophy } from 'lucide-react';
import { useHabitStore } from '@/store/useHabitStore';

export const CommunitySection = () => {
    const { user } = useHabitStore();

    const leaderboard = [
        { rank: 1, name: user.name, xp: user.xp, avatar: user.avatarUrl, isUser: true },
    ];

    const sortedLeaderboard = leaderboard;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '100 Days Challenge',
                    text: `I'm on Level ${user.level} with ${user.xp} XP! Join me!`,
                    url: 'https://github.com/MadhavaKandala/a100dayschallenge',
                });
            } catch (err) {
                console.log('Error sharing', err);
            }
        } else {
            // Fallback
            alert("Sharing not supported on this device.");
        }
    };

    return (
        <div className="w-full px-6 mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Leaderboard</h2>
                <div className="px-3 py-1 bg-[#18181B] border border-[#27272A] rounded-full text-xs font-bold text-zinc-400">
                    Global Top 100
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {sortedLeaderboard.map((player) => (
                    <div
                        key={player.name}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${player.isUser
                            ? 'bg-[#dfff4f]/10 border-[#dfff4f] shadow-[0_0_20px_rgba(223,255,79,0.1)]'
                            : 'bg-[#18181B] border-[#27272A]'
                            }`}
                    >
                        <div className="flex items-center justify-center w-8 text-sm font-bold text-zinc-500">
                            {player.rank === 1 && <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                            {player.rank === 2 && <Medal className="w-5 h-5 text-zinc-300 fill-zinc-300" />}
                            {player.rank === 3 && <Medal className="w-5 h-5 text-amber-700 fill-amber-700" />}
                            {player.rank > 3 && <span>#{player.rank}</span>}
                        </div>

                        <div className="w-10 h-10 rounded-full border border-zinc-700 overflow-hidden">
                            <img src={player.avatar || "https://github.com/shadcn.png"} alt={player.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1">
                            <h4 className={`text-base font-bold ${player.isUser ? 'text-[#dfff4f]' : 'text-white'}`}>
                                {player.name} {player.isUser && '(You)'}
                            </h4>
                            <div className="text-xs text-zinc-500">{Math.floor(player.xp / 100)} Days Streak</div>
                        </div>

                        <div className="text-right">
                            <div className="text-sm font-bold text-white">{player.xp} XP</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-6 bg-[#18181B] border border-[#27272A] rounded-3xl text-center">
                <Trophy className="w-10 h-10 text-[#dfff4f] mx-auto mb-3 opacity-80" />
                <h3 className="text-white font-bold mb-1">Challenge Your Friends</h3>
                <p className="text-zinc-500 text-sm mb-4">Invite friends to join the 100 Days Challenge and compete together.</p>
                <button
                    onClick={handleShare}
                    className="px-6 py-2 bg-white text-black font-bold rounded-xl text-sm hover:bg-zinc-200 transition-colors"
                >
                    Invite Friends
                </button>
            </div>
        </div>
    );
};
