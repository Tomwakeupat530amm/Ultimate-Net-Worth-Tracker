'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1', '#84cc16', '#eab308']

export function NetWorthChart({ data, height = 350 }: { data: any[], height?: number }) {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center text-gray-500" style={{ height }}>No data</div>
    }

    return (
        <div className="w-full mt-4" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-zinc-800" />
                    <XAxis dataKey="label" className="text-xs" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                    <YAxis
                        className="text-xs"
                        tick={{ fill: '#888' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                    />
                    <Tooltip
                        formatter={(value: any) => [Number(value).toLocaleString('en-US'), undefined]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, white)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="assets" name="Assets" stroke="#10b981" fillOpacity={1} fill="url(#colorAssets)" />
                    <Area type="monotone" dataKey="liabilities" name="Liabilities" stroke="#f43f5e" fillOpacity={0} fill="transparent" />
                    <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorNetWorth)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export function AllocationChart({ data, height = 300 }: { data: any[], height?: number }) {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center text-gray-500" style={{ height }}>No assets configured</div>
    }

    return (
        <div className="w-full mt-4" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [Number(value).toLocaleString('en-US'), 'Value']} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
