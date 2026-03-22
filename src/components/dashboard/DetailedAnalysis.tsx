'use client'

import { useState } from 'react'
import { PremiumCard } from '@/components/ui/PremiumCard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { useTranslations } from 'next-intl'

export function DetailedAnalysis({ data }: { data: any }) {
    const t = useTranslations('Dashboard')
    const [type, setType] = useState<'asset' | 'liability'>('asset')
    const [sortBy, setSortBy] = useState<'Value' | 'Gain' | 'Contributions'>('Value')

    const activeData = type === 'asset' ? data.assets : data.liabilities
    const items = [...activeData.items].sort((a, b) => {
        if (sortBy === 'Value') return b.currentValue - a.currentValue
        if (sortBy === 'Gain') return b.gain - a.gain
        if (sortBy === 'Contributions') return b.contributions - a.contributions
        return 0
    })

    // Waterfall calculation
    const startVal = activeData.totalStartValue
    const contr = activeData.totalContributions
    const gain = activeData.totalGain
    const currentVal = activeData.totalValue

    const waterfallData = [
        { name: 'Start Value', base: 0, val: startVal, color: '#D1D5DB' },
        {
            name: 'Contributions',
            base: contr >= 0 ? startVal : startVal + contr,
            val: Math.abs(contr),
            color: '#E5E7EB'
        },
        {
            name: 'Gain',
            base: gain >= 0 ? startVal + contr : startVal + contr + gain,
            val: Math.abs(gain),
            color: gain >= 0 ? '#34D399' : '#FB7185'
        },
        { name: 'Current Value', base: 0, val: currentVal, color: '#3B82F6' }
    ]

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const rawVal = payload[0].payload.name === 'Contributions' ? contr : payload[0].payload.name === 'Gain' ? gain : payload[0].payload.val;
            return (
                <div className="bg-white dark:bg-[#111111] border border-[#EAEAEA] dark:border-[#333333] p-2 rounded shadow-sm text-xs font-mono">
                    <p className="font-bold mb-1">{label}</p>
                    <p>{Number(rawVal).toLocaleString('en-US')}</p>
                </div>
            )
        }
        return null
    }

    return (
        <PremiumCard className="w-full flex flex-col md:flex-row shadow-sm border border-[#EAEAEA] dark:border-[#333333] overflow-hidden">
            {/* Controls Side */}
            <div className="w-full md:w-1/5 bg-[#FBFBFA] dark:bg-[#111111] p-4 flex flex-row md:flex-col gap-4 border-b md:border-b-0 md:border-r border-[#EAEAEA] dark:border-[#333333]">
                <div className="flex flex-col gap-2 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#787774]">Type</span>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value as any)}
                        className="h-8 rounded bg-white dark:bg-[#050505] border border-[#EAEAEA] dark:border-[#333333] text-xs px-2 focus:ring-black"
                    >
                        <option value="asset">Assets</option>
                        <option value="liability">Liabilities</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#787774]">Sort by</span>
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="h-8 rounded bg-white dark:bg-[#050505] border border-[#EAEAEA] dark:border-[#333333] text-xs px-2 focus:ring-black"
                    >
                        <option value="Value">Value</option>
                        <option value="Gain">Gain</option>
                        <option value="Contributions">Contributions</option>
                    </select>
                </div>
            </div>

            {/* Table & Waterfall Side */}
            <div className="w-full md:w-4/5 grid grid-cols-1 xl:grid-cols-2 p-0">
                {/* Table */}
                <div className="overflow-x-auto border-r border-[#EAEAEA] dark:border-[#333333]">
                    <div className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-[10px] uppercase tracking-widest font-bold px-4 py-2 flex items-center justify-between">
                        <span>Detailed Analysis ({type === 'asset' ? 'Assets' : 'Liabilities'})</span>
                    </div>
                    <table className="w-full text-xs text-left">
                        <thead className="bg-[#FBFBFA] dark:bg-[#111111] text-[#787774] border-b border-[#EAEAEA] dark:border-[#333333]">
                            <tr>
                                <th className="px-4 py-2 font-semibold">Item</th>
                                <th className="px-4 py-2 font-semibold text-right text-blue-600 dark:text-blue-400">Value ▾</th>
                                <th className="px-4 py-2 font-semibold text-right">%</th>
                                <th className="px-4 py-2 font-semibold text-right">Start Val.</th>
                                <th className="px-4 py-2 font-semibold text-right">Contr.</th>
                                <th className="px-4 py-2 font-semibold text-right">Gain</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#333333] font-mono">
                            {items.map((item: any) => (
                                <tr key={item.id} className="hover:bg-[#FBFBFA] dark:hover:bg-[#1A1A1A] transition-colors">
                                    <td className="px-4 py-2 font-sans font-medium text-[#111111] dark:text-[#F7F6F3]">{item.name}</td>
                                    <td className="px-4 py-2 text-right font-bold text-blue-600 dark:text-blue-400">{Math.round(item.currentValue).toLocaleString('en-US')}</td>
                                    <td className="px-4 py-2 text-right text-[#787774]">{item.percentage.toFixed(0)}%</td>
                                    <td className="px-4 py-2 text-right text-[#787774]">{item.startValue === 0 ? '-' : Math.round(item.startValue).toLocaleString('en-US')}</td>
                                    <td className="px-4 py-2 text-right text-[#787774]">{item.contributions === 0 ? '-' : Math.round(item.contributions).toLocaleString('en-US')}</td>
                                    <td className="px-4 py-2 text-right">
                                        {item.gain === 0 ? (
                                            <span className="text-[#787774]">-</span>
                                        ) : (
                                            <span className={item.gain > 0 ? 'text-[#346538] dark:text-[#34D399]' : 'text-[#9F2F2D] dark:text-[#FB7185]'}>
                                                {item.gain > 0 ? '+' : ''}{Math.round(item.gain).toLocaleString('en-US')}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {/* Total Row */}
                            <tr className="bg-[#FBFBFA] dark:bg-[#111111] font-bold">
                                <td className="px-4 py-3 font-sans text-[#111111] dark:text-[#F7F6F3]">Total</td>
                                <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400">{Math.round(currentVal).toLocaleString('en-US')}</td>
                                <td className="px-4 py-3 text-right text-[#787774]">100%</td>
                                <td className="px-4 py-3 text-right text-[#787774]">{Math.round(startVal).toLocaleString('en-US')}</td>
                                <td className="px-4 py-3 text-right text-[#787774]">{Math.round(contr).toLocaleString('en-US')}</td>
                                <td className="px-4 py-3 text-right">
                                    <span className={gain > 0 ? 'text-[#346538] dark:text-[#34D399]' : gain < 0 ? 'text-[#9F2F2D] dark:text-[#FB7185]' : 'text-[#787774]'}>
                                        {gain > 0 ? '+' : ''}{Math.round(gain).toLocaleString('en-US')}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Waterfall Chart */}
                <div className="flex flex-col items-center justify-center p-6 h-[400px] xl:h-auto min-h-[300px] bg-white dark:bg-[#050505]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#787774' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#787774' }} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} />
                            <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                            <Bar dataKey="base" stackId="a" fill="transparent" isAnimationActive={false} />
                            <Bar dataKey="val" stackId="a" radius={[2, 2, 0, 0]}>
                                {waterfallData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Tiny Summary below Waterfall */}
                    <div className="w-full flex justify-between px-8 mt-4 text-[10px] uppercase font-bold text-[#787774]">
                        <div className="flex flex-col items-center"><span>Start</span><span className="text-[#111111] dark:text-white font-mono">{((startVal / currentVal) * 100).toFixed(0)}%</span></div>
                        <div className="flex flex-col items-center"><span>Contr</span><span className="text-[#111111] dark:text-white font-mono">{((contr / currentVal) * 100).toFixed(0)}%</span></div>
                        <div className="flex flex-col items-center"><span>Gain</span><span className="text-[#111111] dark:text-white font-mono">{((gain / currentVal) * 100).toFixed(0)}%</span></div>
                        <div className="flex flex-col items-center"><span>Current</span><span className="text-blue-500 font-mono">100%</span></div>
                    </div>
                </div>
            </div>
        </PremiumCard>
    )
}
