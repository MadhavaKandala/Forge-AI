import { motion } from 'framer-motion';

interface ForgePetProps {
    status: 'strong' | 'steady' | 'low';
    size?: 'sm' | 'md' | 'lg';
}

const copy = {
    strong: 'Bot is sprinting. Keep the chain alive.',
    steady: 'Bot is jogging. One more op gives momentum.',
    low: 'Bot is frozen. Start with the smallest op.',
};

const colors = {
    strong: '#22C55E',
    steady: '#FACC15',
    low: '#FF4444',
};

const dimensions = {
    sm: 'h-14 w-14',
    md: 'h-20 w-20',
    lg: 'h-28 w-28',
};

export default function ForgePet({ status, size = 'md' }: ForgePetProps) {
    const isMoving = status !== 'low';
    return (
        <div className="flex items-center gap-3">
            <motion.div
                className={`${dimensions[size]} relative shrink-0`}
                animate={isMoving ? { y: [0, -3, 0], x: status === 'strong' ? [0, 2, 0] : [0, 1, 0] } : { rotate: [0, -1, 1, 0] }}
                transition={{ duration: status === 'strong' ? 0.6 : 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className="absolute inset-x-[18%] top-[6%] h-[42%] rounded-2xl border border-zinc-700 bg-[#1C1C1C]" />
                <div className="absolute left-[30%] top-[22%] h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors[status] }} />
                <div className="absolute right-[30%] top-[22%] h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors[status] }} />
                <div className="absolute inset-x-[10%] bottom-[8%] h-[48%] rounded-[24%] border border-zinc-700 bg-[#141414]" />
                <div className="absolute left-[4%] top-[48%] h-[22%] w-[14%] rounded-full bg-zinc-700" />
                <div className="absolute right-[4%] top-[48%] h-[22%] w-[14%] rounded-full bg-zinc-700" />
                <div className="absolute bottom-[1%] left-[25%] h-[16%] w-[14%] rounded-full bg-zinc-800" />
                <div className="absolute bottom-[1%] right-[25%] h-[16%] w-[14%] rounded-full bg-zinc-800" />
                <div className="absolute left-1/2 top-[54%] h-[20%] w-[32%] -translate-x-1/2 rounded-full" style={{ backgroundColor: `${colors[status]}33` }} />
            </motion.div>
            <p className="text-xs font-bold leading-5 text-zinc-500">{copy[status]}</p>
        </div>
    );
}
