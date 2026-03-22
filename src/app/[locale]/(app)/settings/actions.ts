'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSettings(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized');

    const month = parseInt(formData.get('starting_month') as string, 10)
    const year = parseInt(formData.get('starting_year') as string, 10)

    const { error } = await supabase
        .from('user_settings')
        .update({ starting_month: month, starting_year: year })
        .eq('user_id', user.id)

    if (error) {
        console.error('Failed to update settings:', error)
        throw new Error(error.message);
    }

    revalidatePath('/settings', 'page')
}

export async function toggleCategory(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized');

    const categoryId = formData.get('categoryId') as string
    const isActive = formData.get('isActive') === 'true'

    const { error } = await supabase
        .from('categories')
        .update({ is_active: isActive })
        .eq('id', categoryId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Failed to toggle category:', error)
        throw new Error(error.message);
    }

    revalidatePath('/settings', 'page')
}
