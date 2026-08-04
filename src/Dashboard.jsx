import { useState, useEffect, useCallback } from 'react'
import Sidebar from './Sidebar'
import MetricsRow from './MetricsRow'
import ReactMarkdown from 'react-markdown'
import { toast } from 'react-hot-toast'
import { Dumbbell, Edit2, LogOut, Menu, Sparkles, Trash2, Zap } from 'lucide-react'

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
                            <p className="page-eyebrow mb-3 text-emerald-300">Training overview</p>
                            <h1 className="page-title">Good morning{userData?.username ? `, ${userData.username}` : ''}.</h1>
                            <p className="page-copy mt-3">Your next useful training signal is below.</p>
                        </div>
                        <button type="button" onClick={onLogout} className="btn-danger h-10 px-3.5 text-sm">
                            <LogOut size={16} />
                            Logout
                        </button>
                    </header>

                    <MetricsRow stats={stats} />

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        <div className="space-y-5">
                            <section className="surface-panel signal-surface p-5 sm:p-6">
                                <div className="mb-6 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="page-eyebrow mb-2">Profile calibration</p>
                                        <h2 className="text-lg font-bold tracking-[-0.035em] text-zinc-100">Body metrics</h2>
                                    </div>
                                    <span className="font-mono text-xs text-zinc-600">LIVE PROFILE</span>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <label className="block">
                                        <span className="form-label mb-2 block">Weight (kg)</span>
                                        <input
                                            type="number"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            className="form-control h-11 px-3 text-sm"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="form-label mb-2 block">Goal</span>
                                        <select
                                            value={goal}
                                            onChange={(e) => setGoal(e.target.value)}
                                            className="form-control h-11 px-3 text-sm"
                                        >
                                            <option value="MUSCLE_GAIN">Muscle Gain</option>
                                            <option value="WEIGHT_LOSS">Weight Loss</option>
                                            <option value="MAINTENANCE">Maintenance</option>
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="form-label mb-2 block">Days / week</span>
                                        <select
                                            value={trainingDays}
                                            onChange={(e) => setTrainingDays(e.target.value)}
                                            className="form-control h-11 px-3 text-sm"
                                        >
                                            <option value="3">3 Days</option>
                                            <option value="4">4 Days</option>
                                            <option value="5">5 Days</option>
                                            <option value="6">6 Days</option>
                                        </select>
                                    </label>
                                </div>
                                <button type="button" onClick={handleUpdateProfile} className="btn-secondary mt-5 h-10 w-full px-4 text-sm sm:w-auto">
                                    Save metrics
                                </button>
                            </section>

                            <section className="surface-panel p-5 sm:p-6">
                                <div className="mb-6 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="page-eyebrow mb-2">Session input</p>
                                        <h2 className="text-lg font-bold tracking-[-0.035em] text-zinc-100">Log a lift</h2>
                                    </div>
                                    <Dumbbell size={19} className="text-emerald-300" />
                                </div>

                                {quickLogData.length > 0 && (
                                    <div className="mb-6 border-b border-[#26313d] pb-5">
                                        <span className="form-label mb-3 block">Recent movements</span>
                                        <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-1">
                                            {quickLogData.map((data, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setExerciseForm({ ...exerciseForm, exerciseName: data.exerciseName, weight: data.lastWeight })}
                                                    className="shrink-0 rounded-md border border-[#354454] bg-[#10151c] px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:border-emerald-300/50 hover:bg-emerald-400/10"
                                                >
                                                    {data.exerciseName}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleLogWorkout} className="space-y-4" autoComplete="off">
                                    <label className="block">
                                        <span className="form-label mb-2 block">Exercise name</span>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Incline Dumbbell Press"
                                            value={exerciseForm.exerciseName}
                                            onChange={(e) => setExerciseForm({...exerciseForm, exerciseName: e.target.value})}
                                            className="form-control h-11 px-3 text-sm"
                                        />
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <label className="block">
                                            <span className="form-label mb-2 block">Weight (kg)</span>
                                            <input
                                                type="number"
                                                step="0.5"
                                                required
                                                value={exerciseForm.weight}
                                                onChange={(e) => setExerciseForm({...exerciseForm, weight: e.target.value})}
                                                className="form-control h-11 px-3 text-sm"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="form-label mb-2 block">Sets</span>
                                            <input
                                                type="number"
                                                required
                                                value={exerciseForm.sets}
                                                onChange={(e) => setExerciseForm({...exerciseForm, sets: e.target.value})}
                                                className="form-control h-11 px-3 text-sm"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="form-label mb-2 block">Reps</span>
                                            <input
                                                type="number"
                                                required
                                                value={exerciseForm.reps}
                                                onChange={(e) => setExerciseForm({...exerciseForm, reps: e.target.value})}
                                                className="form-control h-11 px-3 text-sm"
                                            />
                                        </label>
                                    </div>
                                    <button type="submit" className="btn-primary h-11 w-full px-4 text-sm">
                                        Save lift
                                    </button>
                                </form>
                            </section>
                        </div>

                        <div className="space-y-5">
                            <section className="surface-panel signal-surface p-5 sm:p-6">
                                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="page-eyebrow mb-2">Adaptive programming</p>
                                        <h2 className="flex items-center gap-2 text-lg font-bold tracking-[-0.035em] text-zinc-100">
                                            <Sparkles size={18} className="text-emerald-300" />
                                            AI workout generator
                                        </h2>
                                    </div>
                                    <button type="button" onClick={generateAIPlan} disabled={isGenerating} className="btn-primary h-9 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-50">
                                        {isGenerating ? "Thinking..." : "Generate plan"}
                                    </button>
                                </div>
                                <div className="custom-scrollbar min-h-[170px] max-h-[290px] overflow-y-auto border border-[#26313d] bg-[#131922] p-4 sm:p-5">
                                    {isGenerating ? (
                                        <div className="space-y-3 py-2">
                                            <div className="h-3 w-3/4 animate-pulse bg-emerald-400/20" />
                                            <div className="h-3 w-full animate-pulse bg-emerald-400/10" />
                                            <div className="h-3 w-5/6 animate-pulse bg-emerald-400/10" />
                                            <div className="h-3 w-1/2 animate-pulse bg-emerald-400/10" />
                                        </div>
                                    ) : aiPlan ? (
                                        <div className="space-y-4 text-sm leading-6 text-zinc-300">
                                            <ReactMarkdown
                                                components={{
                                                    strong: ({ children }) => <strong className="font-bold text-zinc-100">{children}</strong>,
                                                    ul: ({ children }) => <ul className="mb-4 list-disc space-y-2 pl-5">{children}</ul>,
                                                    li: ({ children }) => <li className="marker:text-emerald-400">{children}</li>,
                                                    p: ({ children }) => <p className="mb-2">{children}</p>
                                                }}
                                            >
                                                {aiPlan || ""}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="flex min-h-[130px] flex-col justify-center">
                                            <p className="font-mono text-xs uppercase tracking-[0.12em] text-zinc-600">No active prescription</p>
                                            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">Generate a plan to turn your current training data into a focused next session.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="surface-panel p-5 sm:p-6">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="page-eyebrow mb-2">Latest entries</p>
                                        <h2 className="text-lg font-bold tracking-[-0.035em] text-zinc-100">Recent lifts</h2>
                                    </div>
                                    <span className="font-mono text-xs text-zinc-600">{exerciseLogs.length.toString().padStart(2, '0')} LOGS</span>
                                </div>
                                <div className="custom-scrollbar max-h-[335px] overflow-y-auto">
                                    {exerciseLogs.length === 0 ? (
                                        <div className="border-t border-[#26313d] py-8">
                                            <p className="text-sm text-zinc-500">No lifts logged yet. Your latest work will appear here.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-[#26313d] border-y border-[#26313d]">
                                            {exerciseLogs.map((log) => (
                                                <div key={log.id} className="py-4">
                                                    {editingLogId === log.id ? (
                                                        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_4.5rem]">
                                                            <input
                                                                className="form-control h-10 px-3 text-sm"
                                                                value={editLogForm.exerciseName}
                                                                onChange={e => setEditLogForm({...editLogForm, exerciseName: e.target.value})}
                                                                placeholder="Name"
                                                            />
                                                            <input
                                                                type="number" className="form-control h-10 px-3 text-sm"
                                                                value={editLogForm.weight}
                                                                onChange={e => setEditLogForm({...editLogForm, weight: e.target.value})}
                                                                placeholder="kg"
                                                            />
                                                            <input
                                                                type="number" className="form-control h-10 px-3 text-sm"
                                                                value={editLogForm.sets}
                                                                onChange={e => setEditLogForm({...editLogForm, sets: e.target.value})}
                                                                placeholder="Sets"
                                                            />
                                                            <input
                                                                type="number" className="form-control h-10 px-3 text-sm"
                                                                value={editLogForm.reps}
                                                                onChange={e => setEditLogForm({...editLogForm, reps: e.target.value})}
                                                                placeholder="Reps"
                                                            />
                                                            <div className="flex gap-2 sm:col-span-4">
                                                                <button type="button" onClick={handleSaveEditLift} className="btn-primary h-9 px-3 text-xs">Save changes</button>
                                                                <button type="button" onClick={() => setEditingLogId(null)} className="btn-secondary h-9 px-3 text-xs">Cancel</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                                            <div>
                                                                <p className="text-sm font-bold text-emerald-200">{log.exerciseName}</p>
                                                                <p className="mt-1 text-xs text-zinc-500">{new Date(log.dateLogged).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="ml-auto flex items-center gap-3 sm:gap-5">
                                                                <div className="text-right">
                                                                    <p className="data-value text-sm font-bold text-zinc-100">{log.weight} kg</p>
                                                                    <p className="mt-1 text-xs text-zinc-500">{log.sets} sets × {log.reps} reps</p>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <button type="button" onClick={() => startEditLift(log)} className="icon-button h-8 w-8 text-blue-300" title="Edit lift" aria-label={`Edit ${log.exerciseName}`}><Edit2 size={15} /></button>
                                                                    <button type="button" onClick={() => handleDeleteLift(log.id)} className="icon-button h-8 w-8 text-red-300" title="Delete lift" aria-label={`Delete ${log.exerciseName}`}><Trash2 size={15} /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Dashboard
