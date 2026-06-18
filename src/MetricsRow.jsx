import React from 'react'

const MetricCard = ({ title, value, icon, trendIcon, trendText, iconColor, trendColor }) => {
    return (
        <div className="bg-[#0f141a] border border-gray-800 rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col justify-between hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-2 md:flex-col md:items-start md:gap-0">
                <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${iconColor} bg-opacity-10 md:mb-4`}>
                    <span className="text-base md:text-xl">{icon}</span>
                </div>
                <div className="flex-1 md:flex-none">
                    <h3 className="text-gray-400 text-xs md:text-sm font-medium">{title}</h3>
                    <span className="text-lg md:text-2xl font-bold text-white">{value}</span>
                </div>
            </div>

            <div className="mt-2 md:mt-4 flex items-center gap-1 md:gap-2 text-[10px] md:text-xs">
                {trendIcon && <span className={`${trendColor} font-bold`}>{trendIcon}</span>}
                <span className={trendColor ? trendColor : "text-gray-500"}>{trendText}</span>
            </div>
        </div>
    )
}

const MetricsRow = ({ stats }) => {
    const hasVolume = stats.weeklyVolume > 0
    const hasWeight = stats.currentWeight > 0

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
            <MetricCard
                title="Workout Streak"
                value={`${stats.workoutStreak} days`}
                icon="🔥"
                iconColor="bg-emerald-500 text-emerald-400"
                trendText={stats.workoutStreak > 0 ? "Keep it going!" : "Log a lift to start"}
                trendColor={stats.workoutStreak > 0 ? "text-emerald-400" : "text-gray-500"}
            />
            <MetricCard
                title="Weekly Volume"
                value={`${stats.weeklyVolume} kg`}
                icon="📊"
                iconColor="bg-emerald-500 text-emerald-400"
                trendIcon={hasVolume ? "↑" : null}
                trendText={hasVolume ? "This week's total" : "No lifts this week"}
                trendColor={hasVolume ? "text-emerald-400" : "text-gray-500"}
            />
            <MetricCard
                title="Recovery Score"
                value={`${stats.recoveryScore}%`}
                icon="💚"
                iconColor="bg-emerald-500 text-emerald-400"
                trendText={stats.recoveryScore >= 70 ? "Good to train" : stats.recoveryScore >= 40 ? "Light session" : "Rest day"}
                trendColor={stats.recoveryScore >= 70 ? "text-emerald-400" : stats.recoveryScore >= 40 ? "text-yellow-400" : "text-red-400"}
            />
            <MetricCard
                title="Current Weight"
                value={`${hasWeight ? stats.currentWeight : '—'} kg`}
                icon="⚖️"
                iconColor="bg-emerald-500 text-emerald-400"
                trendText={hasWeight ? "Last updated" : "Update stats below"}
                trendColor={hasWeight ? "text-emerald-400" : "text-gray-500"}
            />
        </div>
    )
}

export default MetricsRow
