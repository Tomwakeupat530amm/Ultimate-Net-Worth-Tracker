'use server'

import { createClient } from '@/utils/supabase/server'

export async function upsertContributionEntry(
    categoryId: string,
    month: number,
    year: number,
    inflow: number,
    outflow: number
): Promise<void> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('contributions')
        .upsert({
            user_id: user.id,
            category_id: categoryId,
            month,
            year,
            inflow,
            outflow
        }, {
            onConflict: 'user_id,category_id,month,year'
        })

    if (error) {
        console.error('Failed to upsert contribution entry:', error)
        throw new Error(error.message)
    }
}
