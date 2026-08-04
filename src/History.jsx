import { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import { toast } from 'react-hot-toast';
import { Menu, Calendar, Dumbbell, BrainCircuit, ChevronDown, ChevronUp, Trash2, Edit2, X, Save, Zap, LogOut } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_BASE = '';

const History = ({ jwtToken, activeUserId, onLogout, currentView, setCurrentView }) => {
    const [activeTab, setActiveTab] = useState('lifts'); // 'lifts' or 'ai'
    
    // Lifting Logs State
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ exerciseName: '', weight: '', sets: '', reps: '' });
    const [isLoadingLifts, setIsLoadingLifts] = useState(true);

    // AI Plans State
    const [aiPlans, setAiPlans] = useState([]);
    const [isLoadingAI, setIsLoadingAI] = useState(true);
    const [expandedPlanId, setExpandedPlanId] = useState(null);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const fetchLogs = useCallback(async () => {
        setIsLoadingLifts(true);
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/exercises?page=${page}&size=50`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLogs(data.content || []);
                setTotalPages(data.totalPages || 1);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
            toast.error("Failed to fetch lift history.");
        } finally {
            setIsLoadingLifts(false);
        }
    }, [activeUserId, jwtToken, page]);

    const fetchAIPlans = useCallback(async () => {
        setIsLoadingAI(true);
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/history`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAiPlans(data || []);
            }
        } catch (error) {
            console.error("Error fetching AI plans:", error);
            toast.error("Failed to fetch AI plans.");
        } finally {
            setIsLoadingAI(false);
        }
    }, [activeUserId, jwtToken]);

    useEffect(() => {
        if (activeTab === 'lifts') fetchLogs();
        if (activeTab === 'ai') fetchAIPlans();
    }, [activeTab, fetchLogs, fetchAIPlans]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this lift?')) return;
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/exercises/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            if (response.ok) {
                toast.success('Lift deleted successfully');
                fetchLogs();
            } else {
                toast.error('Failed to delete lift.');
            }
        } catch (error) {
            console.error("Error deleting:", error);
            toast.error("Network error while deleting lift.");
        }
    };

    const startEdit = (log) => {
        setEditingId(log.id);
        setEditForm({
            exerciseName: log.exerciseName,
            weight: log.weight,
            sets: log.sets,
            reps: log.reps
        });
    };

    const handleSaveEdit = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/exercises/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify(editForm)
            });
            if (response.ok) {
                toast.success('Lift updated successfully');
                setEditingId(null);
                fetchLogs();
            } else {
                toast.error('Failed to update lift.');
            }
        } catch (error) {
            console.error("Error updating:", error);
            toast.error("Network error while updating lift.");
        }
    };

    // Group logs by Date string
    const groupedLogs = logs.reduce((acc, log) => {
        const dateKey = new Date(log.dateLogged).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(log);
        return acc;
    }, {});

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
                    <header className="flex flex-col gap-5 border-b border-[#26313d] pb-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="page-eyebrow mb-3 text-emerald-300">ACTIVITY LOG</p>
                            <h1 className="page-title">Activity Hub</h1>
                            <p className="page-copy mt-3">Review your past workouts and AI generated plans.</p>
                        </div>
                        <button type="button" onClick={onLogout} className="btn-danger h-10 px-3.5 text-sm flex items-center gap-2">
                            <LogOut size={16} /> Logout
                        </button>
                    </header>

                    {/* Custom Tab Switcher */}
                    <div className="flex gap-2 surface-panel--quiet p-1.5 rounded-xl w-fit">
                        <button 
                            type="button"
                            onClick={() => setActiveTab('lifts')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition ${activeTab === 'lifts' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            <Dumbbell size={18} />
                            Lifting Logs
                        </button>
                        <button 
                            type="button"
                            onClick={() => setActiveTab('ai')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition ${activeTab === 'ai' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            <BrainCircuit size={18} />
                            AI Plans Archive
                        </button>
                    </div>

                    {/* LIFTING LOGS TAB */}
                    {activeTab === 'lifts' && (
                        <div className="space-y-8">
                            {isLoadingLifts ? (
                                <div className="animate-pulse space-y-6">
                                    {[1, 2].map(i => (
                                        <div key={i} className="surface-panel p-6 h-48"></div>
                                    ))}
                                </div>
                            ) : Object.keys(groupedLogs).length === 0 ? (
                                <div className="surface-panel p-12 text-center">
                                    <Dumbbell size={48} className="mx-auto text-[var(--ft-dim)] mb-4" />
                                    <h3 className="text-xl font-bold text-[var(--ft-text)] mb-2">No Lifts Logged</h3>
                                    <p className="text-[var(--ft-muted)] text-sm">Your past workout sessions will appear here grouped by date.</p>
                                </div>
                            ) : (
                                <>
                                    {Object.keys(groupedLogs).map((date) => (
                                        <div key={date} className="surface-panel overflow-hidden">
                                            <div className="bg-[var(--ft-surface-raised)] px-6 py-4 border-b border-[var(--ft-line)] flex items-center gap-3">
                                                <Calendar size={18} className="text-[var(--ft-emerald)]" />
                                                <h2 className="text-lg font-bold text-[var(--ft-text)]">{date}</h2>
                                            </div>
                                            <div className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {groupedLogs[date].map(log => (
                                                        <div key={log.id} className="bg-[var(--ft-canvas)] border border-[var(--ft-line)] rounded-xl p-4 flex flex-col justify-between group relative overflow-hidden hover:border-[var(--ft-emerald)]/30 transition">
                                                            {editingId === log.id ? (
                                                                <div className="space-y-3 z-10 relative">
                                                                    <input className="form-control" value={editForm.exerciseName} onChange={e => setEditForm({...editForm, exerciseName: e.target.value})} placeholder="Exercise" />
                                                                    <div className="flex gap-2">
                                                                        <input type="number" className="form-control" value={editForm.weight} onChange={e => setEditForm({...editForm, weight: e.target.value})} placeholder="kg" />
                                                                        <input type="number" className="form-control" value={editForm.sets} onChange={e => setEditForm({...editForm, sets: e.target.value})} placeholder="Sets" />
                                                                        <input type="number" className="form-control" value={editForm.reps} onChange={e => setEditForm({...editForm, reps: e.target.value})} placeholder="Reps" />
                                                                    </div>
                                                                    <div className="flex gap-2 pt-2">
                                                                        <button type="button" onClick={handleSaveEdit} className="flex-1 btn-primary py-1.5 flex items-center justify-center gap-1"><Save size={14}/> Save</button>
                                                                        <button type="button" onClick={() => setEditingId(null)} className="flex-1 btn-secondary py-1.5 flex items-center justify-center gap-1"><X size={14}/> Cancel</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="z-10 relative">
                                                                        <h3 className="text-emerald-300 font-bold mb-3">{log.exerciseName}</h3>
                                                                        <div className="flex items-end justify-between">
                                                                            <div>
                                                                                <p className="metric-value font-mono">{log.weight}<span className="text-sm text-[var(--ft-dim)] font-bold ml-1">kg</span></p>
                                                                                <p className="text-[var(--ft-muted)] text-sm mt-1 font-mono">{log.sets} Sets × {log.reps} Reps</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* Hover Actions */}
                                                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition flex gap-1 z-20">
                                                                        <button type="button" onClick={() => startEdit(log)} className="icon-button"><Edit2 size={14}/></button>
                                                                        <button type="button" onClick={() => handleDelete(log.id)} className="icon-button !text-[var(--ft-red)] hover:!bg-[var(--ft-red)]/10"><Trash2 size={14}/></button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex justify-between items-center surface-panel p-4">
                                        <button 
                                            type="button"
                                            disabled={page === 0}
                                            onClick={() => setPage(p => Math.max(0, p - 1))}
                                            className="btn-secondary px-5 py-2 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-[var(--ft-muted)] text-sm font-mono font-bold">Page {page + 1} of {totalPages}</span>
                                        <button 
                                            type="button"
                                            disabled={page >= totalPages - 1}
                                            onClick={() => setPage(p => p + 1)}
                                            className="btn-secondary px-5 py-2 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* AI PLANS ARCHIVE TAB */}
                    {activeTab === 'ai' && (
                        <div className="space-y-4">
                            {isLoadingAI ? (
                                <div className="animate-pulse space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="surface-panel h-20"></div>
                                    ))}
                                </div>
                            ) : aiPlans.length === 0 ? (
                                <div className="surface-panel p-12 text-center">
                                    <BrainCircuit size={48} className="mx-auto text-[var(--ft-dim)] mb-4" />
                                    <h3 className="text-xl font-bold text-[var(--ft-text)] mb-2">No AI Plans Found</h3>
                                    <p className="text-[var(--ft-muted)] text-sm">Generate your first custom AI workout to see it archived here.</p>
                                </div>
                            ) : (
                                aiPlans.map(plan => (
                                    <div key={plan.id} className="surface-panel overflow-hidden transition-all duration-300">
                                        <button 
                                            type="button"
                                            onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                                            className="w-full px-6 py-5 flex items-center justify-between hover:bg-[var(--ft-surface-active)] transition"
                                        >
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="bg-[var(--ft-emerald)]/10 p-3 rounded-lg text-[var(--ft-emerald)]">
                                                    <BrainCircuit size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-[var(--ft-text)] font-bold">AI Workout Plan</h3>
                                                    <p className="text-[var(--ft-muted)] font-mono text-sm mt-0.5">{new Date(plan.createdAt).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                            <div className="text-[var(--ft-dim)]">
                                                {expandedPlanId === plan.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </button>
                                        
                                        {expandedPlanId === plan.id && (
                                            <div className="px-6 py-6 border-t border-[var(--ft-line)] bg-[var(--ft-canvas)]">
                                                <div className="prose prose-invert max-w-none text-[var(--ft-text)]">
                                                    <ReactMarkdown
                                                        components={{
                                                            h1: ({ children }) => <h1 className="text-xl text-[var(--ft-emerald)] font-bold mb-3">{children}</h1>,
                                                            h2: ({ children }) => <h2 className="text-lg text-[var(--ft-text)] font-bold mb-2 mt-4">{children}</h2>,
                                                            h3: ({ children }) => <h3 className="text-md text-[var(--ft-text)] font-bold mb-1 mt-3">{children}</h3>,
                                                            strong: ({ children }) => <strong className="text-[var(--ft-text)] font-bold">{children}</strong>,
                                                            ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-3">{children}</ul>,
                                                            li: ({ children }) => <li className="marker:text-[var(--ft-emerald)]">{children}</li>,
                                                        }}
                                                    >
                                                        {plan.aiResponse}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default History;

