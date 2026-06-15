import React from 'react'

const MetricCard = ({ title, value, subtext, icon, trendIcon, trendText, iconColor, trendColor }) => {
    return (
        <div className="bg-[#0f141a] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${iconColor} bg-opacity-10`}>
                    <span className="text-xl">{icon}</span>
                </div>
            </div>

            <div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{value}</span>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs">
                {trendIcon && <span className={`${trendColor} font-bold`}>{trendIcon}</span>}
                <span className={trendColor ? trendColor : "text-gray-500"}>{trendText}</span>
                {subtext && <span className="text-gray-500 ml-auto">{subtext}</span>}
            </div>
        </div>
    )
}

const MetricsRow = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
                title="Workout Streak"
                value={`${stats.workoutStreak} days`}
                icon="🔥"
                iconColor="bg-emerald-500 text-emerald-400"
                subtext="Best: 28 days"
            />
            <MetricCard
                title="Weekly Volume"
                value={`${stats.weeklyVolume} kg`}
                icon="📊"
                iconColor="bg-emerald-500 text-emerald-400"
                trendIcon="↑"
                trendText="12% from last week"
                trendColor="text-emerald-400"
            />
            <MetricCard
                title="Recovery Score"
                value={`${stats.recoveryScore}%`}
                icon="💚"
                iconColor="bg-emerald-500 text-emerald-400"
                trendText="Good to train"
                trendColor="text-emerald-400"
            />
            <MetricCard
                title="Current Weight"
                value={`${stats.currentWeight} kg`}
                icon="⚖️"
                iconColor="bg-emerald-500 text-emerald-400"
                trendIcon="↓"
                trendText="0.3 kg from last week"
                trendColor="text-emerald-400"
            />
        </div>
    )
}

export default MetricsRow