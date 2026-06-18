import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Menu, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const API_BASE = '';

const loadingMessages = [
    "Analyzing training history...",
    "Comparing weekly volume...",
    "Evaluating recovery metrics...",
    "Generating coaching recommendations..."
];

const AICoach = ({ jwtToken, activeUserId, onLogout, currentView, setCurrentView }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const [coachData, setCoachData] = useState(() => {
        const saved = sessionStorage.getItem('aiCoachData');
        return saved ? JSON.parse(saved) : null;
    });
    const [lastGenerated, setLastGenerated] = useState(() => {
        return sessionStorage.getItem('aiCoachLastGenerated') || null;
    });

    // Rotate loading messages
    useEffect(() => {
        let interval;
        if (isGenerating) {
            interval = setInterval(() => {
                setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
            }, 1500);
        } else {
            setLoadingMessageIndex(0);
        }
        return () => clearInterval(interval);
    }, [isGenerating]);

    const handleGenerateReview = async () => {
        setIsGenerating(true);
        setCoachData(null);
        sessionStorage.removeItem('aiCoachData');
        sessionStorage.removeItem('aiCoachLastGenerated');
        
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/coach`, {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            });

            if (response.status === 403) {
                toast.error("Session expired.");
                onLogout();
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setCoachData(data);
                sessionStorage.setItem('aiCoachData', JSON.stringify(data));
                
                // Format the timestamp beautifully
                const now = new Date();
                const options = { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' };
                const formattedDate = now.toLocaleDateString('en-US', options);
                setLastGenerated(formattedDate);
                sessionStorage.setItem('aiCoachLastGenerated', formattedDate);
                
                toast.success("Coach Review Ready!");
            } else {
                toast.error("Failed to generate review.");
            }
        } catch (error) {
            console.error("Coach API Error:", error);
            toast.error("Network error. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const SectionCard = ({ title, content, icon }) => (
        <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800 h-full flex flex-col">
            <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                {icon} {title}
            </h3>
            <div className="text-gray-300 leading-relaxed flex-1">
                <ReactMarkdown
                    components={{
                        p: ({ children }) => <p className="mb-2">{children}</p>,
                        strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                    }}
                >
                    {content || "No data available."}
                </ReactMarkdown>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#080C10] font-sans flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-[#0D1117] border-b border-gray-800">
                <h1 className="text-xl font-bold text-blue-500">FitTrack AI</h1>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none">
                    <Menu size={24} />
                </button>
            </div>

            <Sidebar currentView={currentView} setCurrentView={setCurrentView} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-800 pb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white">AI Coach</h1>
                            <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-purple-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Zap size={12} /> Beta
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm">Powered by Gemini 2.5 Flash. Get highly specific, actionable advice based on your real performance data.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        {lastGenerated && (
                            <span className="text-xs text-gray-500 hidden md:inline-block">Last Generated: {lastGenerated}</span>
                        )}
                        <button 
                            onClick={handleGenerateReview} 
                            disabled={isGenerating}
                            className="bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-2.5 rounded-lg font-bold transition disabled:opacity-50 flex items-center gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        >
                            {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : "⚡ Generate Review"}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="max-w-6xl mx-auto">
                    {/* Top Metrics Row */}
                    {coachData && !isGenerating && (
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                <span className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Recovery Score</span>
                                <div className="text-4xl font-black text-white flex items-end gap-2">
                                    {coachData.recoveryScore}%
                                    <span className={`text-sm mb-1 ${coachData.recoveryScore >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {coachData.recoveryScore >= 60 ? 'Ready to train' : 'Need rest'}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-[#161B22] border border-gray-800 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                <span className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Weekly Volume</span>
                                <div className="text-4xl font-black text-white flex items-end gap-2">
                                    {coachData.volumeChange > 0 ? '+' : ''}{coachData.volumeChange}%
                                    <span className={`text-sm mb-1 ${coachData.volumeChange > 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                                        vs Last Week
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading State or Cards Grid */}
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-800 rounded-2xl bg-[#0D1117]">
                            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
                            <h2 className="text-xl font-bold text-white mb-2">{loadingMessages[loadingMessageIndex]}</h2>
                            <p className="text-gray-500 text-sm">Please wait while the AI analyzes your data...</p>
                        </div>
                    ) : coachData && coachData.sections ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <SectionCard title="Performance Summary" icon="📊" content={coachData.sections.performanceSummary} />
                            <SectionCard title="Recovery Analysis" icon="🔋" content={coachData.sections.recoveryAnalysis} />
                            <SectionCard title="Progressive Overload" icon="📈" content={coachData.sections.progressiveOverloadAnalysis} />
                            <SectionCard title="Potential Issues" icon="⚠️" content={coachData.sections.potentialIssues} />
                            <SectionCard title="Next Workout" icon="🏋️" content={coachData.sections.nextWorkoutRecommendations} />
                            <SectionCard title="Next Week" icon="📅" content={coachData.sections.nextWeekRecommendations} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-96 border border-dashed border-gray-800 rounded-2xl bg-[#0D1117] text-center px-4">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                                <Zap className="text-emerald-400" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Your Personal AI Coach</h2>
                            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                                Ready to take your training to the next level? Hit the Generate button above to receive a deep-dive analysis of your recent progression, volume, and recovery.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AICoach;
