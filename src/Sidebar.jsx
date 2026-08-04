import { useState, useEffect } from 'react';
import { Apple, BarChart3, BrainCircuit, Clock3, Dumbbell, LayoutDashboard, Settings, X, Zap } from 'lucide-react';

const API_BASE = '';

const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-workout', label: 'AI Workout', icon: Dumbbell },
    { id: 'ai-coach', label: 'AI Coach', icon: BrainCircuit },
    { id: 'nutrition', label: 'Nutrition', icon: Apple },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'History', icon: Clock3 }
];

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
            {isMobileMenuOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            <aside className={`fixed top-0 z-50 flex h-screen w-64 flex-col border-r border-[#26313d] bg-[#0e1218]/95 backdrop-blur-xl transition-transform md:sticky ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="flex items-center justify-between border-b border-[#26313d] px-5 py-5">
                    <div className="brand-lockup">
                        <span className="brand-mark"><Zap size={16} strokeWidth={2.8} /></span>
                        <span>Fit<strong>Track</strong> AI</span>
                    </div>
                    <button
                        type="button"
                        aria-label="Close navigation"
                        className="icon-button h-8 w-8 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex flex-1 flex-col gap-1 px-3 py-5" aria-label="Primary navigation">
                    <p className="page-eyebrow px-3 pb-2">Training desk</p>
                    {navigationItems.map(({ id, label, icon: Icon }) => {
                        const isActive = currentView === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setCurrentView(id)}
                                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${isActive ? 'bg-emerald-400/10 font-semibold text-emerald-300' : 'text-zinc-500 hover:bg-[#19212b] hover:text-zinc-100'}`}
                            >
                                {isActive && <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-emerald-300" aria-hidden="true" />}
                                <Icon size={17} strokeWidth={isActive ? 2.3 : 1.8} />
                                <span>{label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="border-t border-[#26313d] p-3">
                    <button
                        type="button"
                        className="group flex w-full items-center gap-3 rounded-lg border border-transparent bg-[#131922] p-2.5 text-left transition hover:border-[#354454] hover:bg-[#19212b]"
                        onClick={() => setCurrentView('dashboard')}
                        title="Go to settings"
                    >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-emerald-300/20 bg-emerald-400/10 text-xs font-bold text-emerald-200">
                            {initial}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-bold text-zinc-100">{username}</span>
                            <span className="mt-1 flex items-center gap-1.5 truncate text-[10px] font-medium text-zinc-500">
                                <span className={`h-1.5 w-1.5 rounded-full ${userData?.goal === 'MUSCLE_GAIN' ? 'bg-emerald-400' : userData?.goal === 'WEIGHT_LOSS' ? 'bg-red-400' : 'bg-blue-400'}`} />
                                {goalText}
                            </span>
                        </span>
                        <Settings size={15} className="text-zinc-600 transition group-hover:text-zinc-300" />
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
