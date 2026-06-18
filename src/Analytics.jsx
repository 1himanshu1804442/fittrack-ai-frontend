import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'

const Analytics = ({ jwtToken, activeUserId }) => {
    const [volumeData, setVolumeData] = useState([])
    const [loadingVolume, setLoadingVolume] = useState(true)

    const [exerciseNames, setExerciseNames] = useState([])
    const [selectedExercise, setSelectedExercise] = useState("")
    const [oneRepMaxData, setOneRepMaxData] = useState([])
    const [loading1RM, setLoading1RM] = useState(false)

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

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {/* Volume Chart */}
            <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800 h-[400px]">
                <h2 className="text-lg font-bold text-white mb-6">Volume Progression (kg)</h2>
                {loadingVolume ? (
                    <div className="h-full flex items-center justify-center text-emerald-500">Loading chart...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={volumeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#161B22', border: '1px solid #374151', borderRadius: '8px' }}
                                itemStyle={{ color: '#10b981' }}
                            />
                            <Line type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* 1RM Chart */}
            <div className="bg-[#0f141a] p-6 rounded-2xl border border-gray-800 h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-white">1-Rep Max Progression (kg)</h2>
                    {exerciseNames.length > 0 && (
                        <select 
                            value={selectedExercise}
                            onChange={(e) => setSelectedExercise(e.target.value)}
                            className="bg-[#161B22] border border-gray-700 text-white rounded-lg p-2 text-sm focus:outline-none focus:border-emerald-500"
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
                    <div className="h-[80%] flex items-center justify-center text-emerald-500">Loading chart...</div>
                ) : oneRepMaxData.length === 0 ? (
                    <div className="h-[80%] flex items-center justify-center text-gray-600 italic text-sm">Not enough data to calculate 1RM.</div>
                ) : (
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={oneRepMaxData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#161B22', border: '1px solid #374151', borderRadius: '8px' }}
                                itemStyle={{ color: '#10b981' }}
                                formatter={(value) => [`${value} kg`, '1RM Estimate']}
                            />
                            <Line type="monotone" dataKey="oneRepMax" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}

export default Analytics