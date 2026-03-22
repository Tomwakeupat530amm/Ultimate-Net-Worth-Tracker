'use client'

import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ReferenceLine, Label } from 'recharts'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const PIE_COLORS_LIGHT = ['#1F6C9F', '#346538', '#956400', '#9F2F2D', '#787774', '#6366f1', '#14b8a6', '#f59e0b', '#ec4899']
const PIE_COLORS_DARK = ['#60A5FA', '#34D399', '#FBBF24', '#FB7185', '#A1A1AA', '#818cf8', '#2dd4bf', '#fbbf24', '#f472b6']

const getSymmetricDomain = (dataDomain: any): [number, number] => {
    if (!dataDomain || dataDomain.length < 2) return [-100, 100];

    const min = Number(dataDomain[0]);
    const max = Number(dataDomain[1]);

    if (isNaN(min) || isNaN(max)) return [-100, 100];

    const maxVal = Math.max(Math.abs(min), Math.abs(max));
    const limit = maxVal === 0 ? 100 : maxVal * 1.1;
    return [-limit, limit];
};

export function NetWorthChart({ data, goals, height = 300 }: { data: any[], goals?: any[], height?: number }) {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!data || data.length === 0) return <div className="flex items-center justify-center text-[#787774]" style={{ height }}>No data</div>

    const isDark = mounted && resolvedTheme === 'dark'
    const tooltipBg = isDark ? '#111111' : '#FFFFFF'
    const tooltipColor = isDark ? '#F7F6F3' : '#111111'
    const tooltipBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

    const netWorthColor = isDark ? '#F7F6F3' : '#111111'
    const contribColor = isDark ? '#A1A1AA' : '#787774'

    return (
        <div className="w-full font-mono min-h-[300px]" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                    <defs>
                        <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={netWorthColor} stopOpacity={0.1} />
                            <stop offset="95%" stopColor={netWorthColor} stopOpacity={0.0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                    <XAxis dataKey="label" className="text-[10px]" tick={{ fill: '#787774' }} axisLine={false} tickLine={false} dy={10} angle={-45} textAnchor="end" height={60} />
                    <YAxis
                        className="text-[10px]"
                        tick={{ fill: '#787774' }}
                        axisLine={false}
                        tickLine={false}
                        dx={-5}
                        domain={getSymmetricDomain}
                        tickFormatter={(value) => value === 0 ? '0' : value >= 1000 || value <= -1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()}
                    />
                    <Tooltip
                        formatter={(value: any) => [Number(value).toLocaleString('en-US'), undefined]}
                        contentStyle={{
                            borderRadius: '8px',
                            border: `1px solid ${tooltipBorder}`,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            backgroundColor: tooltipBg,
                            color: tooltipColor,
                            fontSize: '12px',
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#787774' }} iconType="plainline" verticalAlign="bottom" />

                    <ReferenceLine y={0} stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} strokeWidth={1} />

                    {goals?.map((g, i) => (
                        <ReferenceLine
                            key={i}
                            y={g.target_amount}
                            stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                            strokeDasharray="3 3"
                        >
                            <Label
                                value={`Goal: ${g.name}`}
                                position="insideLeft"
                                offset={10}
                                style={{ fontSize: '9px', fill: '#787774', fontWeight: 'bold' }}
                            />
                        </ReferenceLine>
                    ))}

                    <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke={netWorthColor} strokeWidth={3} fill="url(#colorNetWorth)" activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="cumulativeNwContr" name="Net Worth Contributions" stroke={contribColor} strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export function AssetLiabilityChart({ data, height = 300 }: { data: any[], height?: number }) {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!data || data.length === 0) return <div className="flex items-center justify-center text-[#787774]" style={{ height }}>No data</div>

    const isDark = mounted && resolvedTheme === 'dark'
    const tooltipBg = isDark ? '#111111' : '#FFFFFF'
    const tooltipColor = isDark ? '#F7F6F3' : '#111111'
    const tooltipBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

    const assetsColor = isDark ? '#60A5FA' : '#1F6C9F'
    const liabColor = isDark ? '#A1A1AA' : '#9CA3AF'

    const chartData = data.map(d => ({
        ...d,
        negLiabilities: -(d.liabilities || 0),
        negCumulativeLiabContr: -(d.cumulativeLiabContr || 0)
    }))

    return (
        <div className="w-full font-mono min-h-[300px]" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                    <defs>
                        <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={assetsColor} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={assetsColor} stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="colorLiab" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={liabColor} stopOpacity={0.05} />
                            <stop offset="95%" stopColor={liabColor} stopOpacity={0.2} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                    <XAxis dataKey="label" className="text-[10px]" tick={{ fill: '#787774' }} axisLine={false} tickLine={false} dy={10} angle={-45} textAnchor="end" height={60} />
                    <YAxis
                        className="text-[10px]"
                        tick={{ fill: '#787774' }}
                        axisLine={false}
                        tickLine={false}
                        dx={-5}
                        domain={getSymmetricDomain}
                        tickFormatter={(value) => value === 0 ? '0' : value >= 1000 || value <= -1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()}
                    />
                    <Tooltip
                        formatter={(value: any, name: any) => [Math.abs(Number(value)).toLocaleString('en-US'), String(name).replace('neg', '')]}
                        contentStyle={{
                            borderRadius: '8px',
                            border: `1px solid ${tooltipBorder}`,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            backgroundColor: tooltipBg,
                            color: tooltipColor,
                            fontSize: '12px',
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px', color: '#787774' }} iconType="plainline" verticalAlign="bottom" />

                    <ReferenceLine y={0} stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} strokeWidth={1} />

                    <Area type="monotone" dataKey="assets" name="Assets" stroke={assetsColor} strokeWidth={2} fill="url(#colorAssets)" activeDot={{ r: 4 }} />
                    <Area type="stepAfter" dataKey="negLiabilities" name="Liabilities" stroke={liabColor} strokeWidth={2} fill="url(#colorLiab)" activeDot={{ r: 4 }} />

                    <Line type="monotone" dataKey="cumulativeAssetContr" name="Asset Contributions" stroke={assetsColor} strokeWidth={2} strokeDasharray="4 4" dot={false} />
                    <Line type="stepAfter" dataKey="negCumulativeLiabContr" name="Liability Contributions" stroke={liabColor} strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export function AllocationDonut({ data, height = 180 }: { data: any[], height?: number }) {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center text-[#787774] text-xs h-full w-full">Empty</div>
    }

    const isDark = mounted && resolvedTheme === 'dark'
    const tooltipBg = isDark ? '#111111' : '#FFFFFF'
    const tooltipColor = isDark ? '#F7F6F3' : '#111111'
    const tooltipBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
    const palette = isDark ? PIE_COLORS_DARK : PIE_COLORS_LIGHT

    return (
        <div className="w-[140px] h-[140px] font-mono flex-shrink-0" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={5}
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
                            borderRadius: '8px',
                            border: `1px solid ${tooltipBorder}`,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            backgroundColor: tooltipBg,
                            color: tooltipColor,
                            fontSize: '11px',
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
