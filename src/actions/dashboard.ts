'use server'

import { createClient } from '@/utils/supabase/server'

export async function getDashboardData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // 1. Fetch settings
    const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

    const startMonth = settings?.starting_month || 1
    const startYear = settings?.starting_year || new Date().getFullYear()

    // 2. Fetch active categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)

    const assets = categories?.filter(c => c.type === 'asset') || []
    const liabilities = categories?.filter(c => c.type === 'liability') || []

    // 3. Fetch all entries
    const { data: netWorthEntries } = await supabase
        .from('net_worth_entries')
        .select('*')
        .eq('user_id', user.id)

    // 4. Calculate 12-month development
    const monthlyData = []
    let currentMonth = startMonth
    let currentYear = startYear

    for (let i = 0; i < 12; i++) {
        const monthAssets = netWorthEntries
            ?.filter(e => e.month === currentMonth && e.year === currentYear && assets.some(a => a.id === e.category_id))
            .reduce((sum, e) => sum + e.value, 0) || 0

        const monthLiabilities = netWorthEntries
            ?.filter(e => e.month === currentMonth && e.year === currentYear && liabilities.some(l => l.id === e.category_id))
            .reduce((sum, e) => sum + e.value, 0) || 0

        const netWorth = monthAssets - monthLiabilities

        monthlyData.push({
            label: `${currentMonth}/${currentYear}`,
            month: currentMonth,
            year: currentYear,
            assets: monthAssets,
            liabilities: monthLiabilities,
            netWorth
        })

        currentMonth++
        if (currentMonth > 12) {
            currentMonth = 1
            currentYear++
        }
    }

    // 5. Identify the latest month with valid data
    // We scan backwards from month 12 down to month 1
    let latestIndex = 0
    for (let i = 11; i >= 0; i--) {
        if (monthlyData[i].assets > 0 || monthlyData[i].liabilities > 0) {
            latestIndex = i
            break
        }
    }

    const currentKpi = monthlyData[latestIndex]
    const prevKpi = latestIndex > 0 ? monthlyData[latestIndex - 1] : null

    const netWorthGrowth = prevKpi && prevKpi.netWorth !== 0
        ? ((currentKpi.netWorth - prevKpi.netWorth) / Math.abs(prevKpi.netWorth)) * 100
        : 0

    const kpi = {
        totalAssets: currentKpi.assets,
        totalLiabilities: currentKpi.liabilities,
        netWorth: currentKpi.netWorth,
        netWorthGrowth: netWorthGrowth
    }

    // 6. Asset Allocation (Pie Chart) for the latest active month
    const assetAllocation = assets.map(asset => {
        const entry = netWorthEntries?.find(e => e.category_id === asset.id && e.month === currentKpi.month && e.year === currentKpi.year)
        return {
            name: asset.name,
            value: entry ? entry.value : 0
        }
    }).filter(a => a.value > 0)

    // Sort descending by value for a nicer donut chart
    assetAllocation.sort((a, b) => b.value - a.value)

    return { monthlyData, assetAllocation, kpi, latestMonthLabel: currentKpi.label }
}
