import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from 'lucide-react'

export function KpiCards({ kpi, labels }: { kpi: any, labels: any }) {
    const isPositiveGrowth = kpi.netWorthGrowth > 0;
    const isZeroGrowth = kpi.netWorthGrowth === 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Assets */}
            <div className="rounded-xl border bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-sm">
                <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{labels.totalAssets}</h3>
                <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {kpi.totalAssets?.toLocaleString('en-US') || 0}
                </div>
            </div>

            {/* Total Liabilities */}
            <div className="rounded-xl border bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-sm">
                <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{labels.totalLiabilities}</h3>
                <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {kpi.totalLiabilities?.toLocaleString('en-US') || 0}
                </div>
            </div>

            {/* Net Worth */}
            <div className="rounded-xl border bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-sm">
                <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{labels.netWorth}</h3>
                <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {kpi.netWorth?.toLocaleString('en-US') || 0}
                </div>
            </div>

            {/* M/M Growth */}
            <div className="rounded-xl border bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-sm">
                <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{labels.growth}</h3>
                <div className="mt-2 flex items-center gap-3">
                    <div className={`text-2xl font-bold tabular-nums ${isZeroGrowth ? 'text-gray-500' : isPositiveGrowth ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositiveGrowth ? '+' : ''}{kpi.netWorthGrowth?.toFixed(1) || 0}%
                    </div>
                    <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${isZeroGrowth ? 'bg-gray-100 text-gray-600 dark:bg-zinc-800' : isPositiveGrowth ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                        {isPositiveGrowth ? <ArrowUpIcon className="w-3 h-3 mr-1" /> : isZeroGrowth ? <MinusIcon className="w-3 h-3 mr-1" /> : <ArrowDownIcon className="w-3 h-3 mr-1" />}
                        {labels.vsLastMonth}
                    </div>
                </div>
            </div>
        </div>
    )
}
