import { PremiumCard } from '@/components/ui/PremiumCard'
import { TimeSpanSelector } from './TimeSpanSelector'

interface KpiCardsProps {
    kpi: any
    metadata?: {
        firstTrackedDate: string
        latestTrackedDate: string
    }
    currentFrom?: string
    currentTo?: string
}

export function KpiCards({ kpi, metadata, currentFrom, currentTo }: KpiCardsProps) {
    const isPositiveGrowth = kpi.netWorthGrowth > 0

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 w-full">

            {/* 2. Net Worth */}
            <PremiumCard className="p-4 flex flex-col justify-between items-center text-center shadow-sm">
                <span className="text-[11px] font-bold text-[#111111] dark:text-[#F7F6F3] mb-2 uppercase tracking-wide">Net Worth</span>
                <div className="flex flex-col items-center justify-center gap-2 w-full">
                    <span className="text-lg xl:text-xl font-bold font-mono text-[#111111] dark:text-[#F7F6F3] tracking-tighter leading-none">
                        {kpi.netWorth?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded tracking-wide ${isPositiveGrowth ? 'text-[#346538] dark:text-[#34D399] bg-[#EAF5EA] dark:bg-[#1A2E1A]' : 'text-[#111111] dark:text-[#F7F6F3] bg-[#EAEAEA] dark:bg-[#333333]'}`}>
                        {isPositiveGrowth ? '+' : ''}{(kpi.growthAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} in {kpi.growthYears || 0} y
                    </span>
                </div>
            </PremiumCard>

            {/* 3. Assets & Liabilities */}
            <PremiumCard className="p-4 flex flex-col justify-center items-center shadow-sm">
                <div className="flex flex-col gap-3 w-full h-full justify-center">
                    <div className="flex flex-col items-center justify-center w-full">
                        <span className="text-[10px] font-bold text-[#787774] dark:text-[#A1A1AA] uppercase tracking-wider mb-1.5">Assets</span>
                        <span className="text-[13px] xl:text-[15px] font-bold font-mono text-[#1F6C9F] dark:text-[#60A5FA] tracking-tighter leading-none text-center max-w-full break-all">
                            {kpi.totalAssets?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </span>
                    </div>
                    <div className="w-4/5 h-px bg-[#EAEAEA] dark:bg-[#333333] mx-auto hidden sm:block"></div>
                    <div className="flex flex-col items-center justify-center w-full">
                        <span className="text-[10px] font-bold text-[#787774] dark:text-[#A1A1AA] uppercase tracking-wider mb-1.5">Liabilities</span>
                        <span className="text-[13px] xl:text-[15px] font-bold font-mono text-[#111111] dark:text-[#F7F6F3] tracking-tighter leading-none text-center max-w-full break-all">
                            {kpi.totalLiabilities?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </span>
                    </div>
                </div>
            </PremiumCard>

            {/* 4. Leverage & Debt */}
            <PremiumCard className="p-4 flex flex-col justify-between items-center text-center shadow-sm">
                <span className="text-[11px] font-bold text-[#111111] dark:text-[#F7F6F3] mb-2 uppercase tracking-wide">Net Leverage Ratio</span>
                <div className="flex flex-col items-center justify-center gap-2 w-full">
                    <span className="text-lg xl:text-xl font-bold font-mono text-[#111111] dark:text-[#F7F6F3] tracking-tighter leading-none">
                        {((kpi.leverageRatio || 0) / 100).toFixed(2)}
                    </span>
                    <span className="text-[9px] font-bold text-[#787774] dark:text-[#A1A1AA] bg-[#FBFBFA] dark:bg-[#111111] px-2 py-0.5 rounded flex gap-1 tracking-wide">
                        <span className="uppercase">Net Debt:</span> <span className="font-mono">{kpi.netDebt?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || 0}</span>
                    </span>
                </div>
            </PremiumCard>

            {/* 5. Time Span */}
            <PremiumCard className="p-0 flex flex-col shadow-sm overflow-hidden border border-[#EAEAEA] dark:border-[#333333]">
                <div className="bg-[#FBFBFA] dark:bg-[#111111] py-2 border-b border-[#EAEAEA] dark:border-[#333333] text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111] dark:text-[#F7F6F3]">Time Span</span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <TimeSpanSelector
                        firstTrackedDate={metadata?.firstTrackedDate || ''}
                        latestTrackedDate={metadata?.latestTrackedDate || ''}
                        currentFrom={currentFrom || ''}
                        currentTo={currentTo || ''}
                    />
                </div>
            </PremiumCard>
        </div>
    )
}
