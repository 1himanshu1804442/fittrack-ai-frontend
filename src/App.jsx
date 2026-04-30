import { useState, useEffect } from 'react'

function App() {
  const [history, setHistory] = useState([])
  const [weight, setWeight] = useState("")
  const [goal, setGoal] = useState("MUSCLE_GAIN")
  const [message, setMessage] = useState("")

  const [aiPlan, setAiPlan] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiError, setAiError] = useState("")

  const [activeUserId, setActiveUserId] = useState(4)

  const fetchHistory = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${activeUserId}/history`)
      const data = await response.json()
      setHistory(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (activeUserId) {
      fetchHistory()
    }
  }, [activeUserId])

  const generateAIPlan = async () => {
    setIsGenerating(true)
    setAiPlan("")
    setAiError("")

    try {
      const response = await fetch(`http://localhost:8080/api/users/${activeUserId}/recommendation`)

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }

      const data = await response.json()
      setAiPlan(data.aiRecommendation)
      await fetchHistory()
    } catch (error) {
      setAiError("The AI engine is currently busy. Please try again in a few minutes.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${activeUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bodyWeight: Number(weight),
          goal: goal
        })
      })

      if (response.ok) {
        setMessage("Profile updated successfully!")
      } else {
        setMessage("Update failed: Server error.")
      }
    } catch (error) {
      setMessage("Update failed: Network error.")
    }
  }

  return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-gray-900 border border-gray-800 p-10 rounded-2xl shadow-2xl max-w-lg w-full">
          <h1 className="text-5xl font-extrabold text-blue-500 mb-2 tracking-tight">FitTrack AI</h1>
          <p className="text-gray-400 text-lg mb-8">Building your full-stack AI fitness coach.</p>

          <div className="mb-6 text-left border-b border-gray-800 pb-6">
            <label className="text-xs text-gray-500 uppercase font-bold">Simulate User ID:</label>
            <select
                value={activeUserId}
                onChange={(e) => setActiveUserId(e.target.value)}
                className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="1">Test User 1</option>
              <option value="2">Test User 2</option>
              <option value="4">Himanshu</option>
            </select>
          </div>

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

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 min-h-[150px]">
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