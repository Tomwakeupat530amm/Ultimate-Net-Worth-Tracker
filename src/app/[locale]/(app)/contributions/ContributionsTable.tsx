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
        return <div className="p-8 text-center text-gray-500">{t('empty')}</div>
    }

    return (
        <div className="relative w-full flex flex-col">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900 border-l-[200px]">
                <button
                    onClick={() => setActiveTab('inflow')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'inflow' ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-zinc-700' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                >
                    {t('tabInflow')}
                </button>
                <button
                    onClick={() => setActiveTab('outflow')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'outflow' ? 'bg-white dark:bg-zinc-800 shadow-sm text-rose-600 dark:text-rose-400 border border-gray-200 dark:border-zinc-700' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                >
                    {t('tabOutflow')}
                </button>

                <div className="ml-auto flex items-center gap-2 text-xs font-medium bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-700 shadow-sm relative z-30 mr-2">
                    {isSyncing ? (
                        <><Loader2 className="h-3 w-3 animate-spin text-blue-500" /> <span className="text-blue-600 dark:text-blue-400">{t('syncing')}</span></>
                    ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">✔ {t('saved')}</span>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto excel-table-container relative">
                <table className="w-full text-sm text-left border-collapse min-w-[800px]">
                    <thead className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 font-semibold uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 border-b border-r border-gray-200 dark:border-zinc-700 sticky left-0 z-20 bg-gray-100 dark:bg-zinc-800 w-[200px] shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#3f3f46]">
                                Category
                            </th>
                            {columns.map(col => (
                                <th key={col.label} className="px-4 py-3 border-b border-r border-gray-200 dark:border-zinc-700 text-right min-w-[120px] bg-gray-100 dark:bg-zinc-800">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* ASSETS */}
                        <tr className="bg-emerald-50 dark:bg-emerald-950/40">
                            <td className="px-4 py-2 font-bold text-emerald-800 dark:text-emerald-400 border-b border-r border-emerald-200 dark:border-emerald-900/50 sticky left-0 z-10 bg-emerald-50 dark:bg-[#0a271d] shadow-[1px_0_0_0_#a7f3d0] dark:shadow-[1px_0_0_0_#064e3b]">
                                {t('assets')}
                            </td>
                            {columns.map(col => <td key={col.label} className="border-b border-emerald-200 dark:border-emerald-900/50"></td>)}
                        </tr>
                        {assets.map(asset => (
                            <tr key={asset.id} className="border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-zinc-800 sticky left-0 z-10 bg-white dark:bg-zinc-900 group-hover:bg-gray-50 dark:group-hover:bg-zinc-800/50 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#3f3f46]">
                                    {asset.name}
                                </td>
                                {columns.map(col => (
                                    <td key={col.label} className="px-2 py-1 text-right border-r border-gray-100 dark:border-zinc-800/50">
                                        <CurrencyInput
                                            value={getValue(asset.id, col.month, col.year)}
                                            onValueChange={(val) => updateValue(asset.id, col.month, col.year, activeTab, val)}
                                            className={`w-full bg-transparent text-right outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1.5 border border-transparent transition-colors font-medium tabular-nums ${activeTab === 'outflow' ? 'text-rose-600 dark:text-rose-400' : 'text-blue-700 dark:text-blue-400 hover:border-gray-300 dark:hover:border-zinc-600'}`}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr className="bg-gray-50 dark:bg-zinc-800/20 font-semibold">
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 border-b border-r border-gray-200 dark:border-zinc-800 sticky left-0 z-10 bg-gray-50 dark:bg-zinc-900 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#3f3f46]">
                                {t('totalAssets')}
                            </td>
                            {columns.map(col => (
                                <td key={col.label} className="px-4 py-3 text-right border-b border-r border-gray-100 dark:border-zinc-800 text-gray-600 dark:text-gray-400 tabular-nums">
                                    {getColumnTotal(col.month, col.year, 'asset').toLocaleString()}
                                </td>
                            ))}
                        </tr>

                        {/* LIABILITIES */}
                        <tr className="bg-orange-50 dark:bg-orange-950/40">
                            <td className="px-4 py-2 font-bold text-orange-800 dark:text-orange-400 border-b border-r border-orange-200 dark:border-orange-900/50 sticky left-0 z-10 bg-orange-50 dark:bg-[#331100] shadow-[1px_0_0_0_#fed7aa] dark:shadow-[1px_0_0_0_#9a3412]">
                                {t('liabilities')}
                            </td>
                            {columns.map(col => <td key={col.label} className="border-b border-orange-200 dark:border-orange-900/50"></td>)}
                        </tr>
                        {liabilities.map(liability => (
                            <tr key={liability.id} className="border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-zinc-800 sticky left-0 z-10 bg-white dark:bg-zinc-900 group-hover:bg-gray-50 dark:group-hover:bg-zinc-800/50 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#3f3f46]">
                                    {liability.name}
                                </td>
                                {columns.map(col => (
                                    <td key={col.label} className="px-2 py-1 text-right border-r border-gray-100 dark:border-zinc-800/50">
                                        <CurrencyInput
                                            value={getValue(liability.id, col.month, col.year)}
                                            onValueChange={(val) => updateValue(liability.id, col.month, col.year, activeTab, val)}
                                            className={`w-full bg-transparent text-right outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1.5 border border-transparent transition-colors font-medium tabular-nums ${activeTab === 'outflow' ? 'text-rose-600 dark:text-rose-400' : 'text-blue-700 dark:text-blue-400 hover:border-gray-300 dark:hover:border-zinc-600'}`}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr className="bg-gray-50 dark:bg-zinc-800/20 font-semibold">
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 border-b border-r border-gray-200 dark:border-zinc-800 sticky left-0 z-10 bg-gray-50 dark:bg-zinc-900 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#3f3f46]">
                                {t('totalLiabilities')}
                            </td>
                            {columns.map(col => (
                                <td key={col.label} className="px-4 py-3 text-right border-b border-r border-gray-100 dark:border-zinc-800 text-gray-600 dark:text-gray-400 tabular-nums">
                                    {getColumnTotal(col.month, col.year, 'liability').toLocaleString()}
                                </td>
                            ))}
                        </tr>

                        {/* NET CONTRIBUTION */}
                        <tr className="bg-blue-50 dark:bg-blue-900/30 font-bold text-base">
                            <td className="px-4 py-4 text-blue-800 dark:text-blue-300 border-r border-blue-200 dark:border-blue-900/50 sticky left-0 z-10 bg-blue-50 dark:bg-[#122244] shadow-[1px_0_0_0_#bfdbfe] dark:shadow-[1px_0_0_0_#1e3a8a]">
                                {t('netContribution')} ({activeTab === 'inflow' ? '+' : '-'})
                            </td>
                            {columns.map(col => {
                                const total = getColumnTotal(col.month, col.year, 'asset') + getColumnTotal(col.month, col.year, 'liability')
                                return (
                                    <td key={col.label} className={`px-4 py-4 text-right border-r border-blue-200 dark:border-blue-900/50 whitespace-nowrap tabular-nums ${activeTab === 'inflow' ? 'text-blue-800 dark:text-blue-300' : 'text-rose-600 dark:text-rose-400'}`}>
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
