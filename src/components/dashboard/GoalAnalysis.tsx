'use client'

import { PremiumCard } from '@/components/ui/PremiumCard'
import { Check } from 'lucide-react'
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
                <span>Goal Analysis</span>
            </div>

            <div className="overflow-x-auto border-b border-[#EAEAEA] dark:border-[#333333]">
                <table className="w-full text-xs text-left">
                    <thead className="bg-[#FBFBFA] dark:bg-[#111111] text-[#787774] border-b border-[#EAEAEA] dark:border-[#333333]">
                        <tr>
                            <th className="px-4 py-2 font-semibold">Goal Name</th>
                            <th className="px-4 py-2 font-semibold text-right">Amount</th>
                            <th className="px-4 py-2 font-semibold text-center">Completion</th>
                            <th className="px-4 py-2 font-semibold text-center">Done?</th>
                            <th className="px-4 py-2 font-semibold text-right">Target Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#333333] font-mono">
                        {goals.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-4 text-center text-[#787774] font-sans">No goals set in Settings.</td></tr>
                        ) : goals.map((goal: any) => (
                            <tr key={goal.id} className="hover:bg-[#FBFBFA] dark:hover:bg-[#1A1A1A] transition-colors">
                                <td className={`px-4 py-2 font-sans font-medium hover:underline cursor-pointer ${goal.isCompleted ? 'text-[#346538] dark:text-[#34D399]' : 'text-[#111111] dark:text-[#F7F6F3]'}`}>
                                    {goal.name} {goal.isCompleted && '✓'}
                                </td>
                                <td className="px-4 py-2 text-right">{goal.target_amount.toLocaleString('en-US')}</td>
                                <td className="px-4 py-2 text-center text-[#787774]">
                                    <div className="flex items-center gap-2 justify-end">
                                        <div className="w-16 h-1.5 bg-[#EAEAEA] dark:bg-[#333333] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#1F6C9F] dark:bg-[#60A5FA]" style={{ width: `${goal.completion}%` }}></div>
                                        </div>
                                        <span className="w-8">{goal.completion.toFixed(0)}%</span>
                                    </div>
                                </td>
                                <td className="px-4 py-2 text-center text-[#346538] dark:text-[#34D399]">
                                    {goal.isCompleted ? 'x' : ''}
                                </td>
                                <td className="px-4 py-2 text-right text-[#787774]">
                                    {goal.target_date ? format(new Date(goal.target_date), 'dd-MMM-yy') : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Custom KPI Table */}
            <div className="overflow-x-auto mt-auto">
                <table className="w-full text-xs text-left mt-4 border-t border-[#EAEAEA] dark:border-[#333333]">
                    <thead className="bg-[#FBFBFA] dark:bg-[#111111] text-[#787774] border-b border-[#EAEAEA] dark:border-[#333333]">
                        <tr>
                            <th className="px-4 py-2 font-semibold">Custom KPI</th>
                            <th className="px-4 py-2 font-semibold text-right">Value</th>
                            <th className="px-4 py-2 font-semibold border-l border-[#EAEAEA] dark:border-[#333333]">Assumption</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#333333] font-mono">
                        <tr className="hover:bg-[#FBFBFA] dark:hover:bg-[#1A1A1A]">
                            <td className="px-4 py-2 font-sans text-[#111111] dark:text-[#F7F6F3]">Run rate (in months)</td>
                            <td className="px-4 py-2 text-right">{Number(runwayMonths).toLocaleString('en-US')}</td>
                            <td className="px-4 py-2 text-[#787774] font-sans border-l border-[#EAEAEA] dark:border-[#333333]">{assumedExpenses.toLocaleString('en-US')} expenses per month</td>
                        </tr>
                        <tr className="hover:bg-[#FBFBFA] dark:hover:bg-[#1A1A1A]">
                            <td className="px-4 py-2 font-sans text-[#111111] dark:text-[#F7F6F3]">Monthly return</td>
                            <td className="px-4 py-2 text-right">{Number(monthlyReturn).toLocaleString('en-US')}</td>
                            <td className="px-4 py-2 text-[#787774] font-sans border-l border-[#EAEAEA] dark:border-[#333333]">{(assumedAnnualReturn * 100).toFixed(0)}% annual return</td>
                        </tr>
                        <tr className="hover:bg-[#FBFBFA] dark:hover:bg-[#1A1A1A]">
                            <td className="px-4 py-2 font-sans text-[#111111] dark:text-[#F7F6F3]">Monthly withdrawal</td>
                            <td className="px-4 py-2 text-right">{Number(monthlyWithdrawal).toLocaleString('en-US')}</td>
                            <td className="px-4 py-2 text-[#787774] font-sans border-l border-[#EAEAEA] dark:border-[#333333]">{(assumedWithdrawalRate * 100).toFixed(0)}% annual withdrawal rate</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </PremiumCard>
    )
}
