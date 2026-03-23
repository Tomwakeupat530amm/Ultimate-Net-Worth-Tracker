'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { updateDashboardConfig } from './actions'
import { toast } from 'sonner'
import { useState } from 'react'
import { Loader2, Settings2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { PremiumCard } from '@/components/ui/PremiumCard'

export function DashboardConfigForm({ settings }: { settings: any }) {
    const t = useTranslations('Settings')
    const [isLoading, setIsLoading] = useState(false)

    async function action(formData: FormData) {
        setIsLoading(true)
        try {
            await updateDashboardConfig(formData)
            toast.success(t('dashboardSaved'))
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <PremiumCard>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                    <Settings2 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{t('dashboardConfig')}</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{t('dashboardConfigDesc')}</p>
                </div>
            </div>

            <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 ml-1">{t('trackerMode')}</label>
                    <div className="relative group">
                        <select
                            name="latest_month_mode"
                            defaultValue={settings?.latest_month_mode || 'strict'}
                            className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus:ring-zinc-100 transition-all text-zinc-900 dark:text-zinc-100 appearance-none cursor-pointer group-hover:border-zinc-300 dark:group-hover:border-zinc-700"
                        >
                            <option value="strict">{t('strictMode')}</option>
                            <option value="lazy">{t('lazyMode')}</option>
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 ml-1">{t('leverageRatioMode')}</label>
                    <div className="relative group">
                        <select
                            name="leverage_ratio_mode"
                            defaultValue={settings?.leverage_ratio_mode || 'simple'}
                            className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus:ring-zinc-100 transition-all text-zinc-900 dark:text-zinc-100 appearance-none cursor-pointer group-hover:border-zinc-300 dark:group-hover:border-zinc-700"
                        >
                            <option value="simple">{t('simpleLeverage')}</option>
                            <option value="advanced">{t('advancedLeverage')}</option>
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900">
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
