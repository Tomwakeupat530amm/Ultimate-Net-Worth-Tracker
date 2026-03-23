import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { updateSettings } from './actions';
import { Button } from '@/components/ui/button';
import { DashboardConfigForm } from './DashboardConfigForm';
import { CategoryGroupsManager } from './CategoryGroupsManager';
import { GoalsManager } from './GoalsManager';
import { CustomKpisForm } from './CustomKpisForm';
import { SettingsStaggeredWrapper } from './SettingsStaggeredWrapper';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { CalendarDays } from 'lucide-react';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = params.locale;
    const t = await getTranslations({ locale, namespace: 'Settings' });
    return {
        title: `${t('title')} - Net Worth Tracker`,
    };
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
        <div className="max-w-5xl mx-auto pb-16">
            <div className="mb-12">
                <h1 className="text-4xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">{t('title')}</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your financial tracking preferences and configurations.</p>
            </div>

            <SettingsStaggeredWrapper>
                {/* Starting Period */}
                <PremiumCard>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{t('startingPeriod')}</h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{t('startingPeriodDesc')}</p>
                        </div>
                    </div>

                    <form action={updateSettings} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 ml-1">{t('month')}</label>
                            <div className="relative group">
                                <select
                                    name="starting_month"
                                    defaultValue={settings?.starting_month}
                                    className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus:ring-zinc-100 transition-all text-zinc-900 dark:text-zinc-100 appearance-none cursor-pointer"
                                >
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 ml-1">{t('year')}</label>
                            <input
                                name="starting_year"
                                type="number"
                                defaultValue={settings?.starting_year}
                                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:focus:ring-zinc-100 transition-all text-zinc-900 dark:text-zinc-100"
                            />
                        </div>
                        <div className="flex">
                            <Button type="submit" variant="default" className="w-full md:w-auto h-11 px-8 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-full font-semibold tracking-wide transition-all shadow-lg shadow-zinc-200 dark:shadow-none active:scale-95">
                                {t('save')}
                            </Button>
                        </div>
                    </form>
                </PremiumCard>

                <DashboardConfigForm settings={settings} />

                <GoalsManager goals={goals || []} />

                <CustomKpisForm settings={settings} />

                <CategoryGroupsManager categories={categories || []} categoryGroups={categoryGroups || []} />
            </SettingsStaggeredWrapper>
        </div>
    )
}
