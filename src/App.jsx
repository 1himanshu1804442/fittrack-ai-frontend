import { useState, useEffect, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'

function App() {
  // --- Auth State ---
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken') || null)
  const [activeUserId, setActiveUserId] = useState(localStorage.getItem('userId') || null)

  // --- Login Form State ---
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // --- Dashboard State ---
  const [history, setHistory] = useState([])
  const [weight, setWeight] = useState("")
  const [goal, setGoal] = useState("MUSCLE_GAIN")
  const [message, setMessage] = useState("")
  const [aiPlan, setAiPlan] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiError, setAiError] = useState("")

  // --- Authentication Flow ---
  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError("")

    try {
      const response = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (!response.ok) throw new Error("Invalid credentials")

      const data = await response.json()
      const token = data.jwt

      // Decode JWT to get user ID (Quick client-side hack for prototype)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub; // Assuming username or ID is in 'sub'

      // In a real app, your login endpoint should return { jwt, userId }
      // For now, we'll hardcode to user 1 or parse it properly if your backend supports it.
      // Let's assume the user logging in is User ID 1 for now until we update the backend.
      const assignedId = 1;

      localStorage.setItem('jwtToken', token)
      localStorage.setItem('userId', assignedId)

      setJwtToken(token)
      setActiveUserId(assignedId)
    } catch (error) {
      setLoginError("Login failed. Check your username and password.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('jwtToken')
    localStorage.removeItem('userId')
    setJwtToken(null)
    setActiveUserId(null)
    setHistory([])
    setAiPlan("")
  }

  // --- Secured API Calls ---
  const fetchHistory = useCallback(async () => {
    if (!jwtToken || !activeUserId) return;
    try {
      const response = await fetch(`${API_BASE}/api/users/${activeUserId}/history`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      })
      if (response.status === 403) handleLogout(); // Token expired/invalid
      const data = await response.json()
      setHistory(data)
    } catch (error) {
      console.error(error)
    }
  }, [activeUserId, jwtToken])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const generateAIPlan = async () => {
    setIsGenerating(true)
    setAiPlan("")
    setAiError("")

    try {
      const response = await fetch(`${API_BASE}/api/users/${activeUserId}/recommendation`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      })

      if (response.status === 403) {
        handleLogout();
        return;
      }
      if (!response.ok) throw new Error(`Server returned ${response.status}`)

      const data = await response.json()
      setAiPlan(data.recommendation) // Updated from data.aiRecommendation based on your Postman screenshot
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

      if (response.status === 403) handleLogout();

      if (response.ok) {
        setMessage("Profile updated successfully!")
      } else {
        setMessage("Update failed: Server error.")
      }
    } catch (error) {
      console.error(error)
      setMessage("Update failed: Network error.")
    }
  }

  // --- Render Login Screen ---
  if (!jwtToken) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-gray-900 border border-gray-800 p-10 rounded-2xl shadow-2xl max-w-md w-full">
            <h1 className="text-4xl font-extrabold text-blue-500 mb-2 tracking-tight">FitTrack AI</h1>
            <p className="text-gray-400 text-sm mb-8">Login to access your AI coach.</p>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                    required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                    required
                />
              </div>
              <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition disabled:opacity-50"
              >
                {isLoggingIn ? "Authenticating..." : "Login"}
              </button>
              {loginError && <p className="text-red-400 text-sm mt-2 text-center">{loginError}</p>}
            </form>
          </div>
        </div>
    )
  }

  // --- Render Main Dashboard ---
  return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-gray-900 border border-gray-800 p-10 rounded-2xl shadow-2xl max-w-lg w-full">

          <div className="flex justify-between items-center mb-2">
            <h1 className="text-5xl font-extrabold text-blue-500 tracking-tight">FitTrack AI</h1>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-400 transition">Logout</button>
          </div>
          <p className="text-gray-400 text-lg mb-8 text-left">Building your full-stack AI fitness coach.</p>

          <div className="space-y-4">
            <div className="text-left">
              <h2 className="text-xl font-bold text-white mb-4">Update Your Stats</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">Current Weight (kg)</label>
                  <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g. 75.5"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">Primary Goal</label>
                  <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="MUSCLE_GAIN">Muscle Gain</option>
                    <option value="WEIGHT_LOSS">Weight Loss</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
                <button
                    onClick={handleUpdateProfile}
                    className="w-full py-3 mt-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition"
                >
                  Save Changes
                </button>
                {message && <p className="text-green-400 text-sm mt-2">{message}</p>}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800 text-left">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">🧠 AI Coach</h2>
                <button
                    onClick={generateAIPlan}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 text-sm shadow-lg shadow-blue-500/20"
                >
                  {isGenerating ? "Generating..." : "Generate Plan"}
                </button>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 min-h-37.5">
                {isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-full text-blue-500 py-4">
                      <svg className="w-8 h-8 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-sm font-medium animate-pulse">Analyzing profile...</p>
                    </div>
                ) : aiError ? (
                    <div className="text-red-400 font-medium text-center py-4 text-sm">
                      {aiError}
                    </div>
                ) : aiPlan ? (
                    <div className="text-gray-200 whitespace-pre-wrap leading-relaxed text-sm">
                      {aiPlan}
                    </div>
                ) : (
                    <div className="text-gray-500 italic text-center py-4 text-sm">
                      Ready for your custom workout.
                    </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800 text-left">
              <h2 className="text-xl font-bold text-white mb-4">Workout History</h2>
              {history.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">No history yet. Generate your first plan!</p>
              ) : (
                  <div className="space-y-4">
                    {history.map((workout) => (
                        <div key={workout.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                          <small className="text-gray-500 font-bold uppercase tracking-wider block mb-2">
                            {new Date(workout.createdAt).toLocaleDateString()}
                          </small>
                          <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-sm">
                            {workout.aiResponse}
                          </p>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}

export default App