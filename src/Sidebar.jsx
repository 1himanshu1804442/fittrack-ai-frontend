import React from 'react';

const Sidebar = () => {
    return (
        <div className="w-60 bg-[#0D1117] border-r border-gray-800 flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                    ⚡
                </div>
                <div className="text-white font-bold text-lg tracking-tight">
                    Fit<span className="text-emerald-400">Track</span> AI
                </div>
            </div>

            <div className="flex-1 px-3 py-4 flex flex-col gap-1">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 py-2">
                    Main
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium cursor-pointer">
                    <span>▣</span> Dashboard
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#1C2128] hover:text-white cursor-pointer transition-colors">
                    <span>◈</span> AI Workout
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#1C2128] hover:text-white cursor-pointer transition-colors">
                    <span>◉</span> Pose Tracker
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#1C2128] hover:text-white cursor-pointer transition-colors">
                    <span>◫</span> History
                </div>

                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 py-2 mt-4">
                    Insights
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#1C2128] hover:text-white cursor-pointer transition-colors">
                    <span>◎</span> Analytics
                </div>
            </div>

            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 p-2 bg-[#1C2128] rounded-xl cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                        H
                    </div>
                    <div>
                        <div className="text-white text-xs font-medium">Himanshu Yadav</div>
                        <div className="text-gray-400 text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Muscle Gain
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;