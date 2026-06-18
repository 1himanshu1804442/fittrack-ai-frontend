import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'

const API_BASE = ''
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#6366f1', '#eab308', '#f43f5e']

const Analytics = ({ jwtToken, activeUserId, onLogout, currentView, setCurrentView }) => {
    const [volumeData, setVolumeData] = useState([])
    const [loadingVolume, setLoadingVolume] = useState(true)

    const [exerciseNames, setExerciseNames] = useState([])
    const [selectedExercise, setSelectedExercise] = useState("")
    const [oneRepMaxData, setOneRepMaxData] = useState([])
    const [loading1RM, setLoading1RM] = useState(false)

    const [distributionData, setDistributionData] = useState([])
    const [loadingDistribution, setLoadingDistribution] = useState(true)

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const fetchVolume = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/users/${activeUserId}/analytics/volume`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                })
                if (response.ok) {
                    const result = await response.json()
                    setVolumeData(result)
                }
            } catch (error) {
                console.error("Failed to fetch volume analytics:", error)
            } finally {
                setLoadingVolume(false)
            }
        }
        fetchVolume()
    }, [activeUserId, jwtToken])

    useEffect(() => {
        const fetchDistribution = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/users/${activeUserId}/exercises/distribution`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                })
                if (response.ok) {
                    const result = await response.json()
                    // Rename keys for recharts
                    const formatted = result.map(item => ({ name: item.exerciseName, value: item.totalSets }))
                    setDistributionData(formatted)
                }
            } catch (error) {
                console.error("Failed to fetch distribution:", error)
            } finally {
                setLoadingDistribution(false)
            }
        }
        fetchDistribution()
    }, [activeUserId, jwtToken])

    useEffect(() => {
        const fetchExerciseNames = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/users/${activeUserId}/exercises/names`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                })
                if (response.ok) {
                    const result = await response.json()
                    setExerciseNames(result)
                    if (result.length > 0) {
                        setSelectedExercise(result[0])
                    }
                }
            } catch (error) {
                console.error("Failed to fetch exercise names:", error)
            }
        }
        fetchExerciseNames()
    }, [activeUserId, jwtToken])

    useEffect(() => {
        if (!selectedExercise) return;
        
        const fetch1RMData = async () => {
            setLoading1RM(true)
            try {
                const response = await fetch(`${API_BASE}/api/users/${activeUserId}/exercises/analytics?exerciseName=${encodeURIComponent(selectedExercise)}`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                })
                if (response.ok) {
                    const result = await response.json()
                    setOneRepMaxData(result)
                }
            } catch (error) {
                console.error("Failed to fetch 1RM analytics:", error)
            } finally {
                setLoading1RM(false)
            }
        }
        fetch1RMData()
    }, [activeUserId, jwtToken, selectedExercise])

    // Summary Stats
    const totalWorkouts = volumeData.length
    const mostFrequent = distributionData.length > 0 ? distributionData[0] : null
    const current1RM = oneRepMaxData.length > 0 ? oneRepMaxData[oneRepMaxData.length - 1].oneRepMax : 0

    return (
        <div className="flex min-h-screen bg-[#080C10] font-sans flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-[#0D1117] border-b border-gray-800">
                <h1 className="text-xl font-bold text-emerald-500">FitTrack AI</h1>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none">
                    <Menu size={24} />
                </button>
            </div>

            <Sidebar currentView={currentView} setCurrentView={setCurrentView} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
            
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Analytics Dashboard</h1>
                        <p className="text-gray-400 text-sm">Visualize your progress over time.</p>
                    </div>
                    <button onClick={onLogout} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg font-bold transition">
                        Logout
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800 flex flex-col justify-center">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Workouts</p>
                        <p className="text-3xl font-black text-white">{totalWorkouts}</p>
                    </div>
                    <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800 flex flex-col justify-center">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Top Exercise</p>
                        <p className="text-3xl font-black text-emerald-400 truncate">{mostFrequent ? mostFrequent.name : '-'}</p>
                        <p className="text-xs text-gray-500 mt-1">{mostFrequent ? `${mostFrequent.value} total sets` : ''}</p>
                    </div>
                    <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800 flex flex-col justify-center">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Current 1RM ({selectedExercise || '-'})</p>
                        <p className="text-3xl font-black text-blue-400">{current1RM} <span className="text-base text-gray-500 font-normal">kg</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Volume Area Chart */}
                    <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800 h-[400px]">
                        <h2 className="text-lg font-bold text-white mb-6">Volume Progression (kg)</h2>
                        {loadingVolume ? (
                            <div className="h-[85%] w-full bg-[#161B22] border border-gray-800 rounded-xl animate-pulse"></div>
                        ) : (
                            <ResponsiveContainer width="100%" height="85%">
                                <AreaChart data={volumeData}>
                                    <defs>
                                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#161B22', border: '1px solid #374151', borderRadius: '8px' }}
                                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Exercise Distribution Donut Chart */}
                    <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800 h-[400px]">
                        <h2 className="text-lg font-bold text-white mb-6">Exercise Distribution (Sets)</h2>
                        {loadingDistribution ? (
                            <div className="h-[85%] w-full bg-[#161B22] border border-gray-800 rounded-xl animate-pulse"></div>
                        ) : distributionData.length === 0 ? (
                            <div className="h-[80%] flex items-center justify-center text-gray-600 italic text-sm">No exercises logged yet.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="85%">
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#161B22', border: '1px solid #374151', borderRadius: '8px', color: 'white' }}
                                        itemStyle={{ color: 'white', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* 1RM Bar Chart */}
                    <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800 h-[400px] xl:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-white">1-Rep Max Progression (kg)</h2>
                            {exerciseNames.length > 0 && (
                                <select 
                                    value={selectedExercise}
                                    onChange={(e) => setSelectedExercise(e.target.value)}
                                    className="bg-[#161B22] border border-gray-700 text-white rounded-lg p-2 text-sm focus:outline-none focus:border-emerald-500 font-bold"
                                >
                                    {exerciseNames.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        
                        {exerciseNames.length === 0 ? (
                            <div className="h-[80%] flex items-center justify-center text-gray-600 italic text-sm">No exercises logged yet.</div>
                        ) : loading1RM ? (
                            <div className="h-[85%] w-full bg-[#161B22] border border-gray-800 rounded-xl animate-pulse"></div>
                        ) : oneRepMaxData.length === 0 ? (
                            <div className="h-[80%] flex items-center justify-center text-gray-600 italic text-sm">Not enough data to calculate 1RM.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="85%">
                                <BarChart data={oneRepMaxData} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#161B22', border: '1px solid #374151', borderRadius: '8px' }}
                                        itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                        cursor={{ fill: '#1f2937', opacity: 0.4 }}
                                        formatter={(value) => [`${value} kg`, '1RM Estimate']}
                                    />
                                    <Bar dataKey="oneRepMax" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Analytics
