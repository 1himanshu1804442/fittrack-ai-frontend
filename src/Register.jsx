import { useState } from 'react'
import { toast } from 'react-hot-toast'

const API_BASE = 'https://fittrack-ai-backend-production.up.railway.app'

const Register = ({ onSwitchToLogin }) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [goal, setGoal] = useState("MUSCLE_GAIN")
    const [bodyWeight, setBodyWeight] = useState("")
    const [registerError, setRegisterError] = useState("")
    const [isRegistering, setIsRegistering] = useState(false)

    const handleRegister = async (e) => {
        e.preventDefault()
        setIsRegistering(true)

        try {
            const url = `${API_BASE}/api/users/register`
            console.log('Registering to:', url)
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password,
                    goal,
                    bodyWeight: parseFloat(bodyWeight)
                })
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Server error ${response.status}: ${errorText}`)
            }

            toast.success("Account created successfully! Please login.")
            onSwitchToLogin()
        } catch (err) {
            console.error('Registration error:', err)
            toast.error(`Error: ${err.message}`, { duration: 8000 })
        } finally {
            setIsRegistering(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-sans">
            <div className="bg-gray-900 border border-gray-800 p-10 rounded-2xl shadow-2xl max-w-md w-full">
                <h1 className="text-4xl font-extrabold text-blue-500 mb-2 tracking-tight">FitTrack AI</h1>
                <p className="text-gray-400 text-sm mb-8">Create your account.</p>

                <form onSubmit={handleRegister} className="space-y-4 text-left">
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
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold">Current Weight (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={bodyWeight}
                            onChange={(e) => setBodyWeight(e.target.value)}
                            className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold">Primary Goal</label>
                        <select
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="MUSCLE_GAIN">Muscle Gain</option>
                            <option value="WEIGHT_LOSS">Weight Loss</option>
                            <option value="MAINTENANCE">Maintenance</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isRegistering}
                        className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition disabled:opacity-50"
                    >
                        {isRegistering ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <button
                    onClick={onSwitchToLogin}
                    className="mt-6 text-sm text-gray-400 hover:text-blue-400 transition"
                >
                    Already have an account? Login
                </button>
            </div>
        </div>
    )
}

export default Register
