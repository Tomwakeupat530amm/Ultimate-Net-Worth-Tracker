import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { NetWorthTable } from './NetWorthTable';

export const metadata = {
    title: 'Net Worth - Net Worth Tracker',
}

export default async function NetWorthPage() {
    const t = await getTranslations('NetWorth');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Lấy dữ liệu cấu hình tháng/năm bắt đầu
    const { data: settings } = await supabase
        .from('user_settings')
        .select('starting_month, starting_year')
        .eq('user_id', user.id)
        .single();

    const startMonth = settings?.starting_month || 1;
    const startYear = settings?.starting_year || new Date().getFullYear();

    // Lấy danh sách Categories đang bật
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name, type, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('type', { ascending: true })
        .order('name', { ascending: true });

    // Lấy số dư các tháng do người dùng nhập trước đđó
    const { data: entries } = await supabase
        .from('net_worth_entries')
        .select('category_id, month, year, value')
        .eq('user_id', user.id);

    return (
        <div className="mx-auto max-w-[100vw] space-y-6 flex flex-col items-start w-full">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('desc')}</p>
                </div>
            </div>

            <div className="w-full bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden flex-shrink-1">
                <NetWorthTable
                    initialCategories={categories || []}
                    initialEntries={entries || []}
                    startMonth={startMonth}
                    startYear={startYear}
                />
            </div>
        </div>
    )
}
