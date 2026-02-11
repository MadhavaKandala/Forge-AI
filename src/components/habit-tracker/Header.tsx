import React from 'react';
import { Bell, Settings } from 'lucide-react';

export const Header = () => {
    return (
        <div className="flex items-center justify-between w-full h-[60px] px-6">
            <div className="flex flex-col">
                <span className="text-zinc-400 text-sm font-medium">Monday, 24 January</span>
                <h1 className="text-2xl font-bold text-white">Hello, Kpmad</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center relative">
                    <Bell className="w-5 h-5 text-white" />
                    <div className="absolute top-2 right-2.5 w-2 h-2 bg-[#dfff4f] rounded-full"></div>
                </div>
                <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center overflow-hidden">
                    <img src="https://github.com/shadcn.png" alt="Profile" className="w-full h-full object-cover" />
                </div>
            </div>
        </div>
    );
};
