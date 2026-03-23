import { getDashboardData } from '@/actions/dashboard'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { NetWorthChart, AssetLiabilityChart, AllocationDonut } from '@/components/dashboard/Charts'
import { DetailedAnalysis } from '@/components/dashboard/DetailedAnalysis'
import { GoalAnalysis } from '@/components/dashboard/GoalAnalysis'
import { PremiumCard } from '@/components/ui/PremiumCard'
import { getTranslations } from 'next-intl/server'
import { format, subYears, parseISO } from 'date-fns'

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = params.locale;
    const t = await getTranslations({ locale, namespace: 'Dashboard' });
    return {
        title: `${t('title')} - Net Worth Tracker`,
    };
}


interface PageProps {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ from?: string; to?: string }>
}

export default async function DashboardPage({ params, searchParams }: PageProps) {
    const { from: fromParam, to: toParam } = await searchParams

    // Temporary fetch to get metadata (base dates)
    const initialData = await getDashboardData(undefined, toParam)
    const firstTracked = initialData.metadata.firstTrackedDate
    const latestTracked = initialData.metadata.latestTrackedDate

    const activeTo = toParam || latestTracked
    let activeFrom = fromParam || firstTracked

    // Handle relative From
    if (activeFrom === 'focus-1y') {
        activeFrom = format(subYears(parseISO(activeTo), 1), 'yyyy-MM-01')
    } else if (activeFrom === 'focus-2y') {
        activeFrom = format(subYears(parseISO(activeTo), 2), 'yyyy-MM-01')
    } else if (activeFrom === 'focus-3y') {
        activeFrom = format(subYears(parseISO(activeTo), 3), 'yyyy-MM-01')
    }

    // Load final data with computed range
    const data = await getDashboardData(activeFrom, activeTo)
    const t = await getTranslations('Dashboard')

    return (
        <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 pb-32 animate-in fade-in duration-500">
            {/* Header with Focus Month */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F7F6F3]">
                        {t('title')}
                    </h1>
                    <p className="text-sm text-[#787774] dark:text-[#A1A1AA]">
                        {data.kpi.latestMonthLabel} • <span className="font-semibold">{toParam && toParam !== data.metadata.latestTrackedDate ? 'Focus Period' : 'Latest Month'}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Add any global actions here later */}
                </div>
            </div>

            {/* ROW 1: KPIs */}
            <KpiCards
                kpi={data.kpi}
                metadata={data.metadata}
                currentFrom={fromParam || ''}
                currentTo={toParam || ''}
            />

            {/* ROW 2: Core Charts */}
            <div className="flex flex-col gap-4">
                {/* Net Worth Chart: span 12 */}
                <PremiumCard className="w-full shadow-sm flex flex-col p-0 overflow-hidden border border-[#EAEAEA] dark:border-[#333333] bg-white dark:bg-[#050505]">
                    <div className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-[10px] uppercase tracking-widest font-bold px-4 py-2 text-center border-b border-[#EAEAEA] dark:border-[#333333]">Net Worth Development</div>
                    <div className="p-2 pt-6 h-[450px]">
                        <NetWorthChart data={data.monthlyData} goals={data.goals} height={420} />
                    </div>
                </PremiumCard>

                {/* Asset/Liab Chart: span 12 */}
                <PremiumCard className="w-full shadow-sm flex flex-col p-0 overflow-hidden border border-[#EAEAEA] dark:border-[#333333] bg-white dark:bg-[#050505]">
                    <div className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-[10px] uppercase tracking-widest font-bold px-4 py-2 text-center border-b border-[#EAEAEA] dark:border-[#333333]">Asset vs. Liability Development</div>
                    <div className="p-2 pt-6 h-[450px]">
                        <AssetLiabilityChart data={data.monthlyData} height={420} />
                    </div>
                </PremiumCard>

                {/* Allocations: span 6 + 6 */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <PremiumCard className="flex flex-col p-0 overflow-hidden border border-[#EAEAEA] dark:border-[#333333] bg-[#FBFBFA] dark:bg-[#050505] w-full">
                        <div className="bg-[#1F6C9F] dark:bg-[#60A5FA] text-white dark:text-[#111111] text-[10px] uppercase tracking-widest font-bold px-4 py-2 text-center">Asset Allocation</div>
                        <div className="p-6 flex flex-col xl:flex-row gap-6 items-center justify-center">
                            <AllocationDonut data={data.assetAllocation} height={160} />
                            <div className="flex flex-col text-xs font-mono w-full max-w-[320px]">
                                {data.assetAllocation.slice(0, 6).map((a: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center py-1.5 gap-4">
                                        <span className="truncate flex-1 min-w-0 font-sans text-[#111111] dark:text-[#F7F6F3]" title={a.name}>{a.name}</span>
                                        <div className="flex justify-end shrink-0">
                                            <span className="w-[80px] text-right font-bold text-[#111111] dark:text-[#F7F6F3]">{Math.round(a.value).toLocaleString('en-US')}</span>
                                            <span className="w-[45px] text-right text-[#787774]">{Math.round(a.percentage)}%</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center py-2 mt-2 border-t border-[#EAEAEA] dark:border-[#333333] font-bold">
                                    <span className="font-sans text-[#111111] dark:text-[#F7F6F3]">Total</span>
                                    <div className="flex justify-end shrink-0">
                                        <span className="w-[80px] text-right text-[#111111] dark:text-[#F7F6F3]">{Math.round(data.kpi.totalAssets).toLocaleString('en-US')}</span>
                                        <span className="w-[45px] text-right text-[#111111] dark:text-[#F7F6F3]">100%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Liability Allocation */}
                    <PremiumCard className="flex flex-col p-0 overflow-hidden border border-[#EAEAEA] dark:border-[#333333] bg-[#FBFBFA] dark:bg-[#050505] w-full">
                        <div className="bg-[#4B5563] dark:bg-[#A1A1AA] text-white dark:text-[#111111] text-[10px] uppercase tracking-widest font-bold px-4 py-2 text-center">Liability Allocation</div>
                        <div className="p-6 flex flex-col xl:flex-row gap-6 items-center justify-center">
                            <AllocationDonut data={data.liabilityAllocation} height={160} />
                            <div className="flex flex-col text-xs font-mono w-full max-w-[320px]">
                                {data.liabilityAllocation.slice(0, 6).map((a: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center py-1.5 gap-4">
                                        <span className="truncate flex-1 min-w-0 font-sans text-[#111111] dark:text-[#F7F6F3]" title={a.name}>{a.name}</span>
                                        <div className="flex justify-end shrink-0">
                                            <span className="w-[80px] text-right font-bold text-[#111111] dark:text-[#F7F6F3]">{Math.round(a.value).toLocaleString('en-US')}</span>
                                            <span className="w-[45px] text-right text-[#787774]">{Math.round(a.percentage)}%</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center py-2 mt-2 border-t border-[#EAEAEA] dark:border-[#333333] font-bold">
                                    <span className="font-sans text-[#111111] dark:text-[#F7F6F3]">Total</span>
                                    <div className="flex justify-end shrink-0">
                                        <span className="w-[80px] text-right text-[#111111] dark:text-[#F7F6F3]">{Math.round(data.kpi.totalLiabilities).toLocaleString('en-US')}</span>
                                        <span className="w-[45px] text-right text-[#111111] dark:text-[#F7F6F3]">100%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </PremiumCard>
                </div>
            </div>

            {/* ROW 3: Analysis */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                <div className="xl:col-span-4 h-full">
                    <GoalAnalysis goals={data.goals} currentNetWorth={data.kpi.netWorth} settings={data.settings} />
                </div>
                <div className="xl:col-span-8 h-full">
                    <DetailedAnalysis data={data.detailedAnalysis} />
                </div>
            </div>
        </div>
    )
}
