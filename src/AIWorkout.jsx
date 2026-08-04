import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { Dumbbell, FileText, Menu, Sparkles, Zap } from 'lucide-react'
import { toast } from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'

const API_BASE = ''

const AIWorkout = ({ jwtToken, activeUserId, onLogout, currentView, setCurrentView }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [aiPlan, setAiPlan] = useState("")

    const [formData, setFormData] = useState({
        targetMuscleGroup: 'Full Body',
        equipmentAvailable: 'Full Gym',
        timeAvailable: '45 mins',
        experienceLevel: 'Intermediate',
        focus: 'Hypertrophy'
    })

    useEffect(() => {
        const fetchLatestWorkout = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/users/${activeUserId}/history`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                })
                if (response.ok) {
                    const data = await response.json()
                    if (data && data.length > 0 && data[0].aiResponse) {
                        setAiPlan(data[0].aiResponse)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch latest AI workout", error)
            }
        }
        
        if (activeUserId && jwtToken) {
            fetchLatestWorkout()
        }
    }, [activeUserId, jwtToken])

    const handleGenerate = async () => {
        setIsGenerating(true)
        setAiPlan("")

        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/custom-workout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify(formData)
            })

            if (response.status === 403) {
                toast.error("Session expired.")
                onLogout()
                return
            }

            if (response.ok) {
                const data = await response.json()
                setAiPlan(data.recommendation)
                toast.success("AI Workout Generated!")
            } else {
                toast.error("Failed to generate plan.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Network error while generating AI plan.")
        } finally {
            setIsGenerating(false)
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
                            <p className="page-eyebrow mb-3 text-emerald-300">Custom programming</p>
                            <h1 className="page-title">Build the session you need today.</h1>
                            <p className="page-copy mt-3">Set your available time, equipment, and focus. FitTrack handles the structure.</p>
                        </div>
                        <button type="button" onClick={onLogout} className="btn-danger h-10 px-3.5 text-sm">Logout</button>
                    </header>

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
                        <section className="surface-panel signal-surface p-5 sm:p-6">
                            <div className="mb-7 flex items-start justify-between gap-4">
                                <div>
                                    <p className="page-eyebrow mb-2">Input protocol</p>
                                    <h2 className="text-lg font-bold tracking-[-0.035em] text-zinc-100">Workout parameters</h2>
                                </div>
                                <Dumbbell size={19} className="text-emerald-300" />
                            </div>

                            <div className="space-y-6">
                                <SelectPill 
                                    label="Target muscle group" 
                                    options={['Chest', 'Back', 'Legs', 'Full Body', 'Core', 'Arms', 'Shoulders']} 
                                    value={formData.targetMuscleGroup}
                                    onChange={(val) => setFormData(prev => ({ ...prev, targetMuscleGroup: val }))}
                                />
                                <SelectPill 
                                    label="Equipment available" 
                                    options={['Full Gym', 'Dumbbells Only', 'Bodyweight', 'Resistance Bands']} 
                                    value={formData.equipmentAvailable}
                                    onChange={(val) => setFormData(prev => ({ ...prev, equipmentAvailable: val }))}
                                />
                                <SelectPill 
                                    label="Time available" 
                                    options={['15 mins', '30 mins', '45 mins', '60+ mins']} 
                                    value={formData.timeAvailable}
                                    onChange={(val) => setFormData(prev => ({ ...prev, timeAvailable: val }))}
                                />
                                <SelectPill 
                                    label="Experience level" 
                                    options={['Beginner', 'Intermediate', 'Advanced']} 
                                    value={formData.experienceLevel}
                                    onChange={(val) => setFormData(prev => ({ ...prev, experienceLevel: val }))}
                                />
                                <SelectPill 
                                    label="Primary focus" 
                                    options={['Strength', 'Hypertrophy', 'Endurance', 'Mobility']} 
                                    value={formData.focus}
                                    onChange={(val) => setFormData(prev => ({ ...prev, focus: val }))}
                                />
                            </div>

                            <button 
                                type="button"
                                onClick={handleGenerate} 
                                disabled={isGenerating}
                                className="btn-primary mt-7 h-12 w-full px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Sparkles size={17} />
                                {isGenerating ? "Generating your plan..." : "Generate custom workout"}
                            </button>
                        </section>

                        <section className="surface-panel flex min-h-[580px] flex-col p-5 sm:p-6">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <p className="page-eyebrow mb-2">Session prescription</p>
                                    <h2 className="flex items-center gap-2 text-lg font-bold tracking-[-0.035em] text-zinc-100"><FileText size={18} className="text-blue-300" /> Your plan</h2>
                                </div>
                                <span className="font-mono text-xs text-zinc-600">AI OUTPUT</span>
                            </div>
                            
                            <div className="custom-scrollbar flex-1 overflow-y-auto border border-[#26313d] bg-[#131922] p-5 sm:p-6">
                                {isGenerating ? (
                                    <div className="space-y-4 pt-2">
                                        <div className="h-5 w-3/4 animate-pulse bg-emerald-400/20" />
                                        <div className="h-3 w-full animate-pulse bg-emerald-400/10" />
                                        <div className="h-3 w-5/6 animate-pulse bg-emerald-400/10" />
                                        <div className="h-3 w-1/2 animate-pulse bg-emerald-400/10" />
                                        <div className="mt-8 h-28 w-full animate-pulse bg-emerald-400/10" />
                                    </div>
                                ) : aiPlan ? (
                                    <div className="space-y-4 text-sm leading-7 text-zinc-300">
                                        <ReactMarkdown
                                            components={{
                                                h1: ({ children }) => <h1 className="mb-4 text-2xl font-bold tracking-[-0.04em] text-emerald-300">{children}</h1>,
                                                h2: ({ children }) => <h2 className="mb-3 mt-7 text-xl font-bold tracking-[-0.035em] text-zinc-100">{children}</h2>,
                                                h3: ({ children }) => <h3 className="mb-2 mt-5 text-base font-bold text-zinc-100">{children}</h3>,
                                                strong: ({ children }) => <strong className="font-bold text-zinc-100">{children}</strong>,
                                                ul: ({ children }) => <ul className="mb-4 list-disc space-y-2 pl-5">{children}</ul>,
                                                li: ({ children }) => <li className="marker:text-emerald-400">{children}</li>,
                                                p: ({ children }) => <p className="mb-4">{children}</p>
                                            }}
                                        >
                                            {aiPlan}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="flex h-full min-h-[380px] flex-col justify-center">
                                        <span className="mb-5 grid h-11 w-11 place-items-center border border-emerald-300/20 bg-emerald-400/10 text-emerald-300"><Sparkles size={20} /></span>
                                        <p className="font-mono text-xs uppercase tracking-[0.12em] text-zinc-600">Awaiting parameters</p>
                                        <h3 className="mt-3 text-xl font-bold tracking-[-0.04em] text-zinc-100">Set the constraints. Get the work.</h3>
                                        <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">Choose the conditions around today’s training and generate a specific session when you are ready.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}

const SelectPill = ({ label, options, value, onChange }) => (
    <div>
        <p className="form-label mb-3">{label}</p>
        <div className="flex flex-wrap gap-2">
            {options.map(opt => (
                <button
                    key={opt}
                    type="button"
                    onClick={() => onChange(opt)}
                    className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${value === opt ? 'border-emerald-300/50 bg-emerald-400 text-[#06110c]' : 'border-[#354454] bg-[#10151c] text-zinc-400 hover:border-[#52677b] hover:text-zinc-100'}`}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
)

export default AIWorkout
