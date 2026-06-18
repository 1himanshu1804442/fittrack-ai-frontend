import { useState, useEffect, useCallback } from 'react'
import Sidebar from './Sidebar'
import MetricsRow from './MetricsRow'
import ReactMarkdown from 'react-markdown'
import { toast } from 'react-hot-toast'
import { Menu } from 'lucide-react'

const API_BASE = ''

const Dashboard = ({ jwtToken, activeUserId, onLogout, currentView, setCurrentView }) => {

    const [, setHistory] = useState([])
    const [weight, setWeight] = useState("")
    const [goal, setGoal] = useState("MUSCLE_GAIN")
    const [trainingDays, setTrainingDays] = useState("6")
    const [aiPlan, setAiPlan] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [, setAiError] = useState("")

    const [userData, setUserData] = useState(null)
    const [exerciseLogs, setExerciseLogs] = useState([])
    const [quickLogData, setQuickLogData] = useState([])
    const [exerciseForm, setExerciseForm] = useState({ exerciseName: '', weight: '', sets: '', reps: '' })
    const [stats, setStats] = useState({ workoutStreak: 0, weeklyVolume: 0, recoveryScore: 0, currentWeight: 0 })
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const [editingLogId, setEditingLogId] = useState(null)
    const [editLogForm, setEditLogForm] = useState({ exerciseName: '', weight: '', sets: '', reps: '' })

    const fetchHistory = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/history`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            })
            if (response.status === 403) {
                toast.error("Session expired.")
                onLogout()
                return
            }
            if (response.ok) {
                const data = await response.json()
                setHistory(data)
            }
        } catch (error) {
            console.error(error)
        }
    }, [activeUserId, jwtToken])

    const fetchExerciseLogs = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/exercises?page=0&size=5`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                setExerciseLogs(data.content || [])
            }
        } catch (error) {
            console.error(error)
        }
    }, [activeUserId, jwtToken])

    const fetchQuickLogData = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/exercises/quick-log-data`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                setQuickLogData(data)
            }
        } catch (error) {
            console.error("Failed to fetch quick log data:", error)
        }
    }, [activeUserId, jwtToken])

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/stats`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (error) {
            console.error(error)
        }
    }, [activeUserId, jwtToken])

    const fetchUserData = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                setUserData(data)
                if (!weight) setWeight(data.bodyWeight || "")
                if (data.goal) setGoal(data.goal)
                if (data.trainingDaysPerWeek) setTrainingDays(data.trainingDaysPerWeek.toString())
            }
        } catch (error) {
            console.error(error)
        }
    }, [activeUserId, jwtToken, weight])

    useEffect(() => {
        if (jwtToken && activeUserId) {
            fetchUserData()
            fetchStats()
            fetchExerciseLogs()
            fetchQuickLogData()
            fetchHistory()
        }
    }, [jwtToken, activeUserId, fetchUserData, fetchStats, fetchExerciseLogs, fetchQuickLogData, fetchHistory])

    const generateAIPlan = async () => {
        setIsGenerating(true)
        setAiPlan("")
        setAiError("")

        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/recommendation`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            })

            if (response.status === 403) {
                toast.error("Session expired.")
                onLogout()
                return
            }
            if (!response.ok) throw new Error(`Server returned ${response.status}`)

            const data = await response.json()
            setAiPlan(data.recommendation)
            await fetchHistory()
        } catch (error) {
            console.error(error)
            toast.error("The AI engine is currently busy. Please try again in a few minutes.")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleUpdateProfile = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify({
                    bodyWeight: Number(weight),
                    goal: goal,
                    trainingDaysPerWeek: parseInt(trainingDays)
                })
            })

            if (response.status === 403) {
                toast.error("Session expired.")
                onLogout()
                return
            }

            if (response.ok) {
                toast.success("Profile updated successfully!")
            } else {
                toast.error("Update failed: Server error.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Update failed: Network error.")
        }
    }

    const handleLogWorkout = async (e) => {
        e.preventDefault()
        if (!jwtToken || !activeUserId) {
            toast.error("You must be logged in to save a lift.")
            return
        }
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/exercises`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify({
                    exerciseName: exerciseForm.exerciseName,
                    weight: Number(exerciseForm.weight),
                    sets: Number(exerciseForm.sets),
                    reps: Number(exerciseForm.reps)
                })
            })

            if (response.status === 403) {
                toast.error("Session expired.")
                onLogout()
                return
            }

            if (response.ok) {
                toast.success("Lift logged successfully!")
                setExerciseForm({ exerciseName: '', weight: '', sets: '', reps: '' })
                fetchExerciseLogs()
                fetchStats()
                fetchQuickLogData()
            } else {
                toast.error("Failed to log lift.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Network error while logging lift.")
        }
    }


    const handleDeleteLift = async (id) => {
        if (!confirm('Are you sure you want to delete this lift?')) return;
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/exercises/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            if (response.ok) {
                fetchExerciseLogs();
                fetchStats();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const startEditLift = (log) => {
        setEditingLogId(log.id);
        setEditLogForm({
            exerciseName: log.exerciseName,
            weight: log.weight,
            sets: log.sets,
            reps: log.reps
        });
    }

    const handleSaveEditLift = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/exercises/${editingLogId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify(editLogForm)
            });
            if (response.ok) {
                setEditingLogId(null);
                fetchExerciseLogs();
                fetchStats();
            }
        } catch (error) {
            console.error(error);
        }
    }

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

                <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">
                            Good morning{userData?.username ? `, ${userData.username}` : ''} 💪
                        </h1>
                        <p className="text-gray-400 text-sm">Ready to crush your goals today?</p>
                    </div>
                    <button onClick={onLogout} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg font-bold transition">
                        Logout
                    </button>
                </div>

                <MetricsRow stats={stats} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">

                    <div className="space-y-10">

                        <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800">
                            <h2 className="text-lg font-bold text-white mb-4">Update Body Stats</h2>
                            <div className="flex gap-4">
                                <div className="w-1/3">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className="w-full mt-1 bg-[#161B22] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Goal</label>
                                    <select
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        className="w-full mt-1 bg-[#161B22] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="MUSCLE_GAIN">Muscle Gain</option>
                                        <option value="WEIGHT_LOSS">Weight Loss</option>
                                        <option value="MAINTENANCE">Maintenance</option>
                                    </select>
                                </div>
                                <div className="w-1/3">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Days/Week</label>
                                    <select
                                        value={trainingDays}
                                        onChange={(e) => setTrainingDays(e.target.value)}
                                        className="w-full mt-1 bg-[#161B22] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="3">3 Days</option>
                                        <option value="4">4 Days</option>
                                        <option value="5">5 Days</option>
                                        <option value="6">6 Days</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleUpdateProfile} className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2.5 font-bold transition">
                                Save Stats
                            </button>
                        </div>

                        <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800">
                            <h2 className="text-lg font-bold text-white mb-4">Log a Lift</h2>

                            {quickLogData.length > 0 && (
                                <div className="mb-6">
                                    <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Quick Log</label>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {quickLogData.map((data, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setExerciseForm({ ...exerciseForm, exerciseName: data.exerciseName, weight: data.lastWeight })}
                                                className="whitespace-nowrap px-3 py-1.5 bg-[#161B22] border border-gray-700 text-emerald-400 text-sm font-bold rounded-lg hover:bg-[#1C2128] transition"
                                            >
                                                {data.exerciseName}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleLogWorkout} className="space-y-4" autoComplete="off">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Exercise Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Incline Dumbbell Press"
                                        value={exerciseForm.exerciseName}
                                        onChange={(e) => setExerciseForm({...exerciseForm, exerciseName: e.target.value})}
                                        className="w-full mt-1 bg-[#161B22] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1/3">
                                        <label className="text-xs text-gray-500 uppercase font-bold">Weight (kg)</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            required
                                            value={exerciseForm.weight}
                                            onChange={(e) => setExerciseForm({...exerciseForm, weight: e.target.value})}
                                            className="w-full mt-1 bg-[#161B22] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        <label className="text-xs text-gray-500 uppercase font-bold">Sets</label>
                                        <input
                                            type="number"
                                            required
                                            value={exerciseForm.sets}
                                            onChange={(e) => setExerciseForm({...exerciseForm, sets: e.target.value})}
                                            className="w-full mt-1 bg-[#161B22] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        <label className="text-xs text-gray-500 uppercase font-bold">Reps</label>
                                        <input
                                            type="number"
                                            required
                                            value={exerciseForm.reps}
                                            onChange={(e) => setExerciseForm({...exerciseForm, reps: e.target.value})}
                                            className="w-full mt-1 bg-[#161B22] border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg py-2.5 font-bold transition">
                                    Save Lift
                                </button>
                            </form>
                        </div>

                    </div>

                    <div className="space-y-10">

                        <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">🧠 AI Coach</h2>
                                <button onClick={generateAIPlan} disabled={isGenerating} className="bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold py-1.5 px-3 rounded-lg transition disabled:opacity-50">
                                    {isGenerating ? "Thinking..." : "Generate Plan"}
                                </button>
                            </div>
                            <div className="bg-[#161B22] p-4 rounded-xl border border-gray-800 min-h-[120px] max-h-[250px] overflow-y-auto">
                                {isGenerating ? (
                                    <div className="space-y-3 p-2">
                                        <div className="w-3/4 h-4 bg-emerald-500/20 animate-pulse rounded"></div>
                                        <div className="w-full h-4 bg-emerald-500/20 animate-pulse rounded"></div>
                                        <div className="w-5/6 h-4 bg-emerald-500/20 animate-pulse rounded"></div>
                                        <div className="w-1/2 h-4 bg-emerald-500/20 animate-pulse rounded"></div>
                                    </div>
                                ) : aiPlan ? (
                                    <div className="text-gray-300 text-sm space-y-4">
                                        <ReactMarkdown
                                            components={{
                                                strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                                                ul: ({ children }) => <ul className="list-disc pl-5 space-y-2 mb-4">{children}</ul>,
                                                li: ({ children }) => <li className="marker:text-emerald-500">{children}</li>,
                                                p: ({ children }) => <p className="mb-2">{children}</p>
                                            }}
                                        >
                                            {aiPlan || ""}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="text-gray-600 italic text-sm text-center py-4">Click generate for a tailored plan.</p>
                                )}
                            </div>
                        </div>


                        <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800">
                            <h2 className="text-lg font-bold text-white mb-4">Recent Lifts</h2>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {exerciseLogs.length === 0 ? (
                                    <p className="text-gray-600 italic text-sm">No lifts logged yet.</p>
                                ) : (
                                    exerciseLogs.map((log) => (
                                        <div key={log.id} className="bg-[#161B22] border border-gray-800 p-4 rounded-xl flex justify-between items-center flex-wrap gap-4">
                                            {editingLogId === log.id ? (
                                                <div className="flex-1 flex gap-3 items-center w-full">
                                                    <input 
                                                        className="bg-[#0D1117] border border-gray-700 rounded-lg p-2 text-white flex-1 focus:outline-none focus:border-blue-500"
                                                        value={editLogForm.exerciseName}
                                                        onChange={e => setEditLogForm({...editLogForm, exerciseName: e.target.value})}
                                                        placeholder="Name"
                                                    />
                                                    <input 
                                                        type="number" className="w-16 bg-[#0D1117] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                                                        value={editLogForm.weight}
                                                        onChange={e => setEditLogForm({...editLogForm, weight: e.target.value})}
                                                        placeholder="kg"
                                                    />
                                                    <input 
                                                        type="number" className="w-16 bg-[#0D1117] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                                                        value={editLogForm.sets}
                                                        onChange={e => setEditLogForm({...editLogForm, sets: e.target.value})}
                                                        placeholder="Sets"
                                                    />
                                                    <input 
                                                        type="number" className="w-16 bg-[#0D1117] border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                                                        value={editLogForm.reps}
                                                        onChange={e => setEditLogForm({...editLogForm, reps: e.target.value})}
                                                        placeholder="Reps"
                                                    />
                                                    <button onClick={handleSaveEditLift} className="text-emerald-400 font-bold hover:text-emerald-300">Save</button>
                                                    <button onClick={() => setEditingLogId(null)} className="text-gray-400 font-bold hover:text-white">Cancel</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div>
                                                        <p className="text-emerald-400 font-bold text-sm">{log.exerciseName}</p>
                                                        <p className="text-gray-400 text-xs mt-0.5">{new Date(log.dateLogged).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right flex items-center gap-6">
                                                        <div>
                                                            <p className="text-white font-bold">{log.weight} kg</p>
                                                            <p className="text-gray-500 text-xs">{log.sets} sets × {log.reps} reps</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={() => startEditLift(log)} className="text-blue-400 hover:text-blue-300 transition" title="Edit">✏️</button>
                                                            <button onClick={() => handleDeleteLift(log.id)} className="text-red-400 hover:text-red-300 transition" title="Delete">🗑️</button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
