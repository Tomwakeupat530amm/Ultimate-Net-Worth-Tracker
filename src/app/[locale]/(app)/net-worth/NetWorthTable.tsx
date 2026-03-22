'use client'

import { useEffect, useMemo } from 'react'
import { useNetWorthStore, Category, NetWorthEntry } from '@/store/netWorthStore'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function NetWorthTable({
    initialCategories,
    initialGroups,
    initialEntries,
    startMonth,
    startYear
}: {
    initialCategories: Category[],
    initialGroups: any[],
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
        const currentDate = new Date()
        const currentM = currentDate.getMonth() + 1
        const currentY = currentDate.getFullYear()

        for (let i = 0; i < 12; i++) {
            cols.push({
                month: currentMonth,
                year: currentYear,
                label: `${currentMonth}/${currentYear}`,
                isCurrent: currentMonth === currentM && currentYear === currentY
            })
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

    const assetGroups = initialGroups.filter(g => g.type === 'asset')
    const liabilityGroups = initialGroups.filter(g => g.type === 'liability')

    const getValue = (categoryId: string, month: number, year: number) => {
        const entry = entries.find(e => e.category_id === categoryId && e.month === month && e.year === year)
        return entry ? entry.value : 0
    }

    const getColumnTotal = (colMonth: number, colYear: number, type: 'asset' | 'liability') => {
        const cats = type === 'asset' ? assets : liabilities
        return cats.reduce((sum, cat) => sum + getValue(cat.id, colMonth, colYear), 0)
    }

    const renderGroup = (groupName: string, items: Category[], isLiability: boolean) => {
        if (items.length === 0) return null;

        const groupColorClass = isLiability ? 'text-[#9F2F2D] dark:text-[#FB7185]' : 'text-[#346538] dark:text-[#34D399]';
        const groupBgClass = isLiability ? 'bg-[#FCF2F2] dark:bg-[#1A0B0B]' : 'bg-[#F4F9F4] dark:bg-[#0D211A]';
        const inputColor = isLiability ? 'text-[#9F2F2D] dark:text-[#FB7185]' : 'text-[#111111] dark:text-[#F7F6F3]';

        const groupTotal = (colMonth: number, colYear: number) => items.reduce((sum, cat) => sum + getValue(cat.id, colMonth, colYear), 0);

        return (
            <tbody key={groupName}>
                <tr className={`${groupBgClass} font-semibold border-y `}>
                    <td className={`px-4 py-2 ${groupColorClass} border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-10 ${groupBgClass} shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333] uppercase text-[10px] tracking-wider`}>
                        {groupName}
                    </td>
                    {columns.map(col => (
                        <td key={col.label} className={`px-4 py-2 text-right border-r border-[#EAEAEA] dark:border-[#333333] font-mono tabular-nums ${groupColorClass} text-xs`}>
                            {groupTotal(col.month, col.year).toLocaleString('en-US')}
                        </td>
                    ))}
                </tr>
                {items.map(item => (
                    <tr key={item.id} className="border-b border-[#EAEAEA] dark:border-[#333333] hover:bg-[#FBFBFA] dark:hover:bg-[#111111] transition-colors group">
                        <td className="px-4 py-2.5 font-medium text-[#111111] dark:text-[#F7F6F3] border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-10 bg-white dark:bg-[#050505] group-hover:bg-[#FBFBFA] dark:group-hover:bg-[#111111] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333]">
                            <div className="pl-4 border-l border-[#EAEAEA] dark:border-[#333333]">
                                {item.name}
                            </div>
                        </td>
                        {columns.map(col => (
                            <td key={col.label} className="px-2 py-1 text-right border-r border-[#EAEAEA] dark:border-[#333333]">
                                <input
                                    type="number"
                                    value={getValue(item.id, col.month, col.year) || ''}
                                    onChange={(e) => updateValue(item.id, col.month, col.year, parseFloat(e.target.value) || 0)}
                                    className={`w-full bg-transparent text-right outline-none focus:bg-[#FBFBFA] dark:focus:bg-[#111111] rounded px-2 py-1 border border-transparent focus:border-[#EAEAEA] dark:focus:border-[#333333] hover:bg-[#FBFBFA] dark:hover:bg-[#111111] transition-colors font-mono tabular-nums text-sm ${inputColor}`}
                                />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        )
    }

    if (categories.length === 0) {
        return <div className="p-8 text-center text-[#787774] font-mono text-sm">{t('empty')}</div>
    }

    return (
        <div className="relative w-full overflow-x-auto excel-table-container">
            <div className="absolute top-3 right-4 z-30 flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold bg-[#FFFFFF]/80 dark:bg-[#050505]/80 backdrop-blur pb-1 px-3 rounded-full">
                {isSyncing ? (
                    <><Loader2 className="h-3 w-3 animate-spin text-[#1F6C9F] dark:text-[#60A5FA]" /> <span className="text-[#1F6C9F] dark:text-[#60A5FA]">{t('syncing')}</span></>
                ) : (
                    <span className="text-[#346538] dark:text-[#34D399]">✔ {t('saved')}</span>
                )}
            </div>

            <table className="w-full text-sm text-left border-collapse min-w-[800px]">
                <thead className="bg-[#FBFBFA] dark:bg-[#111111] text-[#787774] dark:text-[#A1A1AA] font-semibold uppercase text-[10px] tracking-widest">
                    <tr>
                        <th className="px-4 py-4 border-b border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-20 bg-[#FBFBFA] dark:bg-[#111111] w-[200px] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333]">
                            Category
                        </th>
                        {columns.map(col => (
                            <th key={col.label} className={`px-4 py-4 border-b border-r border-[#EAEAEA] dark:border-[#333333] text-right min-w-[120px] ${col.isCurrent ? 'bg-[#E1F3FE]/50 dark:bg-[#0A1622]/50' : 'bg-[#FBFBFA] dark:bg-[#111111]'}`}>
                                {col.label} {col.isCurrent && <span className="ml-1 text-[10px] text-[#1F6C9F] dark:text-[#60A5FA]">(Now)</span>}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* ---------- ASSETS ---------- */}
                <tbody>
                    <tr className="bg-[#EDF3EC] dark:bg-[#0A1A14]">
                        <td className="px-4 py-3 font-bold text-[#346538] dark:text-[#34D399] border-b border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-10 bg-[#EDF3EC] dark:bg-[#0A1A14] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333] uppercase text-xs tracking-wider">
                            {t('assets')}
                        </td>
                        {columns.map(col => <td key={col.label} className="border-b border-[#EAEAEA] dark:border-[#333333]"></td>)}
                    </tr>
                </tbody>

                {assetGroups.map(group => renderGroup(group.name, assets.filter(a => a.group_id === group.id), false))}
                {renderGroup("Uncategorized Assets", assets.filter(a => !a.group_id), false)}

                <tbody>
                    <tr className="bg-[#FBFBFA] dark:bg-[#111111] font-semibold">
                        <td className="px-4 py-3 text-[#787774] dark:text-[#A1A1AA] border-b border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-10 bg-[#FBFBFA] dark:bg-[#111111] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333] uppercase text-xs tracking-wider">
                            {t('totalAssets')}
                        </td>
                        {columns.map(col => (
                            <td key={col.label} className="px-4 py-3 text-right border-b border-r border-[#EAEAEA] dark:border-[#333333] text-[#787774] dark:text-[#A1A1AA] font-mono tabular-nums">
                                {getColumnTotal(col.month, col.year, 'asset').toLocaleString('en-US')}
                            </td>
                        ))}
                    </tr>
                </tbody>

                {/* ---------- LIABILITIES ---------- */}
                <tbody>
                    <tr className="bg-[#FDEBEC] dark:bg-[#1F0A0A]">
                        <td className="px-4 py-3 font-bold text-[#9F2F2D] dark:text-[#FB7185] border-b border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-10 bg-[#FDEBEC] dark:bg-[#1F0A0A] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333] uppercase text-xs tracking-wider">
                            {t('liabilities')}
                        </td>
                        {columns.map(col => <td key={col.label} className="border-b border-[#EAEAEA] dark:border-[#333333]"></td>)}
                    </tr>
                </tbody>

                {liabilityGroups.map(group => renderGroup(group.name, liabilities.filter(a => a.group_id === group.id), true))}
                {renderGroup("Uncategorized Liabilities", liabilities.filter(a => !a.group_id), true)}

                <tbody>
                    <tr className="bg-[#FBFBFA] dark:bg-[#111111] font-semibold">
                        <td className="px-4 py-3 text-[#787774] dark:text-[#A1A1AA] border-b border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-10 bg-[#FBFBFA] dark:bg-[#111111] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333] uppercase text-xs tracking-wider">
                            {t('totalLiabilities')}
                        </td>
                        {columns.map(col => (
                            <td key={col.label} className="px-4 py-3 text-right border-b border-r border-[#EAEAEA] dark:border-[#333333] text-[#787774] dark:text-[#A1A1AA] font-mono tabular-nums">
                                {getColumnTotal(col.month, col.year, 'liability').toLocaleString('en-US')}
                            </td>
                        ))}
                    </tr>

                    {/* ---------- NET WORTH ---------- */}
                    <tr className="bg-[#E1F3FE] dark:bg-[#0A1622] font-bold text-base sticky bottom-0 z-20 shadow-[0_-1px_0_0_#EAEAEA] dark:shadow-[0_-1px_0_0_#333333]">
                        <td className="px-4 py-5 text-[#1F6C9F] dark:text-[#60A5FA] border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-30 bg-[#E1F3FE] dark:bg-[#0A1622] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333] uppercase tracking-wider text-sm">
                            {t('netWorth')}
                        </td>
                        {columns.map(col => {
                            const netWorth = getColumnTotal(col.month, col.year, 'asset') - getColumnTotal(col.month, col.year, 'liability')
                            return (
                                <td key={col.label} className="px-4 py-5 text-right border-r border-[#EAEAEA] dark:border-[#333333] text-[#1F6C9F] dark:text-[#60A5FA] whitespace-nowrap font-mono tabular-nums">
                                    {netWorth.toLocaleString('en-US')}
                                </td>
                            )
                        })}
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
