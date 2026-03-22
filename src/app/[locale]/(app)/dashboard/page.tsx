import { getTranslations } from 'next-intl/server';
import { getDashboardData } from '@/actions/dashboard';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { NetWorthChart, AllocationChart } from '@/components/dashboard/Charts';

export const metadata = {
    title: 'Dashboard - Net Worth Tracker',
}

export default async function DashboardPage() {
    const t = await getTranslations('Dashboard');
    const data = await getDashboardData();

    const kpiLabels = {
        totalAssets: t('totalAssets'),
        totalLiabilities: t('totalLiabilities'),
        netWorth: t('netWorth'),
        growth: t('growth'),
        vsLastMonth: t('vsLastMonth'),
    };

    return (
        <div className="mx-auto max-w-7xl space-y-8 w-full pb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('desc')}</p>
            </div>

            <KpiCards kpi={data.kpi} labels={kpiLabels} />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 ">
                <div className="rounded-xl border bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 p-6 shadow-sm lg:col-span-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('netWorthChart')}</h3>
                    <NetWorthChart data={data.monthlyData} />
                </div>

                <div className="rounded-xl border bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 p-6 shadow-sm lg:col-span-3">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('allocationChart')}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        {t('latestSnapshot')}: {data.latestMonthLabel}
                    </p>
                    <AllocationChart data={data.assetAllocation} />
                </div>
            </div>
        </div>
    )
}
