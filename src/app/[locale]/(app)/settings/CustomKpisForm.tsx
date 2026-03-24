'use client'

import { Button } from '@/components/ui/button'
import { updateCustomKpis } from './actions'
import { PremiumCard } from '@/components/ui/PremiumCard'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Calculator, Wallet, TrendingUp, Landmark } from 'lucide-react'
import { motion } from 'framer-motion'

export function CustomKpisForm({ settings }: { settings: any }) {
    const t = useTranslations('Settings')
    const [isLoading, setIsLoading] = useState(false)

    async function action(formData: FormData) {
        setIsLoading(true)
        try {
            await updateCustomKpis(formData)
            toast.success(t('kpiUpdated'))
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <PremiumCard>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                    <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{t('customKpis')}</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{t('customKpisDesc')}</p>
                </div>
            </div>

            <form action={action} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2.5">
                    <div className="flex items-center gap-2 ml-1">
                        <Wallet className="w-3.5 h-3.5 text-zinc-400" />
                        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                            {t('monthlyExpenses')}
                        </label>
                    </div>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm leading-none">$</span>
                        <input
                            name="custom_kpi_expenses"
                            type="number"
                            step="0.01"
                            defaultValue={settings?.custom_kpi_expenses ?? 3000}
                            className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-8 pr-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus:ring-zinc-100 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300"
                        />
                    </div>
                </div>

                <div className="space-y-2.5">
                    <div className="flex items-center gap-2 ml-1">
                        <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                            {t('annualReturn')}
                        </label>
                    </div>
                    <div className="relative">
                        <input
                            name="custom_kpi_return"
                            type="number"
                            step="0.01"
                            defaultValue={(settings?.custom_kpi_return ?? 0.07) * 100}
                            placeholder="7.00"
                            className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus:ring-zinc-100 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm leading-none">%</span>
                    </div>
                </div>

                <div className="space-y-2.5">
                    <div className="flex items-center gap-2 ml-1">
                        <Landmark className="w-3.5 h-3.5 text-zinc-400" />
                        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
                            {t('annualWithdrawal')}
                        </label>
                    </div>
                    <div className="relative">
                        <input
                            name="custom_kpi_withdrawal"
                            type="number"
                            step="0.01"
                            defaultValue={(settings?.custom_kpi_withdrawal ?? 0.03) * 100}
                            placeholder="3.00"
                            className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus:ring-zinc-100 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm leading-none">%</span>
                    </div>
                </div>

                <div className="flex md:col-span-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900">
                    <motion.div whileTap={{ scale: 0.96 }}>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-11 px-8 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-full font-semibold tracking-wide transition-all shadow-lg shadow-zinc-200 dark:shadow-none"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {t('save')}
                        </Button>
                    </motion.div>
                </div>
            </form>
        </PremiumCard>
    )
}
