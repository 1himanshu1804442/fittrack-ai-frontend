import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Activity, BarChart3, BatteryMedium, CalendarDays, Dumbbell, Menu, RefreshCw, Sparkles, TriangleAlert, Zap } from 'lucide-react';
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

    return (
        <div className="app-shell flex min-h-screen flex-col md:flex-row">
            <div className="mobile-app-header flex items-center justify-between border-b p-4 md:hidden">
                <div className="brand-lockup">
                    <span className="brand-mark"><Zap size={15} strokeWidth={2.8} /></span>
                    <span>Fit<strong>Track</strong> AI</span>
                </div>
                <button type="button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="icon-button h-9 w-9" aria-label="Toggle navigation">
                    <Menu size={20} />
                </button>
            </div>

            <Sidebar currentView={currentView} setCurrentView={setCurrentView} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            <main className="app-main flex-1">
                <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                    <header className="flex flex-col gap-5 border-b border-[#26313d] pb-6 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <p className="page-eyebrow text-emerald-300">Performance review</p>
                                <span className="rounded-sm border border-blue-300/20 bg-blue-400/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-blue-200">AI coach</span>
                            </div>
                            <h1 className="page-title">Find the signal in your training.</h1>
                            <p className="page-copy mt-3 max-w-2xl">Get specific next-step recommendations grounded in your recent progression, volume, and recovery.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {lastGenerated && <span className="font-mono text-[11px] text-zinc-600">LAST REVIEW: {lastGenerated}</span>}
                            <button 
                                type="button"
                                onClick={handleGenerateReview} 
                                disabled={isGenerating}
                                className="btn-primary h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                                {isGenerating ? "Generating review..." : "Generate review"}
                            </button>
                            <button type="button" onClick={onLogout} className="btn-danger h-10 px-3.5 text-sm">Logout</button>
                        </div>
                    </header>

                    {coachData && !isGenerating && (
                        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Coach summary metrics">
                            <article className="metric-card p-5">
                                <p className="metric-label">Recovery score</p>
                                <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
                                    <p className="metric-value text-3xl">{coachData.recoveryScore}%</p>
                                    <p className={`mb-1 text-xs font-semibold ${coachData.recoveryScore >= 60 ? 'text-emerald-300' : 'text-red-300'}`}>
                                        {coachData.recoveryScore >= 60 ? 'Ready to train' : 'Need rest'}
                                    </p>
                                </div>
                            </article>
                            <article className="metric-card p-5">
                                <p className="metric-label">Weekly volume</p>
                                <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
                                    <p className="metric-value text-3xl">{coachData.volumeChange > 0 ? '+' : ''}{coachData.volumeChange}%</p>
                                    <p className={`mb-1 text-xs font-semibold ${coachData.volumeChange > 0 ? 'text-blue-300' : 'text-zinc-500'}`}>vs last week</p>
                                </div>
                            </article>
                        </section>
                    )}

                    {isGenerating ? (
                        <section className="surface-panel signal-surface flex min-h-64 flex-col items-center justify-center px-5 text-center">
                            <div className="mb-6 grid h-11 w-11 place-items-center border border-emerald-300/20 bg-emerald-400/10 text-emerald-300">
                                <RefreshCw className="animate-spin" size={21} />
                            </div>
                            <p className="font-mono text-xs uppercase tracking-[0.13em] text-zinc-600">Coach is reading the work</p>
                            <h2 className="mt-3 text-xl font-bold tracking-[-0.04em] text-zinc-100">{loadingMessages[loadingMessageIndex]}</h2>
                            <p className="mt-2 text-sm text-zinc-500">This can take a moment while your training data is assessed.</p>
                        </section>
                    ) : coachData && coachData.sections ? (
                        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <SectionCard title="Performance summary" Icon={Activity} content={coachData.sections.performanceSummary} />
                            <SectionCard title="Recovery analysis" Icon={BatteryMedium} content={coachData.sections.recoveryAnalysis} />
                            <SectionCard title="Progressive overload" Icon={BarChart3} content={coachData.sections.progressiveOverloadAnalysis} />
                            <SectionCard title="Potential issues" Icon={TriangleAlert} content={coachData.sections.potentialIssues} />
                            <SectionCard title="Next workout" Icon={Dumbbell} content={coachData.sections.nextWorkoutRecommendations} />
                            <SectionCard title="Next week" Icon={CalendarDays} content={coachData.sections.nextWeekRecommendations} />
                        </section>
                    ) : (
                        <section className="surface-panel signal-surface flex min-h-96 flex-col justify-center p-7 sm:p-12">
                            <span className="mb-6 grid h-12 w-12 place-items-center border border-emerald-300/20 bg-emerald-400/10 text-emerald-300"><Sparkles size={21} /></span>
                            <p className="page-eyebrow mb-3">No review generated yet</p>
                            <h2 className="max-w-xl text-3xl font-bold tracking-[-0.055em] text-zinc-100">Your training data has a story. Let’s read it.</h2>
                            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500">Generate a review for a focused picture of your recent progression, weekly volume, and recovery signals.</p>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

const SectionCard = ({ title, content, Icon }) => (
    <article className="surface-panel p-5">
        <div className="mb-5 flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center border border-emerald-300/15 bg-emerald-400/10 text-emerald-300"><Icon size={16} /></span>
            <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
        </div>
        <div className="text-sm leading-6 text-zinc-400">
            <ReactMarkdown
                components={{
                    p: ({ children }) => <p className="mb-2">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-zinc-100">{children}</strong>,
                }}
            >
                {content || "No data available."}
            </ReactMarkdown>
        </div>
    </article>
);

export default AICoach;
