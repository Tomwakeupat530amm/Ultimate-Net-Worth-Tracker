'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { updateDashboardConfig } from './actions'
import { toast } from 'sonner'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export function DashboardConfigForm({ settings }: { settings: any }) {
    const t = useTranslations('Settings')
    const [isLoading, setIsLoading] = useState(false)

    async function action(formData: FormData) {
        setIsLoading(true)
        try {
            await updateDashboardConfig(formData)
            toast.success('Dashboard settings saved')
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className="space-y-6 bg-white dark:bg-[#050505] p-6 rounded-xl border border-[#EAEAEA] dark:border-[#333333] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div>
                <h2 className="text-xl font-semibold tracking-tight text-[#111111] dark:text-[#F7F6F3]">Dashboard Configuration</h2>
                <p className="text-sm text-[#787774] dark:text-[#A1A1AA] mt-1">Advanced settings for visualizing your Net Worth.</p>
            </div>
            <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#787774] dark:text-[#A1A1AA]">Tracker Mode</label>
                    <select
                        name="latest_month_mode"
                        defaultValue={settings?.latest_month_mode || 'strict'}
                        className="flex h-10 w-full rounded-md border border-[#EAEAEA] bg-[#FBFBFA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] dark:border-[#333333] dark:bg-[#111111] dark:focus:ring-white transition-all text-[#111111] dark:text-[#F7F6F3]"
                    >
                        <option value="strict">Strict (Require all previous months)</option>
                        <option value="lazy">Lazy (Last entered month)</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#787774] dark:text-[#A1A1AA]">Leverage Ratio Mode</label>
                    <select
                        name="leverage_ratio_mode"
                        defaultValue={settings?.leverage_ratio_mode || 'simple'}
                        className="flex h-10 w-full rounded-md border border-[#EAEAEA] bg-[#FBFBFA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] dark:border-[#333333] dark:bg-[#111111] dark:focus:ring-white transition-all text-[#111111] dark:text-[#F7F6F3]"
                    >
                        <option value="simple">Simple (Total Liab. / Total Assets)</option>
                        <option value="advanced">Advanced (Excludes Cash)</option>
                    </select>
                </div>
                <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" variant="default" disabled={isLoading} className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-[#333333] dark:hover:bg-[#EAEAEA] rounded font-semibold tracking-wide">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('save')}
                    </Button>
                </div>
            </form>
        </section>
    )
}
