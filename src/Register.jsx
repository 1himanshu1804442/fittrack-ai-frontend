import { useState } from 'react'
import { ArrowRight, LockKeyhole, Scale, Target, UserRound, Zap } from 'lucide-react'
import { toast } from 'react-hot-toast'

const API_BASE = ''

const Register = ({ onSwitchToLogin }) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [goal, setGoal] = useState("MUSCLE_GAIN")
    const [bodyWeight, setBodyWeight] = useState("")
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
        <main className="auth-shell grid min-h-screen lg:grid-cols-[minmax(0,1.15fr)_minmax(26rem,0.85fr)]">
            <section className="auth-brief training-grid relative hidden min-h-screen overflow-hidden px-10 py-10 lg:flex lg:flex-col xl:px-16 xl:py-14">
                <div className="brand-lockup relative z-10">
                    <span className="brand-mark"><Zap size={17} strokeWidth={2.8} /></span>
                    <span>Fit<strong>Track</strong> AI</span>
                </div>

                <div className="relative z-10 my-auto max-w-xl">
                    <p className="page-eyebrow mb-5 text-emerald-300">Athlete profile / start</p>
                    <h1 className="max-w-lg text-5xl font-extrabold leading-[0.98] tracking-[-0.065em] text-zinc-100 xl:text-6xl">
                        Build a training system that gets sharper every week.
                    </h1>
                    <p className="mt-6 max-w-md text-base leading-7 text-zinc-400">
                        Start with your baseline. FitTrack keeps the useful details close when it is time to train.
                    </p>
                </div>

                <div className="relative z-10 max-w-xl border-t border-zinc-700/70 pt-5 text-sm text-zinc-500">
                    No generic plans. Your profile shapes the work that appears next.
                </div>
            </section>

            <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
                <div className="auth-panel w-full">
                    <div className="mb-8 lg:hidden">
                        <div className="brand-lockup">
                            <span className="brand-mark"><Zap size={17} strokeWidth={2.8} /></span>
                            <span>Fit<strong>Track</strong> AI</span>
                        </div>
                    </div>

                    <div className="mb-7">
                        <p className="page-eyebrow mb-3 text-emerald-300">New athlete profile</p>
                        <h2 className="page-title">Set your baseline.</h2>
                        <p className="page-copy mt-3">A few details help calibrate your training dashboard from day one.</p>
                    </div>

                    <form onSubmit={handleRegister} className="surface-panel signal-surface grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
                        <div className="sm:col-span-2">
                            <label htmlFor="register-username" className="form-label mb-2 block">Username</label>
                            <div className="auth-input-wrap">
                                <UserRound size={17} />
                                <input
                                    id="register-username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="form-control h-12 px-4 text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="register-password" className="form-label mb-2 block">Password</label>
                            <div className="auth-input-wrap">
                                <LockKeyhole size={17} />
                                <input
                                    id="register-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-control h-12 px-4 text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="register-weight" className="form-label mb-2 block">Current weight (kg)</label>
                            <div className="auth-input-wrap">
                                <Scale size={17} />
                                <input
                                    id="register-weight"
                                    type="number"
                                    step="0.1"
                                    value={bodyWeight}
                                    onChange={(e) => setBodyWeight(e.target.value)}
                                    className="form-control h-12 px-4 text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="register-goal" className="form-label mb-2 block">Primary goal</label>
                            <div className="auth-input-wrap">
                                <Target size={17} />
                                <select
                                    id="register-goal"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    className="form-control h-12 px-4 text-sm"
                                >
                                    <option value="MUSCLE_GAIN">Muscle Gain</option>
                                    <option value="WEIGHT_LOSS">Weight Loss</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isRegistering}
                            className="btn-primary h-12 w-full px-4 text-sm sm:col-span-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isRegistering ? "Creating Account..." : <>Create profile <ArrowRight size={17} /></>}
                        </button>
                    </form>

                    <p className="mt-6 text-sm text-zinc-500">
                        Already training with FitTrack?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="font-semibold text-emerald-300 transition hover:text-emerald-200"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </section>
        </main>
    )
}

export default Register
