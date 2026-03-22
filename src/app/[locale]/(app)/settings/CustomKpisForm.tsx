'use client'

import { Button } from '@/components/ui/button'
import { updateCustomKpis } from './actions'

export function CustomKpisForm({ settings }: { settings: any }) {
    return (
        <section className="space-y-6 bg-white dark:bg-[#050505] p-6 rounded-xl border border-[#EAEAEA] dark:border-[#333333] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div>
                <h2 className="text-xl font-semibold tracking-tight text-[#111111] dark:text-[#F7F6F3]">Custom KPIs</h2>
                <p className="text-sm text-[#787774] dark:text-[#A1A1AA] mt-1">
                    Configure the assumptions used in your Goal Analysis dashboard metrics.
                </p>
            </div>
            <form action={updateCustomKpis} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#787774] dark:text-[#A1A1AA]">
                        Monthly Expenses
                    </label>
                    <input
                        name="custom_kpi_expenses"
                        type="number"
                        step="0.01"
                        defaultValue={settings?.custom_kpi_expenses ?? 3000}
                        className="flex h-10 w-full rounded-md border border-[#EAEAEA] bg-[#FBFBFA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] dark:border-[#333333] dark:bg-[#111111] dark:focus:ring-white transition-all text-[#111111] dark:text-[#F7F6F3] font-mono"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#787774] dark:text-[#A1A1AA]">
                        Annual Return Rate
                    </label>
                    <input
                        name="custom_kpi_return"
                        type="number"
                        step="0.01"
                        defaultValue={settings?.custom_kpi_return ?? 0.07}
                        className="flex h-10 w-full rounded-md border border-[#EAEAEA] bg-[#FBFBFA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] dark:border-[#333333] dark:bg-[#111111] dark:focus:ring-white transition-all text-[#111111] dark:text-[#F7F6F3] font-mono"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#787774] dark:text-[#A1A1AA]">
                        Annual Withdrawal Rate
                    </label>
                    <input
                        name="custom_kpi_withdrawal"
                        type="number"
                        step="0.01"
                        defaultValue={settings?.custom_kpi_withdrawal ?? 0.03}
                        className="flex h-10 w-full rounded-md border border-[#EAEAEA] bg-[#FBFBFA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] dark:border-[#333333] dark:bg-[#111111] dark:focus:ring-white transition-all text-[#111111] dark:text-[#F7F6F3] font-mono"
                    />
                </div>
                <div className="flex md:col-span-3 justify-end">
                    <Button type="submit" variant="default" className="w-full md:w-auto bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-[#333333] dark:hover:bg-[#EAEAEA] rounded font-semibold tracking-wide">
                        Save KPIs
                    </Button>
                </div>
            </form>
        </section>
    )
}
