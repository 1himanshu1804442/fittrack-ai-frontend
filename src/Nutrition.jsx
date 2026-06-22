import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { Menu, Search, Plus, Trash2, Settings, X, Save } from 'lucide-react'
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
        <div className="flex min-h-screen bg-[#080C10] font-sans flex-col md:flex-row">
            <div className="md:hidden flex items-center justify-between p-4 bg-[#0D1117] border-b border-gray-800">
                <h1 className="text-xl font-bold text-emerald-500">FitTrack AI</h1>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
                    <Menu size={24} />
                </button>
            </div>

            <Sidebar currentView={currentView} setCurrentView={setCurrentView} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Nutrition Tracker</h1>
                        <p className="text-gray-400 text-sm">Log your meals and hit your daily macros instantly.</p>
                    </div>
                    <button onClick={onLogout} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg font-bold transition">
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* Left Column: Search & Log List */}
                    <div className="xl:col-span-2 space-y-8">
                        <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800">
                            <h2 className="text-lg font-bold text-white mb-4">Quick Log Food</h2>
                            <form onSubmit={handleSearch} className="flex gap-3">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={18} className="text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search any food (e.g., 'Chicken Breast')"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-[#161B22] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition"
                                    />
                                </div>
                                <button type="submit" disabled={isSearching} className="bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-3 rounded-xl font-bold transition disabled:opacity-50">
                                    {isSearching ? "..." : "Search"}
                                </button>
                            </form>

                            {searchResults.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {searchResults.map((product, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-[#161B22] border border-gray-800 rounded-lg hover:border-emerald-500/50 transition group">
                                            <div>
                                                <p className="text-white font-bold text-sm">{product.description}</p>
                                                <p className="text-gray-500 text-xs mt-0.5">
                                                    {Math.round(product.foodNutrients?.find(n => n.nutrientId === 1008)?.value || 0)} kcal | P: {Math.round(product.foodNutrients?.find(n => n.nutrientId === 1003)?.value || 0)}g | C: {Math.round(product.foodNutrients?.find(n => n.nutrientId === 1005)?.value || 0)}g | F: {Math.round(product.foodNutrients?.find(n => n.nutrientId === 1004)?.value || 0)}g (per 100g/serving)
                                                </p>
                                            </div>
                                            <button onClick={() => addFoodLog(product)} className="text-emerald-500 hover:text-emerald-400 p-2 bg-emerald-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition">
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-white">Log History</h2>
                                <div className="flex bg-[#161B22] rounded-lg p-1 border border-gray-800">
                                    {['daily', 'weekly', 'monthly'].map(t => (
                                        <button 
                                            key={t}
                                            onClick={() => setTimeframe(t)}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition capitalize ${timeframe === t ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {logs.length === 0 ? (
                                <p className="text-gray-600 italic text-sm py-4">No food logged for this period.</p>
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {logs.map(log => (
                                        <div key={log.id} className="flex justify-between items-center p-4 bg-[#161B22] border border-gray-800 rounded-xl">
                                            <div>
                                                <p className="text-emerald-400 font-bold text-sm">{log.foodName}</p>
                                                <p className="text-gray-400 text-xs mt-1">
                                                    {log.calories} kcal • {log.protein}g P • {log.carbs}g C • {log.fat}g F
                                                    <span className="ml-2 text-gray-600">({new Date(log.dateLogged).toLocaleDateString()})</span>
                                                </p>
                                            </div>
                                            {timeframe === 'daily' && (
                                                <button onClick={() => deleteFoodLog(log.id)} className="text-red-500/50 hover:text-red-500 transition">
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
                        <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800 h-fit">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-white">
                                    {timeframe === 'daily' ? 'Daily Summary' : `Daily Average (${timeframe})`}
                                </h2>
                                <button onClick={() => setIsEditingGoals(!isEditingGoals)} className="text-gray-500 hover:text-emerald-400 transition">
                                    <Settings size={20} />
                                </button>
                            </div>

                            {isEditingGoals ? (
                                <div className="mb-6 p-4 bg-[#161B22] rounded-xl border border-gray-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-sm font-bold text-white">Edit Daily Goals</h3>
                                        <button onClick={() => setIsEditingGoals(false)} className="text-gray-500 hover:text-red-400"><X size={16}/></button>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1 uppercase tracking-wider font-bold">Calories (kcal)</label>
                                            <input type="number" value={editGoals.calorieGoal} onChange={e => setEditGoals({...editGoals, calorieGoal: Number(e.target.value)})} className="w-full bg-[#0D1117] border border-gray-700 text-white p-2 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1 uppercase tracking-wider font-bold">Protein (g)</label>
                                            <input type="number" value={editGoals.proteinGoal} onChange={e => setEditGoals({...editGoals, proteinGoal: Number(e.target.value)})} className="w-full bg-[#0D1117] border border-gray-700 text-white p-2 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1 uppercase tracking-wider font-bold">Carbs (g)</label>
                                            <input type="number" value={editGoals.carbsGoal} onChange={e => setEditGoals({...editGoals, carbsGoal: Number(e.target.value)})} className="w-full bg-[#0D1117] border border-gray-700 text-white p-2 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1 uppercase tracking-wider font-bold">Fat (g)</label>
                                            <input type="number" value={editGoals.fatGoal} onChange={e => setEditGoals({...editGoals, fatGoal: Number(e.target.value)})} className="w-full bg-[#0D1117] border border-gray-700 text-white p-2 rounded-lg text-sm focus:border-emerald-500 outline-none" />
                                        </div>
                                        <button onClick={saveGoals} className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2 rounded-lg flex justify-center items-center gap-2 mt-2">
                                            <Save size={16} /> Save Goals
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                            
                            <div className="mb-8 text-center">
                                <div className="text-4xl font-black text-white">{Math.round(totalCalories)}</div>
                                <div className="text-gray-500 text-xs uppercase font-bold tracking-widest mt-1">Calories {timeframe === 'daily' ? 'Consumed' : 'Per Day'}</div>
                            </div>

                            <ProgressBar label="Protein" current={totalProtein} max={goals.proteinGoal} colorClass="bg-blue-500" />
                            <ProgressBar label="Carbs" current={totalCarbs} max={goals.carbsGoal} colorClass="bg-emerald-500" />
                            <ProgressBar label="Fat" current={totalFat} max={goals.fatGoal} colorClass="bg-purple-500" />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

const ProgressBar = ({ label, current, max, colorClass }) => {
    const percentage = Math.min((current / max) * 100, 100)
    return (
        <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400 font-bold uppercase text-xs">{label}</span>
                <span className="text-white font-bold">{Math.round(current)} / {max}</span>
            </div>
            <div className="w-full bg-[#161B22] rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    )
}

export default Nutrition
