import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import { NetWorthTable } from './NetWorthTable';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerReveal';

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
        <StaggerContainer className="mx-auto max-w-[100vw] space-y-12 flex flex-col items-start w-full pb-16">
            <StaggerItem className="flex justify-between items-end w-full">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#111111] dark:text-gray-100">{t('title')}</h1>
                    <p className="text-base text-[#787774] dark:text-gray-400 max-w-[65ch]">{t('desc')}</p>
                </div>
            </StaggerItem>

            <StaggerItem className="w-full bg-[#FFFFFF] dark:bg-[#050505] rounded-xl border border-[#EAEAEA] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden flex-shrink-1">
                <NetWorthTable
                    initialCategories={categories || []}
                    initialEntries={entries || []}
                    startMonth={startMonth}
                    startYear={startYear}
                />
            </StaggerItem>
        </StaggerContainer>
    )
}
