import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'
import { toast } from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'

const API_BASE = 'https://fittrack-ai-backend-production.up.railway.app'

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

    const SelectPill = ({ label, options, field }) => (
        <div className="mb-6">
            <label className="text-xs text-gray-500 uppercase font-bold block mb-3">{label}</label>
            <div className="flex flex-wrap gap-3">
                {options.map(opt => (
                    <button
                        key={opt}
                        onClick={() => setFormData({ ...formData, [field]: opt })}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition ${formData[field] === opt ? 'bg-emerald-500 text-black' : 'bg-[#161B22] text-gray-400 hover:bg-[#1C2128] border border-gray-800'}`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    )

    return (
        <div className="flex min-h-screen bg-[#080C10] font-sans flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-[#0D1117] border-b border-gray-800">
                <h1 className="text-xl font-bold text-blue-500">FitTrack AI</h1>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none">
                    <Menu size={24} />
                </button>
            </div>

            <Sidebar currentView={currentView} setCurrentView={setCurrentView} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Advanced AI Workout</h1>
                        <p className="text-gray-400 text-sm">Design the exact workout you need today.</p>
                    </div>
                    <button onClick={onLogout} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg font-bold transition">
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800">
                        <h2 className="text-xl font-bold text-white mb-6">Workout Parameters</h2>

                        <SelectPill 
                            label="Target Muscle Group" 
                            options={['Chest', 'Back', 'Legs', 'Full Body', 'Core', 'Arms', 'Shoulders']} 
                            field="targetMuscleGroup" 
                        />
                        <SelectPill 
                            label="Equipment Available" 
                            options={['Full Gym', 'Dumbbells Only', 'Bodyweight', 'Resistance Bands']} 
                            field="equipmentAvailable" 
                        />
                        <SelectPill 
                            label="Time Available" 
                            options={['15 mins', '30 mins', '45 mins', '60+ mins']} 
                            field="timeAvailable" 
                        />
                        <SelectPill 
                            label="Experience Level" 
                            options={['Beginner', 'Intermediate', 'Advanced']} 
                            field="experienceLevel" 
                        />
                        <SelectPill 
                            label="Primary Focus" 
                            options={['Strength', 'Hypertrophy', 'Endurance', 'Mobility']} 
                            field="focus" 
                        />

                        <button 
                            onClick={handleGenerate} 
                            disabled={isGenerating}
                            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-black text-lg font-bold py-4 rounded-xl transition disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {isGenerating ? "🧠 Generating Your Plan..." : "⚡ Generate Custom Workout"}
                        </button>
                    </div>

                    <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800 flex flex-col h-[600px]">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">🤖 Your Plan</h2>
                        
                        <div className="flex-1 overflow-y-auto bg-[#161B22] p-6 rounded-xl border border-gray-800">
                            {isGenerating ? (
                                <div className="space-y-4">
                                    <div className="w-3/4 h-6 bg-emerald-500/20 animate-pulse rounded"></div>
                                    <div className="w-full h-4 bg-emerald-500/10 animate-pulse rounded"></div>
                                    <div className="w-5/6 h-4 bg-emerald-500/10 animate-pulse rounded"></div>
                                    <div className="w-1/2 h-4 bg-emerald-500/10 animate-pulse rounded"></div>
                                    <div className="w-full h-24 bg-emerald-500/10 animate-pulse rounded mt-6"></div>
                                </div>
                            ) : aiPlan ? (
                                <div className="text-gray-300 space-y-4">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ children }) => <h1 className="text-2xl text-emerald-400 font-bold mb-4">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-xl text-white font-bold mb-3 mt-6">{children}</h2>,
                                            h3: ({ children }) => <h3 className="text-lg text-white font-bold mb-2 mt-4">{children}</h3>,
                                            strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                                            ul: ({ children }) => <ul className="list-disc pl-5 space-y-2 mb-4">{children}</ul>,
                                            li: ({ children }) => <li className="marker:text-emerald-500">{children}</li>,
                                            p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>
                                        }}
                                    >
                                        {aiPlan}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                    <div className="text-4xl mb-4">⚡</div>
                                    <p>Select your parameters and hit generate</p>
                                    <p>to get a personalized AI workout.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AIWorkout
