import { useState, useEffect, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'

const Dashboard = ({ jwtToken, activeUserId, onLogout }) => {
    // Existing state
    const [, setHistory] = useState([])
    const [weight, setWeight] = useState("")
    const [goal, setGoal] = useState("MUSCLE_GAIN")
    const [message, setMessage] = useState("")
    const [aiPlan, setAiPlan] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [, setAiError] = useState("")
    const [sessionMessage, setSessionMessage] = useState("")

    // New state for Exercise Logs
    const [exerciseLogs, setExerciseLogs] = useState([])
    const [exerciseForm, setExerciseForm] = useState({ exerciseName: '', weight: '', sets: '', reps: '' })
    const [logMessage, setLogMessage] = useState("")

    const fetchHistory = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/history`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            })
            if (response.status === 403) {
                setSessionMessage("Session expired.")
                return
            }
            if (response.ok) {
                const data = await response.json()
                setHistory(data)
            }
        } catch (error) {
            console.error(error)
        }
    }, [activeUserId, jwtToken, onLogout])

    const fetchExerciseLogs = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/exercises`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                setExerciseLogs(data)
            }
        } catch (error) {
            console.error(error)
        }
    }, [activeUserId, jwtToken])

    useEffect(() => {
        // fetchHistory and fetchExerciseLogs update state; call them asynchronously
        // to avoid triggering the react-hooks/set-state-in-effect lint rule.
        /* eslint-disable-next-line react-hooks/set-state-in-effect */
        fetchHistory()
        fetchExerciseLogs()
    }, [fetchHistory, fetchExerciseLogs])

    const generateAIPlan = async () => {
        setIsGenerating(true)
        setAiPlan("")
        setAiError("")

        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/recommendation`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            })

            if (response.status === 403) {
                setSessionMessage("Session expired.")
                return
            }
            if (!response.ok) throw new Error(`Server returned ${response.status}`)

            const data = await response.json()
            setAiPlan(data.recommendation)
            await fetchHistory()
        } catch (error) {
            console.error(error)
            setAiError("The AI engine is currently busy. Please try again in a few minutes.")
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
                    goal: goal
                })
            })

            if (response.status === 403) {
                setSessionMessage("Session expired.")
                return
            }

            if (response.ok) {
                setMessage("Profile updated successfully!")
                setTimeout(() => setMessage(""), 3000)
            } else {
                setMessage("Update failed: Server error.")
            }
        } catch (error) {
            console.error(error)
            setMessage("Update failed: Network error.")
        }
    }

    const handleLogWorkout = async (e) => {
        e.preventDefault()
        // Guard: ensure we have a valid token and user id before attempting
        if (!jwtToken || !activeUserId) {
            setLogMessage("You must be logged in to save a lift.")
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

            // If the server returns 403 (forbidden / invalid session) avoid force-logging
            // the user out immediately from this action. Show a friendly message instead
            // so the user doesn't get bounced back to the login screen unexpectedly.
            if (response.status === 403) {
                setLogMessage("Session expired.")
                setSessionMessage("Session expired.")
                return
            }

            if (response.ok) {
                setLogMessage("Lift logged successfully!")
                setExerciseForm({ exerciseName: '', weight: '', sets: '', reps: '' })
                fetchExerciseLogs() // Instantly refresh the list
                setTimeout(() => setLogMessage(""), 3000)
            } else {
                setLogMessage("Failed to log lift.")
            }
        } catch (error) {
            console.error(error)
            setLogMessage("Network error while logging lift.")
        }
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center py-10 px-6 font-sans">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl max-w-4xl w-full">

                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-blue-500 tracking-tight">FitTrack AI</h1>
                        <p className="text-gray-400 mt-1">Your AI-powered lifting & nutrition hub.</p>
                    </div>
                    <button onClick={onLogout} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg font-bold transition">
                        Logout
                    </button>
                </div>

                {/* Session message (shown when token expires) */}
                {sessionMessage && (
                    <div className="mb-4">
                        <p className="text-red-400 text-sm text-center">{sessionMessage}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* Left Column: Stats & Logging */}
                    <div className="space-y-10">

                        {/* Update Profile Stats */}
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                            <h2 className="text-lg font-bold text-white mb-4">Update Body Stats</h2>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Goal</label>
                                    <select
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="MUSCLE_GAIN">Muscle Gain</option>
                                        <option value="WEIGHT_LOSS">Weight Loss</option>
                                        <option value="MAINTENANCE">Maintenance</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleUpdateProfile} className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2.5 font-bold transition">
                                Save Stats
                            </button>
                            {message && <p className="text-green-400 text-sm mt-2 text-center">{message}</p>}
                        </div>

                        {/* Log a Lift Form */}
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                            <h2 className="text-lg font-bold text-white mb-4">Log a Lift</h2>
                            <form onSubmit={handleLogWorkout} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Exercise Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Incline Dumbbell Press"
                                        value={exerciseForm.exerciseName}
                                        onChange={(e) => setExerciseForm({...exerciseForm, exerciseName: e.target.value})}
                                        className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
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
                                            className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        <label className="text-xs text-gray-500 uppercase font-bold">Sets</label>
                                        <input
                                            type="number"
                                            required
                                            value={exerciseForm.sets}
                                            onChange={(e) => setExerciseForm({...exerciseForm, sets: e.target.value})}
                                            className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        <label className="text-xs text-gray-500 uppercase font-bold">Reps</label>
                                        <input
                                            type="number"
                                            required
                                            value={exerciseForm.reps}
                                            onChange={(e) => setExerciseForm({...exerciseForm, reps: e.target.value})}
                                            className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 font-bold transition">
                                    Save Lift
                                </button>
                                {logMessage && (
                                    <p className={`${logMessage === 'Session expired.' ? 'text-red-400' : 'text-green-400'} text-sm mt-2 text-center`}>{logMessage}</p>
                                )}
                            </form>
                        </div>

                    </div>

                    {/* Right Column: Lifts & AI Coach */}
                    <div className="space-y-10">

                        {/* AI Coach */}
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">🧠 AI Coach</h2>
                                <button onClick={generateAIPlan} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition disabled:opacity-50">
                                    {isGenerating ? "Thinking..." : "Generate Plan"}
                                </button>
                            </div>
                            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 min-h-[120px] max-h-[250px] overflow-y-auto">
                                {isGenerating ? (
                                    <p className="text-blue-500 text-sm text-center py-4 animate-pulse">Analyzing...</p>
                                ) : aiPlan ? (
                                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{aiPlan}</p>
                                ) : (
                                    <p className="text-gray-600 italic text-sm text-center py-4">Click generate for a tailored plan.</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Lifts Feed */}
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                            <h2 className="text-lg font-bold text-white mb-4">Recent Lifts</h2>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {exerciseLogs.length === 0 ? (
                                    <p className="text-gray-600 italic text-sm">No lifts logged yet.</p>
                                ) : (
                                    // Reversing the array so the newest lifts show up at the top
                                    [...exerciseLogs].reverse().map((log) => (
                                        <div key={log.id} className="bg-gray-900 border border-gray-800 p-3 rounded-lg flex justify-between items-center">
                                            <div>
                                                <p className="text-blue-400 font-bold text-sm">{log.exerciseName}</p>
                                                <p className="text-gray-400 text-xs mt-0.5">{new Date(log.dateLogged).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-bold">{log.weight} kg</p>
                                                <p className="text-gray-500 text-xs">{log.sets} sets × {log.reps} reps</p>
                                            </div>
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