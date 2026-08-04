import { Flame, HeartPulse, Scale, TrendingUp } from 'lucide-react'

const MetricCard = ({ title, value, Icon, trendIcon, trendText, iconClass, trendClass }) => {
    return (
        <article className="metric-card min-w-0 p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="metric-label">{title}</p>
                    <p className="metric-value mt-3">{value}</p>
                </div>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border ${iconClass}`}>
                    <Icon size={18} strokeWidth={1.9} />
                </span>
            </div>
            <div className={`mt-5 flex items-center gap-1.5 text-[11px] font-medium ${trendClass || 'text-zinc-500'}`}>
                {trendIcon && <TrendingUp size={13} strokeWidth={2.2} />}
                <span>{trendText}</span>
            </div>
        </article>
    )
}

const MetricsRow = ({ stats }) => {
    const hasVolume = stats.weeklyVolume > 0
    const hasWeight = stats.currentWeight > 0

    return (
        <section className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4" aria-label="Training metrics">
            <MetricCard
                title="Workout streak"
                value={`${stats.workoutStreak} days`}
                Icon={Flame}
                iconClass="border-emerald-300/15 bg-emerald-400/10 text-emerald-300"
                trendText={stats.workoutStreak > 0 ? "Keep it going" : "Log a lift to start"}
                trendClass={stats.workoutStreak > 0 ? "text-emerald-300" : "text-zinc-500"}
            />
            <MetricCard
                title="Weekly volume"
                value={`${stats.weeklyVolume} kg`}
                Icon={TrendingUp}
                iconClass="border-blue-300/15 bg-blue-400/10 text-blue-300"
                trendIcon={hasVolume}
                trendText={hasVolume ? "This week's total" : "No lifts this week"}
                trendClass={hasVolume ? "text-blue-300" : "text-zinc-500"}
            />
            <MetricCard
                title="Recovery score"
                value={`${stats.recoveryScore}%`}
                Icon={HeartPulse}
                iconClass="border-amber-300/15 bg-amber-300/10 text-amber-200"
                trendText={stats.recoveryScore >= 70 ? "Good to train" : stats.recoveryScore >= 40 ? "Light session" : "Rest day"}
                trendClass={stats.recoveryScore >= 70 ? "text-emerald-300" : stats.recoveryScore >= 40 ? "text-amber-200" : "text-red-300"}
            />
            <MetricCard
                title="Current weight"
                value={`${hasWeight ? stats.currentWeight : '—'} kg`}
                Icon={Scale}
                iconClass="border-violet-300/15 bg-violet-300/10 text-violet-200"
                trendText={hasWeight ? "Last updated" : "Update stats below"}
                trendClass={hasWeight ? "text-violet-200" : "text-zinc-500"}
            />
        </section>
    )
}

export default MetricsRow
