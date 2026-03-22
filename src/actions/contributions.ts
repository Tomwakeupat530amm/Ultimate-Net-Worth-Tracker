'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addContributionTransaction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const date = formData.get('date') as string
    const amount = parseFloat(formData.get('amount') as string)
    const details = formData.get('details') as string
    const category_id = formData.get('category_id') as string

    const { data: category } = await supabase
        .from('categories')
        .select('type')
        .eq('id', category_id)
        .single()

    if (!category) throw new Error('Category not found')

    const { error } = await supabase
        .from('contribution_transactions')
        .insert({
            user_id: user.id,
            date,
            amount,
            details,
            category_id,
            type: category.type
        })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/contributions', 'page')
}

export async function deleteContributionTransaction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('contribution_transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/contributions', 'page')
}
