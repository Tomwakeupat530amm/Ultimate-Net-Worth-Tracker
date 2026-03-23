'use client'

import { useState } from 'react'
import { PremiumCard } from '@/components/ui/PremiumCard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { useTranslations } from 'next-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Layers, SortDesc } from 'lucide-react'

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
        { name: 'Start', base: 0, val: startVal, color: '#94A3B8' },
        {
            name: 'Contrib',
            base: contr >= 0 ? startVal : startVal + contr,
            val: Math.abs(contr),
            color: '#CBD5E1'
        },
        {
            name: 'Gain',
            base: gain >= 0 ? startVal + contr : startVal + contr + gain,
            val: Math.abs(gain),
            color: gain >= 0 ? '#10B981' : '#F43F5E'
        },
        { name: 'Current', base: 0, val: currentVal, color: '#3B82F6' }
    ]

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const rawVal = payload[0].payload.name === 'Contributions' || payload[0].payload.name === 'Contrib' ? contr : payload[0].payload.name === 'Gain' ? gain : payload[0].payload.val;
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
        <PremiumCard className="w-full flex flex-col md:flex-row shadow-sm border border-[#EAEAEA] dark:border-[#333333] overflow-hidden bg-white dark:bg-[#050505]">
            {/* Controls Side */}
            <div className="w-full md:w-[220px] bg-[#FBFBFA] dark:bg-[#0A0A0A] p-4 flex flex-row md:flex-col gap-5 border-b md:border-b-0 md:border-r border-[#EAEAEA] dark:border-[#333333]">
                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-1.5 opacity-70">
                        <Layers className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Analysis Type</span>
                    </div>
                    <Select value={type} onValueChange={(v) => setType(v as any)}>
                        <SelectTrigger className="h-9 bg-white dark:bg-[#111111] text-xs shadow-none border-[#EAEAEA] dark:border-[#333333]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asset">Assets</SelectItem>
                            <SelectItem value="liability">Liabilities</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-1.5 opacity-70">
                        <SortDesc className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Sort By</span>
                    </div>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                        <SelectTrigger className="h-9 bg-white dark:bg-[#111111] text-xs shadow-none border-[#EAEAEA] dark:border-[#333333]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Value">Value</SelectItem>
                            <SelectItem value="Gain">Gain</SelectItem>
                            <SelectItem value="Contributions">Contrib.</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table & Waterfall Side */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 p-0">
                {/* Table */}
                <div className="overflow-hidden border-r border-[#EAEAEA] dark:border-[#333333] flex flex-col">
                    <div className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-[10px] uppercase tracking-widest font-bold px-4 py-2 flex items-center justify-between">
                        <span>Analysis: {type === 'asset' ? 'Assets' : 'Liabilities'}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-[#FBFBFA] dark:bg-[#111111] text-[#787774] border-b border-[#EAEAEA] dark:border-[#333333]">
                                <tr>
                                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Asset Item</th>
                                    <th className="px-4 py-3 font-semibold text-right text-blue-600 dark:text-blue-400 whitespace-nowrap">Value ▾</th>
                                    <th className="px-2 py-3 font-semibold text-right">%</th>
                                    <th className="px-3 py-3 font-semibold text-right whitespace-nowrap hidden sm:table-cell">Start Val.</th>
                                    <th className="px-3 py-3 font-semibold text-right whitespace-nowrap">Gain</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#333333] font-mono">
                                {items.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-[#FBFBFA] dark:hover:bg-[#1A1A1A] transition-colors group">
                                        <td className="px-4 py-2.5 font-sans font-medium text-[#111111] dark:text-[#F7F6F3]">{item.name}</td>
                                        <td className="px-4 py-2.5 text-right font-bold text-blue-600 dark:text-blue-400">{Math.round(item.currentValue).toLocaleString('en-US')}</td>
                                        <td className="px-2 py-2.5 text-right text-[#787774] text-[10px]">{item.percentage.toFixed(0)}%</td>
                                        <td className="px-3 py-2.5 text-right text-[#787774] hidden sm:table-cell">{item.startValue === 0 ? '-' : Math.round(item.startValue).toLocaleString('en-US')}</td>
                                        <td className="px-3 py-2.5 text-right">
                                            {item.gain === 0 ? (
                                                <span className="text-[#787774]">-</span>
                                            ) : (
                                                <span className={`${item.gain > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} font-bold`}>
                                                    {item.gain > 0 ? '+' : ''}{Math.round(item.gain).toLocaleString('en-US')}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {/* Total Row */}
                                <tr className="bg-[#FBFBFA] dark:bg-[#111111] font-bold border-t-2 border-[#EAEAEA] dark:border-[#333333]">
                                    <td className="px-4 py-4 font-sans text-[#111111] dark:text-[#F7F6F3]">Total Portfolio</td>
                                    <td className="px-4 py-4 text-right text-blue-600 dark:text-blue-400">{Math.round(currentVal).toLocaleString('en-US')}</td>
                                    <td className="px-2 py-4 text-right text-[#787774]">100%</td>
                                    <td className="px-3 py-4 text-right text-[#787774] hidden sm:table-cell">{Math.round(startVal).toLocaleString('en-US')}</td>
                                    <td className="px-3 py-4 text-right">
                                        <span className={gain > 0 ? 'text-emerald-600 dark:text-emerald-400' : gain < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-[#787774]'}>
                                            {gain > 0 ? '+' : ''}{Math.round(gain).toLocaleString('en-US')}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Waterfall Chart */}
                <div className="flex flex-col items-center justify-center p-8 h-[450px] xl:h-auto min-h-[350px] bg-white dark:bg-[#050505]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                                tick={(props: any) => {
                                    const { x, y, payload } = props;
                                    const index = waterfallData.findIndex(d => d.name === payload.value);
                                    if (index === -1) return null;

                                    const item = waterfallData[index];
                                    const percentage = index === 3 ? "100%" :
                                        index === 0 ? `${((startVal / currentVal) * 100).toFixed(0)}%` :
                                            index === 1 ? `${((contr / currentVal) * 100).toFixed(0)}%` :
                                                `${gain >= 0 ? '+' : ''}${((gain / currentVal) * 100).toFixed(0)}%`;

                                    return (
                                        <g transform={`translate(${x},${y})`}>
                                            <text x={0} y={15} textAnchor="middle" fill="#787774" fontSize={10} fontWeight="bold" className="capitalize">{item.name}</text>
                                            <text x={0} y={30} textAnchor="middle" fill={index === 3 ? "#3B82F6" : "#787774"} className={index !== 3 ? "dark:fill-white" : ""} fontSize={10} fontWeight="bold" fontFamily="monospace">{percentage}</text>
                                        </g>
                                    );
                                }}
                            />
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
                </div>
            </div>
        </PremiumCard>
    )
}
