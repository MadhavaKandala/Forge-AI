import React from 'react';
import { Search } from 'lucide-react';

export const SearchBar = () => {
    return (
        <div className="w-full px-6 mb-6">
            <div className="relative w-full h-[50px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search for habits, challenges..."
                    className="w-full h-full pl-12 pr-4 bg-[#18181B] border border-[#27272A] rounded-2xl text-white placeholder-zinc-500 outline-none focus:border-[#dfff4f] transition-colors"
                />
            </div>
        </div>
    );
};
