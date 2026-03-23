'use client'

import { PremiumCard } from '@/components/ui/PremiumCard'
import { Check, CheckCircle2, Clock, Info, Target, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

export function GoalAnalysis({ goals, currentNetWorth, settings }: { goals: any[], currentNetWorth: number, settings?: any }) {

    // Calculate Custom KPIs using Settings
    const assumedExpenses = Number(settings?.custom_kpi_expenses ?? 3000)
    const assumedAnnualReturn = Number(settings?.custom_kpi_return ?? 0.07)
    const assumedWithdrawalRate = Number(settings?.custom_kpi_withdrawal ?? 0.03)

    const runwayMonths = currentNetWorth > 0 ? (currentNetWorth / assumedExpenses).toFixed(0) : 0
    const monthlyReturn = currentNetWorth > 0 ? ((currentNetWorth * assumedAnnualReturn) / 12).toFixed(2) : 0
    const monthlyWithdrawal = currentNetWorth > 0 ? ((currentNetWorth * assumedWithdrawalRate) / 12).toFixed(2) : 0

    return (
        <PremiumCard className="col-span-4 shadow-sm border border-[#EAEAEA] dark:border-[#333333] overflow-hidden flex flex-col h-full bg-white dark:bg-[#050505]">
            <div className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-[10px] uppercase tracking-widest font-bold px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    <span>Goal Analysis</span>
                </div>
            </div>

            <div className="overflow-x-auto border-b border-[#EAEAEA] dark:border-[#333333]">
                <table className="w-full text-xs text-left">
                    <thead className="bg-[#FBFBFA] dark:bg-[#111111] text-[#787774] border-b border-[#EAEAEA] dark:border-[#333333]">
                        <tr>
                            <th className="px-2 py-2.5 font-bold uppercase tracking-tighter text-[9px] w-full min-w-[80px]">Goal Name</th>
                            <th className="px-2 py-2.5 font-bold uppercase tracking-tighter text-[9px] text-right whitespace-nowrap">Amount</th>
                            <th className="px-2 py-2.5 font-bold uppercase tracking-tighter text-[9px] text-center">Progress</th>
                            <th className="px-2 py-2.5 font-bold uppercase tracking-tighter text-[9px] text-center w-8">Status</th>
                            <th className="px-2 py-2.5 font-bold uppercase tracking-tighter text-[9px] text-right hidden md:table-cell whitespace-nowrap">Target</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#333333]">
                        {goals.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-[#787774] font-sans italic">No goals defined yet.</td></tr>
                        ) : goals.map((goal: any) => (
                            <tr key={goal.id} className="hover:bg-[#FBFBFA] dark:hover:bg-[#0A0A0A] transition-colors group">
                                <td className={`px-2 py-3 font-medium transition-colors ${goal.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#111111] dark:text-[#F7F6F3]'}`}>
                                    <div className="flex flex-col min-w-0 max-w-[100px] sm:max-w-none">
                                        <span className="truncate text-[11px]" title={goal.name}>{goal.name}</span>
                                        {goal.isCompleted && <span className="text-[8px] opacity-70 flex items-center gap-0.5"><Check className="w-2 h-2" /> Done</span>}
                                    </div>
                                </td>
                                <td className="px-2 py-3 text-right font-mono tabular-nums font-bold text-[10px] whitespace-nowrap">{goal.target_amount.toLocaleString('en-US')}</td>
                                <td className="px-2 py-3 text-center">
                                    <div className="flex items-center gap-1.5 justify-center">
                                        <div className="hidden sm:block w-12 lg:w-16 h-1.5 bg-[#EAEAEA] dark:bg-[#222222] rounded-full overflow-hidden flex-shrink-0">
                                            <div
                                                className={`h-full transition-all duration-1000 ease-out rounded-full ${goal.isCompleted ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`}
                                                style={{ width: `${Math.min(goal.completion, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-[9px] font-mono font-bold text-[#787774] whitespace-nowrap">{goal.completion.toFixed(0)}%</span>
                                    </div>
                                </td>
                                <td className="px-2 py-3 text-center w-8">
                                    <div className="flex justify-center">
                                        {goal.isCompleted ? (
                                            <div className="text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                                        ) : (
                                            <div className="text-blue-500 dark:text-blue-400"><Clock className="w-3.5 h-3.5" /></div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-2 py-3 text-right text-[#787774] font-mono text-[9px] hidden md:table-cell whitespace-nowrap">
                                    {goal.target_date ? format(new Date(goal.target_date), 'MM/yy') : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Custom KPI Table (Excel Sync) */}
            <div className="mt-auto bg-[#FBFBFA] dark:bg-[#080808]">
                <table className="w-full text-xs text-left border-t border-[#EAEAEA] dark:border-[#333333]">
                    <thead className="bg-[#F1F1F1] dark:bg-[#111111] text-[#111111] dark:text-[#F7F6F3]">
                        <tr>
                            <th className="px-2 py-2 font-bold text-[9px] uppercase tracking-tight w-[45%]">Custom KPI</th>
                            <th className="px-2 py-2 font-bold text-[9px] uppercase tracking-tight text-right w-[20%]">Value</th>
                            <th className="px-2 py-2 font-bold text-[9px] uppercase tracking-tight w-[35%]">Assumption</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#333333] font-sans">
                        <tr className="hover:bg-[#FBFBFA] dark:hover:bg-[#0A0A0A] transition-colors">
                            <td className="px-2 py-2 text-[#111111] dark:text-[#F7F6F3] font-medium text-[10px]">Run rate (in months)</td>
                            <td className="px-2 py-2 text-right font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px] whitespace-nowrap">{Number(runwayMonths).toLocaleString('en-US')}</td>
                            <td className="px-2 py-2 text-[9px] text-[#787774] whitespace-nowrap italic">{assumedExpenses >= 1000 ? `${(assumedExpenses / 1000).toLocaleString('en-US')}k` : assumedExpenses.toLocaleString('en-US')} expenses per month</td>
                        </tr>
                        <tr className="hover:bg-[#FBFBFA] dark:hover:bg-[#0A0A0A] transition-colors">
                            <td className="px-2 py-2 text-[#111111] dark:text-[#F7F6F3] font-medium text-[10px]">Monthly return</td>
                            <td className="px-2 py-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px] whitespace-nowrap">{Number(monthlyReturn).toLocaleString('en-US')}</td>
                            <td className="px-2 py-2 text-[9px] text-[#787774] whitespace-nowrap italic">{(assumedAnnualReturn * 100).toLocaleString('en-US')}% annual return</td>
                        </tr>
                        <tr className="hover:bg-[#FBFBFA] dark:hover:bg-[#0A0A0A] transition-colors">
                            <td className="px-2 py-2 text-[#111111] dark:text-[#F7F6F3] font-medium text-[10px]">Monthly withdrawal</td>
                            <td className="px-2 py-2 text-right font-mono font-bold text-orange-600 dark:text-orange-400 text-[11px] whitespace-nowrap">{Number(monthlyWithdrawal).toLocaleString('en-US')}</td>
                            <td className="px-2 py-2 text-[9px] text-[#787774] whitespace-nowrap italic">{(assumedWithdrawalRate * 100).toLocaleString('en-US')}% annual withdrawal rate</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </PremiumCard>
    )
}
