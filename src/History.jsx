import { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';

const History = ({ jwtToken, activeUserId, onLogout, currentView, setCurrentView }) => {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ exerciseName: '', weight: '', sets: '', reps: '' });
    const [message, setMessage] = useState('');

    const fetchLogs = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/exercises?page=${page}&size=10`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLogs(data.content || []);
                setTotalPages(data.totalPages || 1);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    }, [activeUserId, jwtToken, page]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this lift?')) return;
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/exercises/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            if (response.ok) {
                setMessage('Lift deleted successfully');
                fetchLogs();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error("Error deleting:", error);
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
                setMessage('Lift updated successfully');
                setEditingId(null);
                fetchLogs();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error("Error updating:", error);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#080C10] font-sans">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
            <div className="flex-1 overflow-y-auto p-8">
                <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Workout History</h1>
                        <p className="text-gray-400 text-sm">Review, edit, or delete your past lifts.</p>
                    </div>
                    <button onClick={onLogout} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg font-bold transition">
                        Logout
                    </button>
                </div>

                {message && <div className="mb-4 text-emerald-400 text-sm font-bold bg-emerald-500/10 p-3 rounded-lg">{message}</div>}

                <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800">
                    <div className="space-y-3">
                        {logs.length === 0 ? (
                            <p className="text-gray-600 italic text-sm">No lifts found.</p>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="bg-[#161B22] border border-gray-800 p-4 rounded-xl flex justify-between items-center flex-wrap gap-4">
                                    {editingId === log.id ? (
                                        <div className="flex-1 flex gap-3 items-center w-full">
                                            <input 
                                                className="bg-[#0D1117] border border-gray-700 rounded-lg p-2 text-white flex-1 focus:outline-none focus:border-blue-500"
                                                value={editForm.exerciseName}
                                                onChange={e => setEditForm({...editForm, exerciseName: e.target.value})}
                                                placeholder="Exercise Name"
                                            />
                                            <input 
                                                type="number" className="w-20 bg-[#0D1117] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                                                value={editForm.weight}
                                                onChange={e => setEditForm({...editForm, weight: e.target.value})}
                                                placeholder="kg"
                                            />
                                            <input 
                                                type="number" className="w-16 bg-[#0D1117] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                                                value={editForm.sets}
                                                onChange={e => setEditForm({...editForm, sets: e.target.value})}
                                                placeholder="Sets"
                                            />
                                            <input 
                                                type="number" className="w-16 bg-[#0D1117] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                                                value={editForm.reps}
                                                onChange={e => setEditForm({...editForm, reps: e.target.value})}
                                                placeholder="Reps"
                                            />
                                            <button onClick={handleSaveEdit} className="text-emerald-400 font-bold hover:text-emerald-300">Save</button>
                                            <button onClick={() => setEditingId(null)} className="text-gray-400 font-bold hover:text-white">Cancel</button>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <p className="text-emerald-400 font-bold text-sm">{log.exerciseName}</p>
                                                <p className="text-gray-400 text-xs mt-0.5">{new Date(log.dateLogged).toLocaleDateString()} at {new Date(log.dateLogged).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            </div>
                                            <div className="text-right flex items-center gap-6">
                                                <div>
                                                    <p className="text-white font-bold">{log.weight} kg</p>
                                                    <p className="text-gray-500 text-xs">{log.sets} sets × {log.reps} reps</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => startEdit(log)} className="text-blue-400 hover:text-blue-300 transition" title="Edit">✏️</button>
                                                    <button onClick={() => handleDelete(log.id)} className="text-red-400 hover:text-red-300 transition" title="Delete">🗑️</button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <button 
                            disabled={page === 0}
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            className="bg-[#161B22] text-gray-300 px-4 py-2 rounded-lg font-bold hover:bg-[#1C2128] disabled:opacity-50 transition cursor-pointer"
                        >
                            Previous
                        </button>
                        <span className="text-gray-500 text-sm font-bold">Page {page + 1} of {totalPages}</span>
                        <button 
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                            className="bg-[#161B22] text-gray-300 px-4 py-2 rounded-lg font-bold hover:bg-[#1C2128] disabled:opacity-50 transition cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;
