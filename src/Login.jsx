import { useState } from 'react'
import { toast } from 'react-hot-toast'

const API_BASE = ''

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loginError, setLoginError] = useState("")
    const [isLoggingIn, setIsLoggingIn] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoggingIn(true)
        setIsLoggingIn(true)

        try {
            const response = await fetch(`${API_BASE}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            if (!response.ok) throw new Error("Invalid credentials")

            const data = await response.json()
            const token = data.jwt

            // CRITICAL FIX: We completely ignore the token payload here.
            // We explicitly force React to use the integer ID the backend just sent us.
            const userId = data.userId

            if (!userId) {
                console.error("Backend didn't send a userId!");
                throw new Error("Invalid response from server");
            }

            onLoginSuccess(token, userId)
        } catch (error) {
            toast.error("Login failed. Check your username and password.")
        } finally {
            setIsLoggingIn(false)
        }
    }

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
                </form>

                <button
                    onClick={onSwitchToRegister}
                    className="mt-6 text-sm text-gray-400 hover:text-blue-400 transition"
                >
                    Don't have an account? Sign up
                </button>
            </div>
        </div>
    )
}

export default Login
