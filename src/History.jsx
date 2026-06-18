import { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import { toast } from 'react-hot-toast';
import { Menu, Calendar, Dumbbell, BrainCircuit, ChevronDown, ChevronUp, Trash2, Edit2, X, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';

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
        <div className="flex min-h-screen bg-[#080C10] font-sans flex-col md:flex-row">
            <div className="md:hidden flex items-center justify-between p-4 bg-[#0D1117] border-b border-gray-800">
                <h1 className="text-xl font-bold text-emerald-500">FitTrack AI</h1>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none">
                    <Menu size={24} />
                </button>
            </div>

            <Sidebar currentView={currentView} setCurrentView={setCurrentView} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
            
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-800 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Activity Hub</h1>
                        <p className="text-gray-400 text-sm">Review your past workouts and AI generated plans.</p>
                    </div>
                    <button onClick={onLogout} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg font-bold transition">
                        Logout
                    </button>
                </div>

                {/* Custom Tab Switcher */}
                <div className="flex gap-4 mb-8 bg-[#161B22] p-1.5 rounded-xl w-fit border border-gray-800">
                    <button 
                        onClick={() => setActiveTab('lifts')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition ${activeTab === 'lifts' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Dumbbell size={18} />
                        Lifting Logs
                    </button>
                    <button 
                        onClick={() => setActiveTab('ai')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition ${activeTab === 'ai' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white'}`}
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
                                    <div key={i} className="bg-[#0f141a] rounded-2xl border border-gray-800 p-6 h-48"></div>
                                ))}
                            </div>
                        ) : Object.keys(groupedLogs).length === 0 ? (
                            <div className="bg-[#0f141a] p-12 text-center rounded-2xl border border-gray-800">
                                <Dumbbell size={48} className="mx-auto text-gray-700 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">No Lifts Logged</h3>
                                <p className="text-gray-500 text-sm">Your past workout sessions will appear here grouped by date.</p>
                            </div>
                        ) : (
                            <>
                                {Object.keys(groupedLogs).map((date) => (
                                    <div key={date} className="bg-[#0f141a] rounded-2xl border border-gray-800 overflow-hidden shadow-sm">
                                        <div className="bg-[#161B22] px-6 py-4 border-b border-gray-800 flex items-center gap-3">
                                            <Calendar size={18} className="text-emerald-500" />
                                            <h2 className="text-lg font-bold text-white">{date}</h2>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {groupedLogs[date].map(log => (
                                                    <div key={log.id} className="bg-[#0D1117] border border-gray-800 rounded-xl p-4 flex flex-col justify-between group relative overflow-hidden hover:border-emerald-500/30 transition">
                                                        {editingId === log.id ? (
                                                            <div className="space-y-3 z-10 relative">
                                                                <input className="w-full bg-[#161B22] border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-emerald-500 outline-none" value={editForm.exerciseName} onChange={e => setEditForm({...editForm, exerciseName: e.target.value})} placeholder="Exercise" />
                                                                <div className="flex gap-2">
                                                                    <input type="number" className="w-full bg-[#161B22] border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-emerald-500 outline-none" value={editForm.weight} onChange={e => setEditForm({...editForm, weight: e.target.value})} placeholder="kg" />
                                                                    <input type="number" className="w-full bg-[#161B22] border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-emerald-500 outline-none" value={editForm.sets} onChange={e => setEditForm({...editForm, sets: e.target.value})} placeholder="Sets" />
                                                                    <input type="number" className="w-full bg-[#161B22] border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-emerald-500 outline-none" value={editForm.reps} onChange={e => setEditForm({...editForm, reps: e.target.value})} placeholder="Reps" />
                                                                </div>
                                                                <div className="flex gap-2 pt-2">
                                                                    <button onClick={handleSaveEdit} className="flex-1 bg-emerald-500 text-black py-1.5 rounded-md font-bold text-sm flex items-center justify-center gap-1"><Save size={14}/> Save</button>
                                                                    <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-800 text-white py-1.5 rounded-md font-bold text-sm flex items-center justify-center gap-1"><X size={14}/> Cancel</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="z-10 relative">
                                                                    <h3 className="text-emerald-400 font-bold mb-3">{log.exerciseName}</h3>
                                                                    <div className="flex items-end justify-between">
                                                                        <div>
                                                                            <p className="text-3xl font-black text-white leading-none">{log.weight}<span className="text-sm text-gray-500 font-bold ml-1">kg</span></p>
                                                                            <p className="text-gray-400 text-sm mt-1">{log.sets} Sets × {log.reps} Reps</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Hover Actions */}
                                                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition flex gap-1 z-20">
                                                                    <button onClick={() => startEdit(log)} className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-md transition"><Edit2 size={14}/></button>
                                                                    <button onClick={() => handleDelete(log.id)} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition"><Trash2 size={14}/></button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-between items-center bg-[#0f141a] p-4 rounded-xl border border-gray-800">
                                    <button 
                                        disabled={page === 0}
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        className="bg-[#161B22] text-gray-300 px-5 py-2 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-gray-500 text-sm font-bold">Page {page + 1} of {totalPages}</span>
                                    <button 
                                        disabled={page >= totalPages - 1}
                                        onClick={() => setPage(p => p + 1)}
                                        className="bg-[#161B22] text-gray-300 px-5 py-2 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition"
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
                                    <div key={i} className="bg-[#0f141a] rounded-xl border border-gray-800 h-20"></div>
                                ))}
                            </div>
                        ) : aiPlans.length === 0 ? (
                            <div className="bg-[#0f141a] p-12 text-center rounded-2xl border border-gray-800">
                                <BrainCircuit size={48} className="mx-auto text-gray-700 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">No AI Plans Found</h3>
                                <p className="text-gray-500 text-sm">Generate your first custom AI workout to see it archived here.</p>
                            </div>
                        ) : (
                            aiPlans.map(plan => (
                                <div key={plan.id} className="bg-[#0f141a] rounded-xl border border-gray-800 overflow-hidden transition-all duration-300">
                                    <button 
                                        onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                                        className="w-full px-6 py-5 flex items-center justify-between hover:bg-[#161B22] transition"
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-500">
                                                <BrainCircuit size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold">AI Workout Plan</h3>
                                                <p className="text-gray-500 text-sm mt-0.5">{new Date(plan.createdAt).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="text-gray-500">
                                            {expandedPlanId === plan.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </button>
                                    
                                    {expandedPlanId === plan.id && (
                                        <div className="px-6 py-6 border-t border-gray-800 bg-[#0D1117]">
                                            <div className="prose prose-invert max-w-none text-gray-300">
                                                <ReactMarkdown
                                                    components={{
                                                        h1: ({ children }) => <h1 className="text-xl text-emerald-400 font-bold mb-3">{children}</h1>,
                                                        h2: ({ children }) => <h2 className="text-lg text-white font-bold mb-2 mt-4">{children}</h2>,
                                                        h3: ({ children }) => <h3 className="text-md text-white font-bold mb-1 mt-3">{children}</h3>,
                                                        strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                                                        ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-3">{children}</ul>,
                                                        li: ({ children }) => <li className="marker:text-emerald-500">{children}</li>,
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
        </div>
    );
};

export default History;
