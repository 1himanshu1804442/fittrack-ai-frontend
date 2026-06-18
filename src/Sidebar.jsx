import React, { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';

const API_BASE = 'https://fittrack-ai-backend-production.up.railway.app';

const Sidebar = ({ currentView, setCurrentView, isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('jwtToken');
        
        if (userId && token) {
            fetch(`${API_BASE}/api/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => setUserData(data))
            .catch(err => console.error("Failed to fetch user data for sidebar", err));
        }
    }, []);

    const formatGoal = (goal) => {
        if (!goal) return "Setting Goal...";
        return goal.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
    };

    const username = userData?.username || "Loading...";
    const initial = userData?.username ? userData.username.charAt(0).toUpperCase() : "H";
    const goalText = formatGoal(userData?.goal);

    return (
        <>
            {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}
            <div className={`w-60 bg-[#0D1117] border-r border-gray-800 flex flex-col h-screen fixed md:sticky top-0 z-50 transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                            ⚡
                        </div>
                        <div className="text-white font-bold text-lg tracking-tight">
                            Fit<span className="text-emerald-400">Track</span> AI
                        </div>
                    </div>
                    <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                        <X size={20} />
                    </button>
                </div>


                <div className="flex-1 px-3 py-4 flex flex-col gap-1">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 py-2">
                        Main
                    </div>
                    <div onClick={() => setCurrentView('dashboard')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${currentView === 'dashboard' ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-gray-400 hover:bg-[#1C2128] hover:text-white'}`}>
                        <span>▣</span> Dashboard
                    </div>
                    <div onClick={() => setCurrentView('ai-workout')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${currentView === 'ai-workout' ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-gray-400 hover:bg-[#1C2128] hover:text-white'}`}>
                        <span>◈</span> AI Workout
                    </div>
                    <div onClick={() => setCurrentView('nutrition')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${currentView === 'nutrition' ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-gray-400 hover:bg-[#1C2128] hover:text-white'}`}>
                        <span>🍎</span> Nutrition
                    </div>
                    <div onClick={() => setCurrentView('analytics')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${currentView === 'analytics' ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-gray-400 hover:bg-[#1C2128] hover:text-white'}`}>
                        <span>📈</span> Analytics
                    </div>
                    <div onClick={() => setCurrentView('history')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${currentView === 'history' ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-gray-400 hover:bg-[#1C2128] hover:text-white'}`}>
                        <span>◫</span> History
                    </div>
                </div>

                <div className="p-4 border-t border-gray-800">
                    <div 
                        className="flex items-center gap-3 p-2 bg-[#1C2128] hover:bg-[#22272E] rounded-xl cursor-pointer transition border border-transparent hover:border-gray-700 relative group"
                        onClick={() => setCurrentView('dashboard')}
                        title="Go to settings"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                            {initial}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-white text-xs font-bold truncate">{username}</div>
                            <div className="text-gray-400 text-[10px] flex items-center gap-1 mt-0.5 truncate">
                                <span className={`w-1.5 h-1.5 rounded-full ${userData?.goal === 'MUSCLE_GAIN' ? 'bg-emerald-400' : userData?.goal === 'WEIGHT_LOSS' ? 'bg-red-400' : 'bg-blue-400'}`}></span>
                                {goalText}
                            </div>
                        </div>
                        <Settings size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition absolute right-3" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
