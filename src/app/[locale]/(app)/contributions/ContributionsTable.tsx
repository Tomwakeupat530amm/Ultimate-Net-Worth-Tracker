'use client'

import { useEffect, useMemo, useState } from 'react'
import { useContributionsStore, ContributionEntry } from '@/store/contributionsStore'
import { Category } from '@/store/netWorthStore'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CurrencyInput } from '@/components/ui/CurrencyInput'

export function ContributionsTable({
    initialCategories,
    initialEntries,
    startMonth,
    startYear
}: {
    initialCategories: Category[],
    initialEntries: ContributionEntry[],
    startMonth: number,
    startYear: number
}) {
    const t = useTranslations('Contributions')
    const { categories, entries, setInitialData, updateValue, isSyncing } = useContributionsStore()
    const [activeTab, setActiveTab] = useState<'inflow' | 'outflow'>('inflow')

    useEffect(() => {
        setInitialData(initialCategories, initialEntries)
    }, [initialCategories, initialEntries, setInitialData])

    const columns = useMemo(() => {
        const cols = []
        let currentMonth = startMonth
        let currentYear = startYear
        for (let i = 0; i < 12; i++) {
            cols.push({ month: currentMonth, year: currentYear, label: `${currentMonth}/${currentYear}` })
            currentMonth++
            if (currentMonth > 12) {
                currentMonth = 1
                currentYear++
            }
        }
        return cols
    }, [startMonth, startYear])

    const assets = categories.filter(c => c.type === 'asset')
    const liabilities = categories.filter(c => c.type === 'liability')

    const getValue = (categoryId: string, month: number, year: number) => {
        const entry = entries.find(e => e.category_id === categoryId && e.month === month && e.year === year)
        if (!entry) return 0
        return activeTab === 'inflow' ? entry.inflow : entry.outflow
    }

    const getColumnTotal = (colMonth: number, colYear: number, type: 'asset' | 'liability') => {
        const cats = type === 'asset' ? assets : liabilities
        return cats.reduce((sum, cat) => sum + getValue(cat.id, colMonth, colYear), 0)
    }

    if (categories.length === 0) {
        return <div className="p-8 text-center text-[#787774] font-mono text-sm">{t('empty')}</div>
    }

    return (
        <div className="relative w-full flex flex-col">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-3 border-b border-[#EAEAEA] dark:border-[#333333] bg-[#FBFBFA] dark:bg-[#111111]">
                <button
                    onClick={() => setActiveTab('inflow')}
                    className={`px-5 py-2 text-xs uppercase tracking-widest font-semibold rounded transition-all ${activeTab === 'inflow' ? 'bg-[#111111] dark:bg-[#F7F6F3] text-white dark:text-[#111111] scale-[0.98]' : 'text-[#787774] hover:text-[#111111] dark:hover:text-white'}`}
                >
                    {t('tabInflow')}
                </button>
                <button
                    onClick={() => setActiveTab('outflow')}
                    className={`px-5 py-2 text-xs uppercase tracking-widest font-semibold rounded transition-all ${activeTab === 'outflow' ? 'bg-[#111111] dark:bg-[#F7F6F3] text-white dark:text-[#111111] scale-[0.98]' : 'text-[#787774] hover:text-[#111111] dark:hover:text-white'}`}
                >
                    {t('tabOutflow')}
                </button>

                <div className="ml-auto flex items-center gap-2 text-[10px] font-semibold tracking-wider uppercase bg-[#FFFFFF] dark:bg-[#050505] px-4 py-2 rounded-full border border-[#EAEAEA] dark:border-[#333333]">
                    {isSyncing ? (
                        <><Loader2 className="h-3 w-3 animate-spin text-[#1F6C9F] dark:text-[#60A5FA]" /> <span className="text-[#1F6C9F] dark:text-[#60A5FA]">{t('syncing')}</span></>
                    ) : (
                        <span className="text-[#346538] dark:text-[#34D399]">✔ {t('saved')}</span>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto excel-table-container relative">
                <table className="w-full text-sm text-left border-collapse min-w-[800px]">
                    <thead className="bg-[#FBFBFA] dark:bg-[#111111] text-[#787774] dark:text-[#A1A1AA] font-semibold uppercase text-[10px] tracking-widest">
                        <tr>
                            <th className="px-4 py-4 border-b border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-20 bg-[#FBFBFA] dark:bg-[#111111] w-[200px] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333]">
                                Category
                            </th>
                            {columns.map(col => (
                                <th key={col.label} className="px-4 py-4 border-b border-r border-[#EAEAEA] dark:border-[#333333] text-right min-w-[120px] bg-[#FBFBFA] dark:bg-[#111111]">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* ASSETS */}
                        <tr className="bg-[#EDF3EC] dark:bg-[#0A1A14]">
                            <td className="px-4 py-3 font-semibold text-[#346538] dark:text-[#34D399] border-b border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-10 bg-[#EDF3EC] dark:bg-[#0A1A14] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333] uppercase text-xs tracking-wider">
                                {t('assets')}
                            </td>
                            {columns.map(col => <td key={col.label} className="border-b border-[#EAEAEA] dark:border-[#333333]"></td>)}
                        </tr>
                        {assets.map(asset => (
                            <tr key={asset.id} className="border-b border-[#EAEAEA] dark:border-[#333333] hover:bg-[#FBFBFA] dark:hover:bg-[#111111] transition-colors group">
                                <td className="px-4 py-3 font-medium text-[#111111] dark:text-[#F7F6F3] border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-10 bg-white dark:bg-[#050505] group-hover:bg-[#FBFBFA] dark:group-hover:bg-[#111111] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333]">
                                    {asset.name}
                                </td>
                                {columns.map(col => (
                                    <td key={col.label} className="px-2 py-1 text-right border-r border-[#EAEAEA] dark:border-[#333333]">
                                        <CurrencyInput
                                            value={getValue(asset.id, col.month, col.year)}
                                            onValueChange={(val) => updateValue(asset.id, col.month, col.year, activeTab, val)}
                                            className={`w-full bg-transparent text-right outline-none focus:bg-[#FBFBFA] dark:focus:bg-[#111111] rounded px-2 py-1.5 border border-transparent transition-colors font-mono tabular-nums ${activeTab === 'outflow' ? 'text-[#9F2F2D] dark:text-[#FB7185] focus:border-[#EAEAEA] dark:focus:border-[#333333]' : 'text-[#1F6C9F] dark:text-[#60A5FA] focus:border-[#EAEAEA] dark:focus:border-[#333333]'}`}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr className="bg-[#FBFBFA] dark:bg-[#111111] font-semibold">
                            <td className="px-4 py-3 text-[#787774] dark:text-[#A1A1AA] border-b border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-10 bg-[#FBFBFA] dark:bg-[#111111] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333] uppercase text-xs tracking-wider">
                                {t('totalAssets')}
                            </td>
                            {columns.map(col => (
                                <td key={col.label} className="px-4 py-3 text-right border-b border-r border-[#EAEAEA] dark:border-[#333333] text-[#787774] dark:text-[#A1A1AA] font-mono tabular-nums">
                                    {getColumnTotal(col.month, col.year, 'asset').toLocaleString()}
                                </td>
                            ))}
                        </tr>

                        {/* LIABILITIES */}
                        <tr className="bg-[#FBF3DB] dark:bg-[#20180B]">
                            <td className="px-4 py-3 font-semibold text-[#956400] dark:text-[#FBBF24] border-b border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-10 bg-[#FBF3DB] dark:bg-[#20180B] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333] uppercase text-xs tracking-wider">
                                {t('liabilities')}
                            </td>
                            {columns.map(col => <td key={col.label} className="border-b border-[#EAEAEA] dark:border-[#333333]"></td>)}
                        </tr>
                        {liabilities.map(liability => (
                            <tr key={liability.id} className="border-b border-[#EAEAEA] dark:border-[#333333] hover:bg-[#FBFBFA] dark:hover:bg-[#111111] transition-colors group">
                                <td className="px-4 py-3 font-medium text-[#111111] dark:text-[#F7F6F3] border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-10 bg-white dark:bg-[#050505] group-hover:bg-[#FBFBFA] dark:group-hover:bg-[#111111] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333]">
                                    {liability.name}
                                </td>
                                {columns.map(col => (
                                    <td key={col.label} className="px-2 py-1 text-right border-r border-[#EAEAEA] dark:border-[#333333]">
                                        <CurrencyInput
                                            value={getValue(liability.id, col.month, col.year)}
                                            onValueChange={(val) => updateValue(liability.id, col.month, col.year, activeTab, val)}
                                            className={`w-full bg-transparent text-right outline-none focus:bg-[#FBFBFA] dark:focus:bg-[#111111] rounded px-2 py-1.5 border border-transparent transition-colors font-mono tabular-nums ${activeTab === 'outflow' ? 'text-[#9F2F2D] dark:text-[#FB7185] focus:border-[#EAEAEA] dark:focus:border-[#333333]' : 'text-[#1F6C9F] dark:text-[#60A5FA] focus:border-[#EAEAEA] dark:focus:border-[#333333]'}`}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr className="bg-[#FBFBFA] dark:bg-[#111111] font-semibold">
                            <td className="px-4 py-3 text-[#787774] dark:text-[#A1A1AA] border-b border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-10 bg-[#FBFBFA] dark:bg-[#111111] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333] uppercase text-xs tracking-wider">
                                {t('totalLiabilities')}
                            </td>
                            {columns.map(col => (
                                <td key={col.label} className="px-4 py-3 text-right border-b border-r border-[#EAEAEA] dark:border-[#333333] text-[#787774] dark:text-[#A1A1AA] font-mono tabular-nums">
                                    {getColumnTotal(col.month, col.year, 'liability').toLocaleString()}
                                </td>
                            ))}
                        </tr>

                        {/* NET CONTRIBUTION */}
                        <tr className="bg-[#E1F3FE] dark:bg-[#0A1622] font-semibold text-base">
                            <td className="px-4 py-5 text-[#1F6C9F] dark:text-[#60A5FA] border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-10 bg-[#E1F3FE] dark:bg-[#0A1622] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333] text-xs uppercase tracking-wider">
                                {t('netContribution')} ({activeTab === 'inflow' ? '+' : '-'})
                            </td>
                            {columns.map(col => {
                                const total = getColumnTotal(col.month, col.year, 'asset') + getColumnTotal(col.month, col.year, 'liability')
                                return (
                                    <td key={col.label} className={`px-4 py-5 text-right border-r border-[#EAEAEA] dark:border-[#333333] whitespace-nowrap font-mono tabular-nums ${activeTab === 'inflow' ? 'text-[#1F6C9F] dark:text-[#60A5FA]' : 'text-[#9F2F2D] dark:text-[#FB7185]'}`}>
                                        {total.toLocaleString()}
                                    </td>
                                )
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
