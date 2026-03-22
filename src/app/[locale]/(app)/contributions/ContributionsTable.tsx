'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { addContributionTransaction, deleteContributionTransaction } from '@/actions/contributions'
import { toast } from 'sonner'
import { useState, useTransition } from 'react'
import { Loader2, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { PremiumCard } from '@/components/ui/PremiumCard'

export function ContributionsTable({
    initialCategories,
    initialEntries,
}: {
    initialCategories: any[],
    initialEntries: any[],
}) {
    const t = useTranslations('Contributions')
    const [isPending, startTransition] = useTransition()
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const assets = initialCategories.filter(c => c.type === 'asset')
    const liabilities = initialCategories.filter(c => c.type === 'liability')

    const handleAdd = (formData: FormData) => {
        startTransition(async () => {
            try {
                await addContributionTransaction(formData)
                toast.success('Transaction saved to ledger')
            } catch (e: any) {
                toast.error(e.message)
            }
        })
    }

    const handleDelete = (id: string) => {
        setLoadingId(id)
        startTransition(async () => {
            try {
                await deleteContributionTransaction(id)
                toast.success('Transaction removed')
            } catch (e: any) {
                toast.error(e.message)
            } finally {
                setLoadingId(null)
            }
        })
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 w-full">
            {/* Form */}
            <div className="w-full lg:w-1/3 shrink-0">
                <PremiumCard className="p-6 sticky top-24">
                    <h3 className="text-sm uppercase tracking-widest font-semibold text-[#111111] dark:text-[#F7F6F3] mb-6">New Transaction</h3>

                    <form action={handleAdd} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-[#787774] dark:text-[#A1A1AA]">Date</label>
                            <input
                                name="date"
                                type="date"
                                required
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="flex h-10 w-full rounded border border-[#EAEAEA] bg-[#FBFBFA] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#111111] dark:border-[#333333] dark:bg-[#111111] dark:focus:ring-white transition-all text-[#111111] dark:text-[#F7F6F3]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-[#787774] dark:text-[#A1A1AA]">Category / Position</label>
                            <select
                                name="category_id"
                                required
                                className="flex h-10 w-full rounded border border-[#EAEAEA] bg-[#FBFBFA] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#111111] dark:border-[#333333] dark:bg-[#111111] dark:focus:ring-white transition-all text-[#111111] dark:text-[#F7F6F3]"
                            >
                                <optgroup label="Assets">
                                    {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </optgroup>
                                <optgroup label="Liabilities">
                                    {liabilities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </optgroup>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-[#787774] dark:text-[#A1A1AA]">Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#787774] font-mono">$</span>
                                <input
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                    className="flex h-10 w-full rounded border border-[#EAEAEA] bg-[#FBFBFA] pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#111111] dark:border-[#333333] dark:bg-[#111111] dark:focus:ring-white transition-all text-[#111111] dark:text-[#F7F6F3] font-mono"
                                />
                            </div>
                            <p className="text-[11px] text-[#787774] leading-relaxed mt-1">
                                Positive (In-flow) increases Net Worth.<br />
                                Negative (Out-flow) decreases Net Worth.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-[#787774] dark:text-[#A1A1AA]">Details / Note (Optional)</label>
                            <input
                                name="details"
                                type="text"
                                placeholder="e.g. Monthly Salary, Index Fund Buy"
                                className="flex h-10 w-full rounded border border-[#EAEAEA] bg-[#FBFBFA] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#111111] dark:border-[#333333] dark:bg-[#111111] dark:focus:ring-white transition-all text-[#111111] dark:text-[#F7F6F3]"
                            />
                        </div>

                        <Button type="submit" disabled={isPending} className="w-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-[#333333] dark:hover:bg-[#EAEAEA] rounded font-semibold tracking-wide h-10 mt-4">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Record Transaction
                        </Button>
                    </form>
                </PremiumCard>
            </div>

            {/* List */}
            <div className="w-full lg:w-2/3 h-fit border border-[#EAEAEA] dark:border-[#333333] rounded-xl overflow-hidden bg-white dark:bg-[#050505] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                {initialEntries.length === 0 ? (
                    <div className="p-12 text-center text-[#787774] font-mono text-sm border-b border-[#EAEAEA] dark:border-[#333333]">
                        No transactions recorded yet.
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse min-w-[600px]">
                            <thead className="bg-[#FBFBFA] dark:bg-[#111111] text-[#787774] dark:text-[#A1A1AA] font-semibold uppercase text-[10px] tracking-widest">
                                <tr>
                                    <th className="px-6 py-4 border-b border-[#EAEAEA] dark:border-[#333333]">Date</th>
                                    <th className="px-6 py-4 border-b border-[#EAEAEA] dark:border-[#333333]">Position</th>
                                    <th className="px-6 py-4 border-b border-[#EAEAEA] dark:border-[#333333]">Details</th>
                                    <th className="px-6 py-4 border-b border-[#EAEAEA] dark:border-[#333333] text-right">Amount</th>
                                    <th className="px-6 py-4 border-b border-[#EAEAEA] dark:border-[#333333] text-right w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#333333]">
                                {initialEntries.map(entry => {
                                    const isPositive = entry.amount > 0

                                    return (
                                        <tr key={entry.id} className="hover:bg-[#FBFBFA] dark:hover:bg-[#111111] transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-[#787774] dark:text-[#A1A1AA] font-mono text-xs">
                                                {entry.date}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-[#111111] dark:text-[#F7F6F3]">
                                                {entry.categories?.name}
                                                <span className="ml-2 text-[10px] uppercase px-1.5 py-0.5 rounded-full bg-[#EAEAEA] dark:bg-[#333333] text-[#787774] dark:text-[#A1A1AA]">
                                                    {entry.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[#787774] dark:text-[#A1A1AA]">
                                                {entry.details || <span className="opacity-50">-</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono tabular-nums">
                                                <div className={`flex items-center justify-end gap-1.5 ${isPositive ? 'text-[#346538] dark:text-[#34D399]' : 'text-[#9F2F2D] dark:text-[#FB7185]'}`}>
                                                    {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                                    {Math.abs(entry.amount).toLocaleString('en-US')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(entry.id)}
                                                    disabled={loadingId === entry.id}
                                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                                >
                                                    {loadingId === entry.id ? <Loader2 className="w-4 h-4 animate-spin text-[#787774]" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
