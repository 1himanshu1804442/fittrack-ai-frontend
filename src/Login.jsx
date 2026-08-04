import { useState } from 'react'
import { ArrowRight, LockKeyhole, UserRound, Zap } from 'lucide-react'
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

            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error(errorMsg || "Invalid credentials");
            }

            const data = await response.json()
            const token = data.jwt

            const userId = data.userId

            if (!userId) {
                console.error("Backend didn't send a userId!")
                throw new Error("Invalid response from server")
            }

            onLoginSuccess(token, userId)
        } catch (error) {
            toast.error(`Login failed: ${error.message}`)
        } finally {
            setIsLoggingIn(false)
        }
    }

    return (
        <main className="auth-shell grid min-h-screen lg:grid-cols-[minmax(0,1.15fr)_minmax(26rem,0.85fr)]">
            <section className="auth-brief training-grid relative hidden min-h-screen overflow-hidden px-10 py-10 lg:flex lg:flex-col xl:px-16 xl:py-14">
                <div className="brand-lockup relative z-10">
                    <span className="brand-mark"><Zap size={17} strokeWidth={2.8} /></span>
                    <span>Fit<strong>Track</strong> AI</span>
                </div>

                <div className="relative z-10 my-auto max-w-xl">
                    <p className="page-eyebrow mb-5 text-emerald-300">Training intelligence / 01</p>
                    <h1 className="max-w-lg text-5xl font-extrabold leading-[0.98] tracking-[-0.065em] text-zinc-100 xl:text-6xl">
                        Train with a record of what you can actually do.
                    </h1>
                    <p className="mt-6 max-w-md text-base leading-7 text-zinc-400">
                        FitTrack turns every set, session, and recovery signal into a clearer next move.
                    </p>
                </div>

                <div className="relative z-10 grid max-w-xl grid-cols-3 gap-5 text-zinc-300">
                    <div className="auth-stat pl-4">
                        <p className="font-mono text-lg font-medium text-emerald-300">01</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">Log the work</p>
                    </div>
                    <div className="auth-stat pl-4">
                        <p className="font-mono text-lg font-medium text-emerald-300">02</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">Read the signal</p>
                    </div>
                    <div className="auth-stat pl-4">
                        <p className="font-mono text-lg font-medium text-emerald-300">03</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">Progress on purpose</p>
                    </div>
                </div>
            </section>

            <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
                <div className="auth-panel w-full">
                    <div className="mb-10 lg:hidden">
                        <div className="brand-lockup">
                            <span className="brand-mark"><Zap size={17} strokeWidth={2.8} /></span>
                            <span>Fit<strong>Track</strong> AI</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <p className="page-eyebrow mb-3 text-emerald-300">Member access</p>
                        <h2 className="page-title">Pick up where you left off.</h2>
                        <p className="page-copy mt-3">Your training history, recovery context, and next session are ready.</p>
                    </div>

                    <form onSubmit={handleLogin} className="surface-panel signal-surface space-y-5 p-5 sm:p-7" noValidate={false}>
                        <div>
                            <label htmlFor="login-username" className="form-label mb-2 block">Username</label>
                            <div className="auth-input-wrap">
                                <UserRound size={17} />
                                <input
                                    id="login-username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="form-control h-12 px-4 text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="login-password" className="form-label mb-2 block">Password</label>
                            <div className="auth-input-wrap">
                                <LockKeyhole size={17} />
                                <input
                                    id="login-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-control h-12 px-4 text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="btn-primary mt-2 h-12 w-full px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoggingIn ? "Authenticating..." : <>Continue to dashboard <ArrowRight size={17} /></>}
                        </button>
                    </form>

                    <p className="mt-6 text-sm text-zinc-500">
                        New to FitTrack?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            className="font-semibold text-emerald-300 transition hover:text-emerald-200"
                        >
                            Create your profile
                        </button>
                    </p>
                </div>
            </section>
        </main>
    )
}

export default Login
