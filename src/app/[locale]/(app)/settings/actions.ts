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

export async function updateDashboardConfig(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized');

    const latest_month_mode = formData.get('latest_month_mode') as string
    const leverage_ratio_mode = formData.get('leverage_ratio_mode') as string

    const { error } = await supabase
        .from('user_settings')
        .update({
            latest_month_mode,
            leverage_ratio_mode
        })
        .eq('user_id', user.id)

    if (error) {
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

export async function createCategoryGroup(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized');

    const name = formData.get('name') as string
    const type = formData.get('type') as 'asset' | 'liability'

    if (!name || !type) return;

    const { error } = await supabase
        .from('category_groups')
        .insert({ name, type, user_id: user.id })

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/settings', 'page')
}

export async function assignCategoryToGroup(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized');

    const categoryId = formData.get('categoryId') as string
    let groupId: string | null = formData.get('groupId') as string
    if (groupId === 'none' || !groupId) groupId = null;

    const { error } = await supabase
        .from('categories')
        .update({ group_id: groupId })
        .eq('id', categoryId)
        .eq('user_id', user.id)

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/settings', 'page')
}

export async function updateCustomKpis(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized');

    const expenses = parseFloat(formData.get('custom_kpi_expenses') as string)
    const returnRate = parseFloat(formData.get('custom_kpi_return') as string)
    const withdrawal = parseFloat(formData.get('custom_kpi_withdrawal') as string)

    // Validation
    if (isNaN(expenses) || expenses < 0) throw new Error('Expenses must be a positive number');
    if (isNaN(returnRate) || returnRate < 0 || returnRate > 1) throw new Error('Return rate must be between 0 and 1');
    if (isNaN(withdrawal) || withdrawal < 0 || withdrawal > 1) throw new Error('Withdrawal rate must be between 0 and 1');

    const { error } = await supabase
        .from('user_settings')
        .update({
            custom_kpi_expenses: expenses,
            custom_kpi_return: returnRate,
            custom_kpi_withdrawal: withdrawal
        })
        .eq('user_id', user.id)

    if (error) {
        console.error('Failed to update KPIs:', error)
        throw new Error(error.message);
    }

    revalidatePath('/settings', 'page')
    revalidatePath('/dashboard', 'page')
}

export async function updateGoal(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized');

    const goalId = formData.get('goal_id') as string
    const name = formData.get('name') as string
    const targetAmount = parseFloat(formData.get('target_amount') as string)
    const targetDateStr = formData.get('target_date') as string

    // Convert empty string to null for exact parity with Postgres Date column types
    const targetDate = targetDateStr ? targetDateStr : null

    const { error } = await supabase
        .from('goals')
        .update({
            name: name,
            target_amount: targetAmount,
            target_date: targetDate
        })
        .eq('id', goalId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Failed to update goal:', error)
        throw new Error(error.message);
    }

    revalidatePath('/settings', 'page')
    revalidatePath('/dashboard', 'page')
}

export async function createGoal(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized');

    const name = formData.get('name') as string
    const targetAmount = parseFloat(formData.get('target_amount') as string)
    const targetDateStr = formData.get('target_date') as string

    if (!name) throw new Error('Goal name is required');

    const targetDate = targetDateStr ? targetDateStr : null

    const { error } = await supabase
        .from('goals')
        .insert({
            user_id: user.id,
            name: name,
            target_amount: targetAmount,
            target_date: targetDate
        })

    if (error) {
        console.error('Failed to create goal:', error)
        throw new Error(error.message);
    }

    revalidatePath('/settings', 'page')
    revalidatePath('/dashboard', 'page')
}

export async function deleteGoal(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized');

    const goalId = formData.get('goal_id') as string

    const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Failed to delete goal:', error)
        throw new Error(error.message);
    }

    revalidatePath('/settings', 'page')
    revalidatePath('/dashboard', 'page')
}

export async function createCategory(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized');

    const name = formData.get('name') as string
    const type = formData.get('type') as 'asset' | 'liability'

    if (!name || !type) throw new Error('Name and type are required');

    const { error } = await supabase
        .from('categories')
        .insert({
            user_id: user.id,
            name,
            type,
            is_active: true
        })

    if (error) {
        console.error('Failed to create category:', error)
        throw new Error(error.message);
    }

    revalidatePath('/settings', 'page')
}

export async function deleteCategory(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized');

    const categoryId = formData.get('categoryId') as string

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Failed to delete category:', error)
        throw new Error(error.message);
    }

    revalidatePath('/settings', 'page')
}

export async function deleteCategoryGroup(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized');

    const groupId = formData.get('groupId') as string

    const { error } = await supabase
        .from('category_groups')
        .delete()
        .eq('id', groupId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Failed to delete group:', error)
        throw new Error(error.message);
    }

    revalidatePath('/settings', 'page')
}

