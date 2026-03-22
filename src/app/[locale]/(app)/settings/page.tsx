import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { updateSettings } from './actions';
import { Button } from '@/components/ui/button';
import { DashboardConfigForm } from './DashboardConfigForm';
import { CategoryGroupsManager } from './CategoryGroupsManager';
import { GoalsManager } from './GoalsManager';
import { CustomKpisForm } from './CustomKpisForm';

export const metadata = {
    title: 'Settings - Net Worth Tracker',
}

export default async function SettingsPage() {
    const t = await getTranslations('Settings');
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

    const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('target_amount', { ascending: true });

    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('type', { ascending: true })
        .order('name', { ascending: true });

    const { data: categoryGroups } = await supabase
        .from('category_groups')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })
        .order('name', { ascending: true });

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-16">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#111111] dark:text-[#F7F6F3]">{t('title')}</h1>
            </div>

            {/* Starting Period */}
            <section className="space-y-6 bg-white dark:bg-[#050505] p-6 rounded-xl border border-[#EAEAEA] dark:border-[#333333] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-[#111111] dark:text-[#F7F6F3]">{t('startingPeriod')}</h2>
                    <p className="text-sm text-[#787774] dark:text-[#A1A1AA] mt-1">{t('startingPeriodDesc')}</p>
                </div>
                <form action={updateSettings} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#787774] dark:text-[#A1A1AA]">{t('month')}</label>
                        <select
                            name="starting_month"
                            defaultValue={settings?.starting_month}
                            className="flex h-10 w-full rounded-md border border-[#EAEAEA] bg-[#FBFBFA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] dark:border-[#333333] dark:bg-[#111111] dark:focus:ring-white transition-all text-[#111111] dark:text-[#F7F6F3]"
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#787774] dark:text-[#A1A1AA]">{t('year')}</label>
                        <input
                            name="starting_year"
                            type="number"
                            defaultValue={settings?.starting_year}
                            className="flex h-10 w-full rounded-md border border-[#EAEAEA] bg-[#FBFBFA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] dark:border-[#333333] dark:bg-[#111111] dark:focus:ring-white transition-all text-[#111111] dark:text-[#F7F6F3] font-mono"
                        />
                    </div>
                    <div className="flex">
                        <Button type="submit" variant="default" className="w-full md:w-auto bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-[#333333] dark:hover:bg-[#EAEAEA] rounded font-semibold tracking-wide">
                            {t('save')}
                        </Button>
                    </div>
                </form>
            </section>

            <DashboardConfigForm settings={settings} />

            <GoalsManager goals={goals || []} />

            <CustomKpisForm settings={settings} />

            <CategoryGroupsManager categories={categories || []} categoryGroups={categoryGroups || []} />

        </div>
    )
}
