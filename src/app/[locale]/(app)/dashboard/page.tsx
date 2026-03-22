import { getTranslations } from 'next-intl/server';
import { getDashboardData } from '@/actions/dashboard';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { NetWorthChart, AllocationChart } from '@/components/dashboard/Charts';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerReveal';
import { PremiumCard } from '@/components/ui/PremiumCard';

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
        <StaggerContainer className="mx-auto max-w-7xl w-full pb-16 space-y-12">
            <StaggerItem>
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('title')}</h1>
                    <p className="text-base text-gray-500 dark:text-gray-400 max-w-[65ch]">{t('desc')}</p>
                </div>
            </StaggerItem>

            <KpiCards kpi={data.kpi} labels={kpiLabels} />

            <StaggerItem className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 ">
                <PremiumCard className="lg:col-span-4 flex flex-col">
                    <div className="mb-6 flex flex-col gap-1">
                        <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">{t('netWorthChart')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">12-Month Performance Overview</p>
                    </div>
                    <div className="flex-1 w-full h-[300px]">
                        <NetWorthChart data={data.monthlyData} />
                    </div>
                </PremiumCard>

                <PremiumCard className="lg:col-span-3 flex flex-col">
                    <div className="mb-6 flex flex-col gap-1">
                        <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">{t('allocationChart')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('latestSnapshot')}: <span className="font-mono">{data.latestMonthLabel}</span>
                        </p>
                    </div>
                    <div className="flex-1 w-full h-[300px] flex items-center justify-center">
                        <AllocationChart data={data.assetAllocation} />
                    </div>
                </PremiumCard>
            </StaggerItem>
        </StaggerContainer>
    )
}
