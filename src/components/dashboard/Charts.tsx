'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const PIE_COLORS_LIGHT = ['#1F6C9F', '#346538', '#956400', '#9F2F2D', '#787774']
const PIE_COLORS_DARK = ['#60A5FA', '#34D399', '#FBBF24', '#FB7185', '#A1A1AA'] // Brighter pastels for dark mode

export function NetWorthChart({ data, height = 350 }: { data: any[], height?: number }) {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center text-[#787774]" style={{ height }}>No data</div>
    }

    const isDark = mounted && resolvedTheme === 'dark'
    const tooltipBg = isDark ? '#111111' : '#FFFFFF'
    const tooltipColor = isDark ? '#F7F6F3' : '#111111'
    const tooltipBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

    // Muted Colors
    const assetsColor = isDark ? '#34D399' : '#346538'
    const liabColor = isDark ? '#FB7185' : '#9F2F2D'
    const netWorthColor = isDark ? '#60A5FA' : '#1F6C9F'

    return (
        <div className="w-full mt-4 font-mono" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={assetsColor} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={assetsColor} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorLiab" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={liabColor} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={liabColor} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={netWorthColor} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={netWorthColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                    <XAxis dataKey="label" className="text-[10px]" tick={{ fill: '#787774' }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis
                        className="text-[10px]"
                        tick={{ fill: '#787774' }}
                        axisLine={false}
                        tickLine={false}
                        dx={-10}
                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                    />
                    <Tooltip
                        formatter={(value: any) => [Number(value).toLocaleString('en-US'), undefined]}
                        contentStyle={{
                            borderRadius: '12px',
                            border: `1px solid ${tooltipBorder}`,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            backgroundColor: tooltipBg,
                            color: tooltipColor,
                            fontSize: '12px',
                            fontFamily: 'var(--font-geist-mono)'
                        }}
                        itemStyle={{ color: tooltipColor }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px', color: '#787774' }} iconType="circle" iconSize={6} />
                    <Area type="monotone" dataKey="assets" name="Assets" stroke={assetsColor} strokeWidth={1.5} fillOpacity={1} fill="url(#colorAssets)" />
                    <Area type="monotone" dataKey="liabilities" name="Liabilities" stroke={liabColor} strokeWidth={1.5} fillOpacity={1} fill="url(#colorLiab)" />
                    <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke={netWorthColor} strokeWidth={2} fillOpacity={1} fill="url(#colorNetWorth)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export function AllocationChart({ data, height = 300 }: { data: any[], height?: number }) {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center text-[#787774]" style={{ height }}>No assets configured</div>
    }

    const isDark = mounted && resolvedTheme === 'dark'
    const tooltipBg = isDark ? '#111111' : '#FFFFFF'
    const tooltipColor = isDark ? '#F7F6F3' : '#111111'
    const tooltipBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
    const palette = isDark ? PIE_COLORS_DARK : PIE_COLORS_LIGHT

    return (
        <div className="w-full mt-4 font-mono" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: any) => [Number(value).toLocaleString('en-US'), 'Value']}
                        contentStyle={{
                            borderRadius: '12px',
                            border: `1px solid ${tooltipBorder}`,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            backgroundColor: tooltipBg,
                            color: tooltipColor,
                            fontSize: '12px',
                            fontFamily: 'var(--font-geist-mono)'
                        }}
                    />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} iconType="circle" iconSize={6} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
