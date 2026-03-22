import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { updateSettings, toggleCategory } from './actions';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'Settings - Net Worth Tracker',
}

export default async function SettingsPage() {
    const t = await getTranslations('Settings');
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null; // should be caught by middleware normally

    const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('type', { ascending: true })
        .order('name', { ascending: true });

    const assets = categories?.filter(c => c.type === 'asset') || [];
    const liabilities = categories?.filter(c => c.type === 'liability') || [];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>

            {/* Starting Period */}
            <section className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <div>
                    <h2 className="text-xl font-semibold">{t('startingPeriod')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('startingPeriodDesc')}</p>
                </div>
                <form action={updateSettings} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('month')}</label>
                        <select
                            name="starting_month"
                            defaultValue={settings?.starting_month}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-zinc-700 dark:focus:ring-zinc-300"
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i + 1} value={i + 1} className="dark:bg-zinc-900">Tháng {i + 1}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('year')}</label>
                        <input
                            name="starting_year"
                            type="number"
                            defaultValue={settings?.starting_year}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-zinc-700 dark:focus:ring-zinc-300"
                        />
                    </div>
                    <div className="flex">
                        <Button type="submit" variant="default" className="w-full md:w-auto">{t('save')}</Button>
                    </div>
                </form>
            </section>

            {/* Categories */}
            <section className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <div>
                    <h2 className="text-xl font-semibold">{t('categories')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('categoriesDesc')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    {/* Assets Column */}
                    <div>
                        <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-500 mb-4">{t('assets')}</h3>
                        <ul className="space-y-4">
                            {assets.map(asset => (
                                <li key={asset.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                                    <span className="font-medium">{asset.name}</span>
                                    <form action={toggleCategory}>
                                        <input type="hidden" name="categoryId" value={asset.id} />
                                        <input type="hidden" name="isActive" value={asset.is_active ? 'false' : 'true'} />
                                        <button type="submit" className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${asset.is_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-zinc-700'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${asset.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </form>
                                </li>
                            ))}
                            {assets.length === 0 && <span className="text-gray-400 text-sm">No assets found</span>}
                        </ul>
                    </div>

                    {/* Liabilities Column */}
                    <div>
                        <h3 className="text-lg font-semibold text-rose-600 dark:text-rose-500 mb-4">{t('liabilities')}</h3>
                        <ul className="space-y-4">
                            {liabilities.map(liability => (
                                <li key={liability.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                                    <span className="font-medium">{liability.name}</span>
                                    <form action={toggleCategory}>
                                        <input type="hidden" name="categoryId" value={liability.id} />
                                        <input type="hidden" name="isActive" value={liability.is_active ? 'false' : 'true'} />
                                        <button type="submit" className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${liability.is_active ? 'bg-rose-500' : 'bg-gray-300 dark:bg-zinc-700'}`}>
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${liability.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </form>
                                </li>
                            ))}
                            {liabilities.length === 0 && <span className="text-gray-400 text-sm">No liabilities found</span>}
                        </ul>
                    </div>
                </div>
            </section>

        </div>
    )
}
