'use server'

import { createClient } from '@/utils/supabase/server'

export async function upsertNetWorthEntry(
    categoryId: string,
    month: number,
    year: number,
    value: number
): Promise<void> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('net_worth_entries')
        .upsert({
            user_id: user.id,
            category_id: categoryId,
            month,
            year,
            value
        }, {
            onConflict: 'user_id,category_id,month,year'
        })

    if (error) {
        console.error('Failed to upsert net worth entry:', error)
        throw new Error(error.message)
    }
}
