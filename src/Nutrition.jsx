import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { Menu, Search, Plus, Trash2, Settings, X, Save, Zap, LogOut } from 'lucide-react'
import { toast } from 'react-hot-toast'

const API_BASE = ''

const Nutrition = ({ jwtToken, activeUserId, onLogout, currentView, setCurrentView }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [logs, setLogs] = useState([])
    const [timeframe, setTimeframe] = useState('daily')

    const [goals, setGoals] = useState({
        calorieGoal: 2500,
        proteinGoal: 180,
        carbsGoal: 250,
        fatGoal: 75
    })
    const [isEditingGoals, setIsEditingGoals] = useState(false)
    const [editGoals, setEditGoals] = useState({ ...goals })

    const fetchGoals = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            })
            if (response.ok) {
                const user = await response.json()
                setGoals({
                    calorieGoal: user.calorieGoal || 2500,
                    proteinGoal: user.proteinGoal || 180,
                    carbsGoal: user.carbsGoal || 250,
                    fatGoal: user.fatGoal || 75
                })
                setEditGoals({
                    calorieGoal: user.calorieGoal || 2500,
                    proteinGoal: user.proteinGoal || 180,
                    carbsGoal: user.carbsGoal || 250,
                    fatGoal: user.fatGoal || 75
                })
            }
        } catch (error) {
            console.error("Failed to fetch user goals:", error)
        }
    }

    const fetchLogs = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/food?period=${timeframe}`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            })
            if (response.ok) {
                const data = await response.json()
                setLogs(data)
            }
        } catch (error) {
            console.error("Failed to fetch food logs:", error)
        }
    }

    useEffect(() => {
        if (jwtToken && activeUserId) {
            fetchGoals()
        }
    }, [jwtToken, activeUserId])

    useEffect(() => {
        if (jwtToken && activeUserId) {
            fetchLogs()
        }
    }, [jwtToken, activeUserId, timeframe])

    const saveGoals = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify(editGoals)
            })
            if (response.ok) {
                setGoals(editGoals)
                setIsEditingGoals(false)
                toast.success("Goals updated!")
            } else {
                toast.error("Failed to save goals.")
            }
        } catch (error) {
            toast.error("Network error.")
        }
    }

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setIsSearching(true)
        try {
            const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(searchQuery)}&pageSize=10&api_key=DEMO_KEY`)
            const data = await response.json()
            
            // Filter products
            const validProducts = (data.foods || []).filter(p => p.description)
            setSearchResults(validProducts)
            if (validProducts.length === 0) {
                toast.error("No matches found.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to search food database.")
        } finally {
            setIsSearching(false)
        }
    }

    const addFoodLog = async (product) => {
        const nutrients = product.foodNutrients || []
        
        const getNutrient = (nameOrId) => {
            const nut = nutrients.find(n => n.nutrientName === nameOrId || n.nutrientId === nameOrId)
            return nut ? (nut.value || 0) : 0
        }

        const payload = {
            foodName: product.description,
            calories: Math.round(getNutrient(1008) || getNutrient('Energy')),
            protein: Math.round(getNutrient(1003) * 10) / 10,
            carbs: Math.round(getNutrient(1005) * 10) / 10,
            fat: Math.round(getNutrient(1004) * 10) / 10
        }

        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/food`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                toast.success(`Logged ${payload.foodName}!`)
                setSearchQuery("")
                setSearchResults([])
                fetchLogs()
            } else {
                toast.error("Failed to log food.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Network error.")
        }
    }

    const deleteFoodLog = async (id) => {
        try {
            const response = await fetch(`${API_BASE}/api/users/${activeUserId}/food/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            })
            if (response.ok) {
                toast.success("Log removed.")
                fetchLogs()
            }
        } catch (error) {
            console.error(error)
        }
    }

    const divisor = timeframe === 'weekly' ? 7 : timeframe === 'monthly' ? 30 : 1
    
    const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0) / divisor
    const totalProtein = logs.reduce((sum, log) => sum + log.protein, 0) / divisor
    const totalCarbs = logs.reduce((sum, log) => sum + log.carbs, 0) / divisor
    const totalFat = logs.reduce((sum, log) => sum + log.fat, 0) / divisor

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
                            <p className="page-eyebrow mb-3 text-emerald-300">Fuel tracking</p>
                            <h1 className="page-title">Nutrition Tracker</h1>
                            <p className="page-copy mt-3">Log your meals and hit your daily macros instantly.</p>
                        </div>
                        <button type="button" onClick={onLogout} className="btn-danger h-10 px-3.5 text-sm flex items-center gap-2">
                            <LogOut size={16} /> Logout
                        </button>
                    </header>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        
                        {/* Left Column: Search & Log List */}
                        <div className="xl:col-span-2 space-y-8">
                            <div className="surface-panel signal-surface p-5 sm:p-6">
                                <h2 className="text-lg font-bold text-[var(--ft-text)] mb-4">Quick Log Food</h2>
                                <form onSubmit={handleSearch} className="flex gap-3">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search size={18} className="text-[var(--ft-muted)]" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search any food (e.g., 'Chicken Breast')"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="form-control w-full pl-10 pr-4 py-3"
                                        />
                                    </div>
                                    <button type="submit" disabled={isSearching} className="btn-primary px-6 py-3 disabled:opacity-50 transition">
                                        {isSearching ? "..." : "Search"}
                                    </button>
                                </form>

                                {searchResults.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {searchResults.map((product, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-[var(--ft-surface)] border border-[var(--ft-line)] rounded-lg hover:border-[var(--ft-emerald)] transition group">
                                                <div>
                                                    <p className="text-[var(--ft-text)] font-bold text-sm">{product.description}</p>
                                                    <p className="text-[var(--ft-muted)] text-xs mt-0.5">
                                                        {Math.round(product.foodNutrients?.find(n => n.nutrientId === 1008)?.value || 0)} kcal | P: {Math.round(product.foodNutrients?.find(n => n.nutrientId === 1003)?.value || 0)}g | C: {Math.round(product.foodNutrients?.find(n => n.nutrientId === 1005)?.value || 0)}g | F: {Math.round(product.foodNutrients?.find(n => n.nutrientId === 1004)?.value || 0)}g (per 100g/serving)
                                                    </p>
                                                </div>
                                                <button type="button" onClick={() => addFoodLog(product)} className="text-[var(--ft-emerald)] hover:text-emerald-400 p-2 bg-emerald-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition">
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="surface-panel signal-surface p-5 sm:p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-[var(--ft-text)]">Log History</h2>
                                    <div className="flex bg-[var(--ft-surface)] rounded-lg p-1 border border-[var(--ft-line)]">
                                        {['daily', 'weekly', 'monthly'].map(t => (
                                            <button 
                                                key={t}
                                                type="button"
                                                onClick={() => setTimeframe(t)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition capitalize ${timeframe === t ? 'btn-primary' : 'btn-secondary'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {logs.length === 0 ? (
                                    <p className="text-[var(--ft-dim)] italic text-sm py-4">No food logged for this period.</p>
                                ) : (
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {logs.map(log => (
                                            <div key={log.id} className="flex justify-between items-center p-4 bg-[var(--ft-surface)] border border-[var(--ft-line)] rounded-xl">
                                                <div>
                                                    <p className="text-[var(--ft-emerald)] font-bold text-sm">{log.foodName}</p>
                                                    <p className="text-[var(--ft-muted)] text-xs mt-1">
                                                        {log.calories} kcal • {log.protein}g P • {log.carbs}g C • {log.fat}g F
                                                        <span className="ml-2 text-[var(--ft-dim)]">({new Date(log.dateLogged).toLocaleDateString()})</span>
                                                    </p>
                                                </div>
                                                {timeframe === 'daily' && (
                                                    <button type="button" onClick={() => deleteFoodLog(log.id)} className="text-[var(--ft-red)] opacity-50 hover:opacity-100 transition">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Macro Progress & Goals */}
                        <div className="space-y-8">
                            <div className="surface-panel signal-surface p-5 sm:p-6 h-fit">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold text-[var(--ft-text)]">
                                        {timeframe === 'daily' ? 'Daily Summary' : `Daily Average (${timeframe})`}
                                    </h2>
                                    <button type="button" onClick={() => setIsEditingGoals(!isEditingGoals)} className="text-[var(--ft-muted)] hover:text-[var(--ft-emerald)] transition">
                                        <Settings size={20} />
                                    </button>
                                </div>

                                {isEditingGoals && (
                                    <div className="mb-6 p-4 bg-[var(--ft-surface)] rounded-xl border border-[var(--ft-line)]">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-sm font-bold text-[var(--ft-text)]">Edit Daily Goals</h3>
                                            <button type="button" onClick={() => setIsEditingGoals(false)} className="text-[var(--ft-muted)] hover:text-[var(--ft-red)]"><X size={16}/></button>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="form-label block mb-1">Calories (kcal)</label>
                                                <input type="number" value={editGoals.calorieGoal} onChange={e => setEditGoals({...editGoals, calorieGoal: Number(e.target.value)})} className="form-control w-full" />
                                            </div>
                                            <div>
                                                <label className="form-label block mb-1">Protein (g)</label>
                                                <input type="number" value={editGoals.proteinGoal} onChange={e => setEditGoals({...editGoals, proteinGoal: Number(e.target.value)})} className="form-control w-full" />
                                            </div>
                                            <div>
                                                <label className="form-label block mb-1">Carbs (g)</label>
                                                <input type="number" value={editGoals.carbsGoal} onChange={e => setEditGoals({...editGoals, carbsGoal: Number(e.target.value)})} className="form-control w-full" />
                                            </div>
                                            <div>
                                                <label className="form-label block mb-1">Fat (g)</label>
                                                <input type="number" value={editGoals.fatGoal} onChange={e => setEditGoals({...editGoals, fatGoal: Number(e.target.value)})} className="form-control w-full" />
                                            </div>
                                            <button type="button" onClick={saveGoals} className="btn-primary w-full flex justify-center items-center gap-2 mt-2">
                                                <Save size={16} /> Save Goals
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="mb-8 text-center">
                                    <div className="metric-value">{Math.round(totalCalories)}</div>
                                    <div className="metric-label mt-1">Calories {timeframe === 'daily' ? 'Consumed' : 'Per Day'}</div>
                                </div>

                                <ProgressBar label="Protein" current={totalProtein} max={goals.proteinGoal} colorClass="bg-blue-500" />
                                <ProgressBar label="Carbs" current={totalCarbs} max={goals.carbsGoal} colorClass="bg-emerald-500" />
                                <ProgressBar label="Fat" current={totalFat} max={goals.fatGoal} colorClass="bg-purple-500" />
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}

const ProgressBar = ({ label, current, max, colorClass }) => {
    const percentage = Math.min((current / max) * 100, 100)
    return (
        <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
                <span className="metric-label">{label}</span>
                <span className="text-[var(--ft-text)] font-bold">{Math.round(current)} / {max}</span>
            </div>
            <div className="w-full bg-[var(--ft-surface)] rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    )
}

export default Nutrition
