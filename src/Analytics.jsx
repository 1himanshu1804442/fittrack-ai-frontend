import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import Sidebar from './Sidebar'
import { Menu, Zap, LogOut } from 'lucide-react'

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
        <div className="app-shell flex min-h-screen flex-col md:flex-row">
            {/* Mobile Header */}
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
                            <p className="page-eyebrow mb-3 text-emerald-300">Training analytics</p>
                            <h1 className="page-title">Analytics Dashboard</h1>
                            <p className="page-copy mt-3">Visualize your progress over time.</p>
                        </div>
                        <button type="button" onClick={onLogout} className="btn-danger h-10 px-3.5 text-sm flex items-center gap-2">
                            <LogOut size={16} />
                            Logout
                        </button>
                    </header>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="metric-card p-5">
                            <p className="metric-label">Total Workouts</p>
                            <p className="metric-value">{totalWorkouts}</p>
                        </div>
                        <div className="metric-card p-5">
                            <p className="metric-label">Top Exercise</p>
                            <p className="metric-value truncate">{mostFrequent ? mostFrequent.name : '-'}</p>
                            <p className="text-xs text-[var(--ft-dim)] mt-1">{mostFrequent ? `${mostFrequent.value} total sets` : ''}</p>
                        </div>
                        <div className="metric-card p-5">
                            <p className="metric-label">Current 1RM ({selectedExercise || '-'})</p>
                            <p className="metric-value text-[var(--ft-blue)]">{current1RM} <span className="text-base text-[var(--ft-dim)] font-normal">kg</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Volume Area Chart */}
                        <div className="surface-panel signal-surface p-5 sm:p-6 h-[400px]">
                            <h2 className="text-lg font-bold text-[var(--ft-text)] mb-6">Volume Progression (kg)</h2>
                            {loadingVolume ? (
                                <div className="h-[85%] w-full bg-[var(--ft-surface)] rounded-xl animate-pulse"></div>
                            ) : (
                                <ResponsiveContainer width="100%" height="85%">
                                    <AreaChart data={volumeData}>
                                        <defs>
                                            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--ft-line)" vertical={false} />
                                        <XAxis dataKey="date" stroke="var(--ft-dim)" fontSize={12} tickLine={false} />
                                        <YAxis stroke="var(--ft-dim)" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--ft-surface-raised)', border: '1px solid var(--ft-line)', borderRadius: '0.55rem' }}
                                            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Exercise Distribution Donut Chart */}
                        <div className="surface-panel signal-surface p-5 sm:p-6 h-[400px]">
                            <h2 className="text-lg font-bold text-[var(--ft-text)] mb-6">Exercise Distribution (Sets)</h2>
                            {loadingDistribution ? (
                                <div className="h-[85%] w-full bg-[var(--ft-surface)] rounded-xl animate-pulse"></div>
                            ) : distributionData.length === 0 ? (
                                <div className="h-[80%] flex items-center justify-center text-[var(--ft-dim)] italic text-sm">No exercises logged yet.</div>
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
                                            contentStyle={{ backgroundColor: 'var(--ft-surface-raised)', border: '1px solid var(--ft-line)', borderRadius: '0.55rem', color: 'var(--ft-text)' }}
                                            itemStyle={{ color: 'var(--ft-text)', fontWeight: 'bold' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* 1RM Bar Chart */}
                        <div className="surface-panel signal-surface p-5 sm:p-6 h-[400px] xl:col-span-2">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                                <h2 className="text-lg font-bold text-[var(--ft-text)]">1-Rep Max Progression (kg)</h2>
                                {exerciseNames.length > 0 && (
                                    <select 
                                        value={selectedExercise}
                                        onChange={(e) => setSelectedExercise(e.target.value)}
                                        className="form-control max-w-xs"
                                    >
                                        {exerciseNames.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            
                            {exerciseNames.length === 0 ? (
                                <div className="h-[80%] flex items-center justify-center text-[var(--ft-dim)] italic text-sm">No exercises logged yet.</div>
                            ) : loading1RM ? (
                                <div className="h-[85%] w-full bg-[var(--ft-surface)] rounded-xl animate-pulse"></div>
                            ) : oneRepMaxData.length === 0 ? (
                                <div className="h-[80%] flex items-center justify-center text-[var(--ft-dim)] italic text-sm">Not enough data to calculate 1RM.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="85%">
                                    <BarChart data={oneRepMaxData} barSize={40}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--ft-line)" vertical={false} />
                                        <XAxis dataKey="date" stroke="var(--ft-dim)" fontSize={12} tickLine={false} />
                                        <YAxis stroke="var(--ft-dim)" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--ft-surface-raised)', border: '1px solid var(--ft-line)', borderRadius: '0.55rem' }}
                                            itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                            cursor={{ fill: 'var(--ft-line)', opacity: 0.4 }}
                                            formatter={(value) => [`${value} kg`, '1RM Estimate']}
                                        />
                                        <Bar dataKey="oneRepMax" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Analytics
