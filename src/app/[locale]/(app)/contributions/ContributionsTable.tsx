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

    const [selectedType, setSelectedType] = useState<'asset' | 'liability'>('asset')

    const filteredCategories = initialCategories.filter(c => c.type === selectedType)

    const handleAdd = (formData: FormData) => {
        startTransition(async () => {
            try {
                // Ensure the type is preserved if needed, though server action derives it
                await addContributionTransaction(formData)
                toast.success(t('transactionSaved'))
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
                toast.success(t('transactionDeleted'))
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
                <PremiumCard className="p-6 sticky top-24 border-zinc-100 dark:border-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-none">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-900 dark:text-zinc-100 mb-6">{t('newTransaction')}</h3>

                    <form action={handleAdd} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 ml-1">{t('date')}</label>
                            <input
                                name="date"
                                type="date"
                                required
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus:ring-zinc-100 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                            />
                        </div>

                        {/* Type Selector */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 ml-1">{t('type')}</label>
                            <div className="grid grid-cols-2 gap-2 bg-zinc-50/50 dark:bg-zinc-900/50 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setSelectedType('asset')}
                                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${selectedType === 'asset'
                                        ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                                        }`}
                                >
                                    {t('asset')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedType('liability')}
                                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${selectedType === 'liability'
                                        ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-sm'
                                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                                        }`}
                                >
                                    {t('liability')}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 ml-1">{t('categoryPosition')}</label>
                            <select
                                name="category_id"
                                required
                                key={selectedType} // Reset select when type changes
                                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus:ring-zinc-100 transition-all text-zinc-900 dark:text-zinc-100 appearance-none cursor-pointer"
                            >
                                {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 ml-1">{t('amount')}</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm">$</span>
                                <input
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                    className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus:ring-zinc-100 transition-all text-zinc-900 dark:text-zinc-100 font-mono"
                                />
                            </div>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed mt-1.5 ml-1 italic">
                                {t('positiveDesc')}<br />
                                {t('negativeDesc')}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 ml-1">{t('detailsNote')}</label>
                            <input
                                name="details"
                                type="text"
                                placeholder={t('placeholderDetails')}
                                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus:ring-zinc-100 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                            />
                        </div>

                        <Button type="submit" disabled={isPending} className="w-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-full font-bold tracking-wide h-11 mt-4 transition-all shadow-lg shadow-zinc-200 dark:shadow-none active:scale-[0.98]">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('recordTransaction')}
                        </Button>
                    </form>
                </PremiumCard>
            </div>

            {/* List */}
            <div className="w-full lg:w-2/3 h-fit border border-zinc-100 dark:border-zinc-900 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-xl shadow-zinc-200/40 dark:shadow-none">
                {initialEntries.length === 0 ? (
                    <div className="p-12 text-center text-zinc-400 font-medium text-sm italic">
                        {t('noTransactions')}
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse min-w-[600px]">
                            <thead className="bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-md text-zinc-400 dark:text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                                <tr>
                                    <th className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 font-bold">{t('date')}</th>
                                    <th className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 font-bold">{t('position')}</th>
                                    <th className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 font-bold">{t('details')}</th>
                                    <th className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 font-bold text-right">{t('amount')}</th>
                                    <th className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 font-bold text-right w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
                                {initialEntries.map(entry => {
                                    const isPositive = entry.amount > 0

                                    return (
                                        <tr key={entry.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-zinc-400 dark:text-zinc-500 font-mono text-xs">
                                                {entry.date}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                                                {entry.categories?.name}
                                                <span className={`ml-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${entry.type === 'asset' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'}`}>
                                                    {entry.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 italic text-xs">
                                                {entry.details || <span className="opacity-30">-</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono tabular-nums">
                                                <div className={`flex items-center justify-end gap-1.5 font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                                    {Math.abs(entry.amount).toLocaleString('en-US')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm(t('confirmDelete'))) {
                                                            handleDelete(entry.id)
                                                        }
                                                    }}
                                                    disabled={loadingId === entry.id}
                                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full"
                                                >
                                                    {loadingId === entry.id ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : <Trash2 className="w-3.5 h-3.5" />}
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
