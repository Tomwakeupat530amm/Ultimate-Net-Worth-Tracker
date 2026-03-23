'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNetWorthStore, Category, NetWorthEntry } from '@/store/netWorthStore'
import { Loader2, ChevronLeft, ChevronRight, RotateCcw, ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, CreditCard, Activity } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

// Helper component for mini trend charts
function Sparkline({ data, color }: { data: number[], color: string }) {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 100;
    const height = 30;
    const padding = 2;

    const points = data.map((val, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - ((val - min) / range) * (height - padding * 2) - padding
    }));

    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

    return (
        <svg width={width} height={height} className="overflow-visible">
            <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

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

    const [viewMonth, setViewMonth] = useState(startMonth)
    const [viewYear, setViewYear] = useState(startYear)

    // Reset view if start period changes in settings
    useEffect(() => {
        setViewMonth(startMonth)
        setViewYear(startYear)
    }, [startMonth, startYear])

    useEffect(() => {
        setInitialData(initialCategories, initialEntries)
    }, [initialCategories, initialEntries, setInitialData])

    const columns = useMemo(() => {
        const cols = []
        let currentMonth = viewMonth
        let currentYear = viewYear
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
    }, [viewMonth, viewYear])

    const handlePrevYear = () => {
        setViewYear(y => y - 1)
    }

    const handleNextYear = () => {
        setViewYear(y => y + 1)
    }

    const handleReset = () => {
        setViewMonth(startMonth)
        setViewYear(startYear)
    }

    const assets = categories.filter(c => c.type === 'asset')
    const liabilities = categories.filter(c => c.type === 'liability')

    const assetGroups = initialGroups.filter(g => g.type === 'asset')
    const liabilityGroups = initialGroups.filter(g => g.type === 'liability')

    const getValue = useCallback((categoryId: string, month: number, year: number) => {
        const entry = entries.find(e => e.category_id === categoryId && e.month === month && e.year === year)
        return entry ? entry.value : 0
    }, [entries])

    const getColumnTotal = useCallback((colMonth: number, colYear: number, type: 'asset' | 'liability') => {
        const cats = type === 'asset' ? assets : liabilities
        return cats.reduce((sum, cat) => sum + getValue(cat.id, colMonth, colYear), 0)
    }, [assets, liabilities, getValue])

    // --- SUMMARY CALCULATIONS ---
    const latestMonth = useMemo(() => {
        if (!columns || columns.length === 0) return null
        const current = columns.find(c => c.isCurrent)
        return current || columns[columns.length - 1]
    }, [columns])

    const firstMonth = columns && columns.length > 0 ? columns[0] : null

    const summaryData = useMemo(() => {
        if (!latestMonth || !firstMonth) {
            return { totalA: 0, totalL: 0, netWorth: 0, change: 0, percentChange: 0 }
        }

        const totalA = getColumnTotal(latestMonth.month, latestMonth.year, 'asset')
        const totalL = getColumnTotal(latestMonth.month, latestMonth.year, 'liability')
        const netWorth = totalA - totalL

        const firstA = getColumnTotal(firstMonth.month, firstMonth.year, 'asset')
        const firstL = getColumnTotal(firstMonth.month, firstMonth.year, 'liability')
        const firstNetWorth = firstA - firstL

        const change = netWorth - firstNetWorth
        const percentChange = firstNetWorth !== 0 ? (change / Math.abs(firstNetWorth)) * 100 : 0

        return { totalA, totalL, netWorth, change, percentChange }
    }, [latestMonth, firstMonth, getColumnTotal])


    const renderGroup = useCallback((groupName: string, items: Category[], isLiability: boolean) => {
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
                    <td className="px-4 py-2 border-r border-[#EAEAEA] dark:border-[#333333] bg-white dark:bg-[#050505]">
                        <Sparkline
                            data={columns.map(col => groupTotal(col.month, col.year))}
                            color={isLiability ? '#FB7185' : '#34D399'}
                        />
                    </td>
                </tr>
                {items.map(item => {
                    const itemData = columns.map(col => getValue(item.id, col.month, col.year));
                    return (
                        <tr key={item.id} className="border-b border-[#EAEAEA] dark:border-[#333333] hover:bg-[#FBFBFA] dark:hover:bg-[#111111] transition-colors group focus-within:bg-blue-50/30 dark:focus-within:bg-blue-900/10">
                            <td className="px-4 py-2.5 font-medium text-[#111111] dark:text-[#F7F6F3] border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-10 bg-white dark:bg-[#050505] group-hover:bg-[#FBFBFA] dark:group-hover:bg-[#111111] group-focus-within:bg-blue-50/50 dark:group-focus-within:bg-blue-900/20 shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333] transition-colors">
                                <div className="pl-4 border-l border-[#EAEAEA] dark:border-[#333333]">
                                    {item.name}
                                </div>
                            </td>
                            {columns.map(col => (
                                <td key={col.label} className="px-1 py-0.5 text-right border-r border-[#EAEAEA] dark:border-[#333333]">
                                    <input
                                        type="number"
                                        value={getValue(item.id, col.month, col.year) || ''}
                                        onChange={(e) => updateValue(item.id, col.month, col.year, parseFloat(e.target.value) || 0)}
                                        className={`w-full bg-transparent text-right outline-none focus:bg-[#FBFBFA] dark:focus:bg-[#111111] rounded px-1.5 py-1 border border-transparent focus:border-[#EAEAEA] dark:focus:border-[#333333] hover:bg-[#FBFBFA] dark:hover:bg-[#111111] transition-colors font-mono tabular-nums text-sm ${inputColor}`}
                                    />
                                </td>
                            ))}
                            <td className="px-4 py-2 text-center border-r border-[#EAEAEA] dark:border-[#333333]">
                                <Sparkline data={itemData} color={isLiability ? '#FB7185' : '#1F6C9F'} />
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        )

    }, [columns, getValue, updateValue])

    if (categories.length === 0) {
        return <div className="p-8 text-center text-[#787774] font-mono text-sm">{t('empty')}</div>
    }

    return (
        <div className="relative w-full flex flex-col pt-16">
            {/* TOOLBAR */}
            <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md p-1 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                    <button
                        onClick={handlePrevYear}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        title={t('prevYear')}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="px-4 py-1 text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 min-w-[100px] text-center border-x border-zinc-200/50 dark:border-zinc-800/50">
                        {viewYear}
                        {viewMonth !== 1 && <span className="text-[10px] text-zinc-400 font-normal ml-1"> (starts {viewMonth})</span>}
                    </div>

                    <button
                        onClick={handleNextYear}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        title={t('nextYear')}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-full border border-zinc-200/50 dark:border-zinc-800/50 transition-all active:scale-95"
                    >
                        <RotateCcw className="w-3 h-3" />
                        {t('backToStart')}
                    </button>

                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md py-1.5 px-4 rounded-full border border-zinc-200/50 dark:border-zinc-800/50">
                        {isSyncing ? (
                            <><Loader2 className="h-3 w-3 animate-spin text-blue-500" /> <span className="text-blue-500">{t('syncing')}</span></>
                        ) : (
                            <span className="text-emerald-500 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {t('saved')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="mx-4 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: t('netWorth'), value: summaryData.netWorth, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/50', darkBg: 'dark:bg-blue-900/20', sub: true },
                    { label: t('assets'), value: summaryData.totalA, icon: Wallet, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/50', darkBg: 'dark:bg-emerald-900/20' },
                    { label: t('liabilities'), value: summaryData.totalL, icon: CreditCard, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/50', darkBg: 'dark:bg-rose-900/20' },
                    { label: t('yoyGrowth'), value: summaryData.change, percent: summaryData.percentChange, icon: Activity, color: 'text-zinc-600 dark:text-zinc-400', bg: 'bg-zinc-50/50', darkBg: 'dark:bg-zinc-900/30' },
                ].map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 ${card.bg} ${card.darkBg} backdrop-blur-sm shadow-sm flex items-start justify-between`}
                    >
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{card.label}</span>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-xl font-bold tracking-tight ${card.color}`}>
                                    {(card.value !== undefined && card.value !== null) ? Math.round(card.value).toLocaleString('en-US') : '0'}
                                </span>
                                {card.percent !== undefined && (
                                    <span className={`text-xs font-bold ${card.percent >= 0 ? 'text-emerald-600' : 'text-rose-600'} flex items-center`}>
                                        {card.percent >= 0 ? '+' : ''}{card.percent.toFixed(1)}%
                                        {card.percent >= 0 ? <ArrowUpRight className="w-3 h-3 ml-0.5" /> : <ArrowDownRight className="w-3 h-3 ml-0.5" />}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className={`p-2 rounded-xl ${card.bg} dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50`}>
                            <card.icon className={`w-4 h-4 ${card.color}`} />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="w-full overflow-x-auto excel-table-container custom-scrollbar">
                <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
                    <thead className="bg-[#FBFBFA] dark:bg-[#111111] text-[#787774] dark:text-[#A1A1AA] font-semibold uppercase text-[10px] tracking-widest sticky top-0 z-50">
                        <tr>
                            <th className="px-4 py-4 border-b border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-[60] bg-[#FBFBFA] dark:bg-[#111111] w-[200px] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333]">
                                {t('position')}
                            </th>
                            {columns.map(col => (
                                <motion.th
                                    key={col.label}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`px-3 py-4 border-b border-r border-[#EAEAEA] dark:border-[#333333] text-right min-w-[140px] ${col.isCurrent ? 'bg-blue-100/50 dark:bg-blue-900/20 shadow-[inset_0_-2px_0_0_#3B82F6]' : 'bg-[#FBFBFA] dark:bg-[#111111]'}`}
                                >
                                    {col.label} {col.isCurrent && <span className="ml-1 text-[10px] text-blue-600 dark:text-blue-400 font-bold">(Now)</span>}
                                </motion.th>
                            ))}
                            <th className="px-4 py-4 border-b border-r border-[#EAEAEA] dark:border-[#333333] text-center min-w-[120px] bg-[#FBFBFA] dark:bg-[#111111]">
                                {t('trend')}
                            </th>
                        </tr>
                    </thead>

                    {/* ---------- ASSETS ---------- */}
                    <tbody>
                        <tr className="bg-[#EDF3EC] dark:bg-[#0A1A14]">
                            <td className="px-4 py-3 font-bold text-[#346538] dark:text-[#34D399] border-b border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-10 bg-[#EDF3EC] dark:bg-[#0A1A14] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333] uppercase text-xs tracking-wider">
                                {t('assets')}
                            </td>
                            {columns.map(col => <td key={col.label} className="border-b border-[#EAEAEA] dark:border-[#333333]"></td>)}
                            <td className="border-b border-[#EAEAEA] dark:border-[#333333]"></td>
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
                                    {(getColumnTotal(col.month, col.year, 'asset') || 0).toLocaleString('en-US')}
                                </td>
                            ))}
                            <td className="border-b border-[#EAEAEA] dark:border-[#333333] bg-[#FBFBFA] dark:bg-[#111111]"></td>
                        </tr>
                    </tbody>

                    {/* ---------- LIABILITIES ---------- */}
                    <tbody>
                        <tr className="bg-[#FDEBEC] dark:bg-[#1F0A0A]">
                            <td className="px-4 py-3 font-bold text-[#9F2F2D] dark:text-[#FB7185] border-b border-r border-[#EAEAEA] dark:border-[#333333] sticky left-0 z-10 bg-[#FDEBEC] dark:bg-[#1F0A0A] shadow-[1px_0_0_0_#EAEAEA] dark:shadow-[1px_0_0_0_#333333] uppercase text-xs tracking-wider">
                                {t('liabilities')}
                            </td>
                            {columns.map(col => <td key={col.label} className="border-b border-[#EAEAEA] dark:border-[#333333]"></td>)}
                            <td className="border-b border-[#EAEAEA] dark:border-[#333333]"></td>
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
                                    {(getColumnTotal(col.month, col.year, 'liability') || 0).toLocaleString('en-US')}
                                </td>
                            ))}
                            <td className="border-b border-[#EAEAEA] dark:border-[#333333] bg-[#FBFBFA] dark:bg-[#111111]"></td>
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
                                        {(netWorth || 0).toLocaleString('en-US')}
                                    </td>
                                )
                            })}
                            <td className="bg-[#E1F3FE] dark:bg-[#0A1622] border-r border-zinc-200 dark:border-zinc-800"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
