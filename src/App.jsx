import { useState } from 'react'

function App() {
  const [recommendation, setRecommendation] = useState("")
  const [loading, setLoading] = useState(false)
  const [weight, setWeight] = useState("")
  // FIX 1: Change default state to match Java Enum
  const [goal, setGoal] = useState("MUSCLE_GAIN")
  const [message, setMessage] = useState("")

  const handleStart = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/users/4/recommendation')
      const data = await response.json()
      setRecommendation(data.aiRecommendation)
    } catch (error) {
      setRecommendation("Failed to connect to the backend server.")
    }
    setLoading(false)
  }

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/4', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bodyWeight: Number(weight),
          goal: goal
        })
      });

      if (response.ok) {
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Update failed: Server error.");
      }
    } catch (error) {
      setMessage("Update failed: Network error.");
    }
  }; // <--- This closing brace is vital!

  return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-gray-900 border border-gray-800 p-10 rounded-2xl shadow-2xl max-w-lg w-full">
          <h1 className="text-5xl font-extrabold text-blue-500 mb-2 tracking-tight">FitTrack AI</h1>
          <p className="text-gray-400 text-lg mb-8">Building your full-stack AI fitness coach.</p>

          <div className="space-y-4">
            {recommendation && (
                <div className="p-4 bg-blue-900/20 rounded-xl text-left border border-blue-500/30 animate-fade-in">
                  <p className="text-white leading-relaxed">{recommendation}</p>
                </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-800 text-left">
              <h2 className="text-xl font-bold text-white mb-4">Update Your Stats</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">Current Weight (kg)</label>
                  <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g. 75.5"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">Primary Goal</label>
                  {/* FIX 2: Updated Select Options to match Java Enum constants */}
                  <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="MUSCLE_GAIN">Muscle Gain</option>
                    <option value="WEIGHT_LOSS">Weight Loss</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>

                <button
                    onClick={handleUpdateProfile}
                    className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                >
                  Save Changes
                </button>
                {message && <p className="text-green-400 text-sm mt-2">{message}</p>}
              </div>
            </div>

            <button
                onClick={handleStart}
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-blue-500/20"
            >
              {loading ? "AI is thinking..." : "Start My Session"}
            </button>
          </div>
        </div>
      </div>
  )
}

export default App