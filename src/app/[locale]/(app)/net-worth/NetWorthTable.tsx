'use client'

import { useEffect, useMemo } from 'react'
import { useNetWorthStore, Category, NetWorthEntry } from '@/store/netWorthStore'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function NetWorthTable({
    initialCategories,
    initialEntries,
    startMonth,
    startYear
}: {
    initialCategories: Category[],
    initialEntries: NetWorthEntry[],
    startMonth: number,
    startYear: number
}) {
    const t = useTranslations('NetWorth')
    const { categories, entries, setInitialData, updateValue, isSyncing } = useNetWorthStore()

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
        return entry ? entry.value : 0
    }

    const getColumnTotal = (colMonth: number, colYear: number, type: 'asset' | 'liability') => {
        const cats = type === 'asset' ? assets : liabilities
        return cats.reduce((sum, cat) => sum + getValue(cat.id, colMonth, colYear), 0)
    }

    if (categories.length === 0) {
        return <div className="p-8 text-center text-gray-500">{t('empty')}</div>
    }

    return (
        <div className="relative w-full overflow-x-auto excel-table-container">
            <div className="absolute top-3 right-4 z-30 flex items-center gap-2 text-xs font-medium bg-white/80 dark:bg-zinc-900/80 backdrop-blur pb-1 px-3 rounded-full">
                {isSyncing ? (
                    <><Loader2 className="h-3 w-3 animate-spin text-blue-500" /> <span className="text-blue-600 dark:text-blue-400">{t('syncing')}</span></>
                ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">✔ {t('saved')}</span>
                )}
            </div>

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
                                    <input
                                        type="number"
                                        value={getValue(asset.id, col.month, col.year) || ''}
                                        onChange={(e) => updateValue(asset.id, col.month, col.year, parseFloat(e.target.value) || 0)}
                                        className="w-full bg-transparent text-right outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1.5 border border-transparent hover:border-gray-300 dark:hover:border-zinc-600 transition-colors"
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                    <tr className="bg-emerald-100/60 dark:bg-emerald-900/40 font-semibold">
                        <td className="px-4 py-3 text-emerald-900 dark:text-emerald-300 border-b border-r border-emerald-200 dark:border-emerald-800/50 sticky left-0 z-10 bg-emerald-100 dark:bg-[#0c3b2adc] shadow-[1px_0_0_0_#6ee7b7] dark:shadow-[1px_0_0_0_#065f46]">
                            {t('totalAssets')}
                        </td>
                        {columns.map(col => (
                            <td key={col.label} className="px-4 py-3 text-right border-b border-r border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300">
                                {getColumnTotal(col.month, col.year, 'asset').toLocaleString()}
                            </td>
                        ))}
                    </tr>

                    {/* LIABILITIES */}
                    <tr className="bg-rose-50 dark:bg-rose-950/40">
                        <td className="px-4 py-2 font-bold text-rose-800 dark:text-rose-400 border-b border-r border-rose-200 dark:border-rose-900/50 sticky left-0 z-10 bg-rose-50 dark:bg-[#330f16] shadow-[1px_0_0_0_#fecdd3] dark:shadow-[1px_0_0_0_#881337]">
                            {t('liabilities')}
                        </td>
                        {columns.map(col => <td key={col.label} className="border-b border-rose-200 dark:border-rose-900/50"></td>)}
                    </tr>
                    {liabilities.map(liability => (
                        <tr key={liability.id} className="border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                            <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-zinc-800 sticky left-0 z-10 bg-white dark:bg-zinc-900 group-hover:bg-gray-50 dark:group-hover:bg-zinc-800/50 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#3f3f46]">
                                {liability.name}
                            </td>
                            {columns.map(col => (
                                <td key={col.label} className="px-2 py-1 text-right border-r border-gray-100 dark:border-zinc-800/50">
                                    <input
                                        type="number"
                                        value={getValue(liability.id, col.month, col.year) || ''}
                                        onChange={(e) => updateValue(liability.id, col.month, col.year, parseFloat(e.target.value) || 0)}
                                        className="w-full bg-transparent text-right outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1.5 border border-transparent hover:border-gray-300 dark:hover:border-zinc-600 transition-colors text-rose-700 dark:text-rose-400"
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                    <tr className="bg-rose-100/60 dark:bg-rose-900/40 font-semibold">
                        <td className="px-4 py-3 text-rose-900 dark:text-rose-300 border-b border-r border-rose-200 dark:border-rose-800/50 sticky left-0 z-10 bg-rose-100 dark:bg-[#4c1424] shadow-[1px_0_0_0_#fda4af] dark:shadow-[1px_0_0_0_#9f1239]">
                            {t('totalLiabilities')}
                        </td>
                        {columns.map(col => (
                            <td key={col.label} className="px-4 py-3 text-right border-b border-r border-rose-200 dark:border-rose-800/50 text-rose-900 dark:text-rose-300">
                                {getColumnTotal(col.month, col.year, 'liability').toLocaleString()}
                            </td>
                        ))}
                    </tr>

                    {/* NET WORTH */}
                    <tr className="bg-blue-100 dark:bg-blue-900/60 font-bold text-lg">
                        <td className="px-4 py-5 text-blue-900 dark:text-blue-100 border-r border-blue-200 dark:border-blue-800 sticky left-0 z-10 bg-blue-100 dark:bg-[#182c56] shadow-[1px_0_0_0_#93c5fd] dark:shadow-[1px_0_0_0_#1e3a8a]">
                            {t('netWorth')}
                        </td>
                        {columns.map(col => {
                            const netWorth = getColumnTotal(col.month, col.year, 'asset') - getColumnTotal(col.month, col.year, 'liability')
                            return (
                                <td key={col.label} className="px-4 py-5 text-right border-r border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 whitespace-nowrap">
                                    {netWorth.toLocaleString()}
                                </td>
                            )
                        })}
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
