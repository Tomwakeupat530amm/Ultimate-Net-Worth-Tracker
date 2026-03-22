'use server'

import { createClient } from '@/utils/supabase/server'

export async function getDashboardData(providedStartDate?: string, providedEndDate?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // 1. Fetch settings and data range
    const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

    const startMonth = settings?.starting_month || 1
    const startYear = settings?.starting_year || new Date().getFullYear()
    const leverageMode = settings?.leverage_ratio_mode || 'simple'
    const lazyMode = settings?.latest_month_mode === 'lazy'

    // Find the ACTUAL first and latest tracked months in net_worth_entries
    const { data: firstEntry } = await supabase
        .from('net_worth_entries')
        .select('month, year')
        .eq('user_id', user.id)
        .order('year', { ascending: true })
        .order('month', { ascending: true })
        .limit(1)
        .single()

    const { data: latestEntry } = await supabase
        .from('net_worth_entries')
        .select('month, year')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(1)
        .single()

    const startYearData = firstEntry?.year || startYear
    const startMonthData = firstEntry?.month || startMonth
    const firstTrackedDate = `${startYearData}-${String(startMonthData).padStart(2, '0')}-01`

    const latestYearData = latestEntry?.year || startYearData
    const latestMonthData = latestEntry?.month || startMonthData
    const latestTrackedDate = `${latestYearData}-${String(latestMonthData).padStart(2, '0')}-01`

    const startDate = providedStartDate || firstTrackedDate
    const endDate = providedEndDate || latestTrackedDate

    // 2. Fetch Timeline via RPC
    const { data: timelineData, error: timelineError } = await supabase.rpc('get_dashboard_timeline', {
        p_start_date: startDate,
        p_end_date: endDate,
        p_lazy_mode: Boolean(lazyMode)
    })

    if (timelineError) {
        console.error('RPC Error:', timelineError)
        throw new Error(`Failed to fetch timeline: ${timelineError.message || JSON.stringify(timelineError)}`)
    }

    // 3. Formulate monthlyData
    const monthlyData = (timelineData || []).map((row: any) => {
        const date = new Date(row.month_date)
        const m = date.getMonth() + 1
        const y = date.getFullYear()

        return {
            label: `Thg${m}-${String(y).slice(-2)}`,
            month: m,
            year: y,
            assets: Number(row.total_assets),
            liabilities: Number(row.total_liabilities),
            liquidAssets: Number(row.total_liquid_assets),
            netWorth: Number(row.total_assets) - Number(row.total_liabilities),
            cumulativeAssetContr: Number(row.cum_asset_contributions),
            cumulativeLiabContr: Number(row.cum_liability_contributions),
            cumulativeNwContr: Number(row.cum_asset_contributions) + Number(row.cum_liability_contributions)
        }
    })

    // 4. Fetch Detailed Analysis via RPC
    const { data: detailedData, error: detailedError } = await supabase.rpc('get_detailed_analysis', {
        p_start_date: startDate,
        p_end_date: endDate,
        p_lazy_mode: Boolean(lazyMode)
    })

    if (detailedError) {
        console.error('Detailed RPC Error:', detailedError)
        throw new Error(`Failed to fetch detailed analysis: ${detailedError.message || JSON.stringify(detailedError)}`)
    }

    const assetsRaw = detailedData?.filter((d: any) => d.category_type === 'asset') || []
    const liabRaw = detailedData?.filter((d: any) => d.category_type === 'liability') || []

    const formatDetails = (rawList: any[]) => {
        let totalVal = 0
        let totalStartVal = 0
        let totalContr = 0
        let totalGain = 0

        const items = rawList.map((d: any) => {
            const currentV = Number(d.current_value)
            totalVal += currentV
            totalStartVal += Number(d.start_value)
            totalContr += Number(d.total_contributions)
            totalGain += Number(d.gain_or_cost)

            return {
                id: d.category_id,
                name: d.category_name,
                type: d.category_type,
                currentValue: currentV,
                startValue: Number(d.start_value),
                contributions: Number(d.total_contributions),
                gain: Number(d.gain_or_cost),
                percentage: 0
            }
        })

        items.forEach(i => {
            i.percentage = totalVal > 0 ? (i.currentValue / totalVal) * 100 : 0
        })

        return {
            items,
            totalValue: totalVal,
            totalStartValue: totalStartVal,
            totalContributions: totalContr,
            totalGain: totalGain
        }
    }

    const detailedAssets = formatDetails(assetsRaw)
    const detailedLiabilities = formatDetails(liabRaw)

    const assetAllocation = detailedAssets.items.filter(a => a.currentValue > 0).map(a => ({
        name: a.name, value: a.currentValue, percentage: a.percentage
    }))
    const liabilityAllocation = detailedLiabilities.items.filter(l => l.currentValue > 0).map(l => ({
        name: l.name, value: l.currentValue, percentage: l.percentage
    }))

    // 5. KPIs
    let latestIndex = 0
    for (let i = monthlyData.length - 1; i >= 0; i--) {
        if (monthlyData[i].assets > 0 || monthlyData[i].liabilities > 0) {
            latestIndex = i
            break
        }
    }

    const currentKpi = monthlyData[latestIndex] || monthlyData[0] || { assets: 0, liabilities: 0, netWorth: 0, liquidAssets: 0, cumulativeNwContr: 0, label: '' }
    const firstKpi = monthlyData[0] || { netWorth: 0, label: '' }

    const netWorthGrowth = firstKpi.netWorth !== 0
        ? ((currentKpi.netWorth - firstKpi.netWorth) / Math.abs(firstKpi.netWorth)) * 100
        : 0

    const startD = new Date(startDate)
    let currentD = new Date()
    if (currentKpi && currentKpi.year) {
        currentD = new Date(currentKpi.year, currentKpi.month - 1, 1)
    }
    const diffTime = Math.abs(currentD.getTime() - startD.getTime())
    const diffYears = Math.max(0.1, diffTime / (1000 * 60 * 60 * 24 * 365.25))

    const netDebt = Math.max(0, currentKpi.liabilities - currentKpi.liquidAssets)
    let leverageRatio = 0
    if (leverageMode === 'advanced') {
        const netAssets = Math.max(1, currentKpi.assets - currentKpi.liquidAssets)
        leverageRatio = (currentKpi.liabilities / netAssets) * 100
    } else {
        const totalAssets = Math.max(1, currentKpi.assets)
        leverageRatio = (currentKpi.liabilities / totalAssets) * 100
    }

    let roi = 0
    if (firstKpi.netWorth > 0) {
        const gain = currentKpi.netWorth - firstKpi.netWorth - currentKpi.cumulativeNwContr
        roi = (gain / firstKpi.netWorth) * 100
    }

    const kpi = {
        totalAssets: currentKpi.assets,
        totalLiabilities: currentKpi.liabilities,
        netWorth: currentKpi.netWorth,
        netWorthGrowth: netWorthGrowth,
        netDebt: netDebt,
        leverageRatio: leverageRatio,
        roi: roi,
        growthAmount: currentKpi.netWorth - firstKpi.netWorth,
        growthYears: diffYears.toFixed(1),
        latestMonthLabel: currentKpi.label,
        firstMonthLabel: firstKpi.label
    }

    // 6. Fetch Goals
    const { data: goals } = await supabase.from('goals').select('*').eq('user_id', user.id)
    const userGoals = goals || []
    const processedGoals = userGoals.map(g => {
        const completionRaw = (kpi.netWorth / g.target_amount) * 100
        const completion = Math.min(100, Math.max(0, completionRaw))
        return {
            id: g.id,
            name: g.name,
            target_amount: g.target_amount,
            target_date: g.target_date,
            completion: completion,
            isCompleted: completion >= 100
        }
    })

    return {
        settings,
        monthlyData,
        kpi,
        assetAllocation,
        liabilityAllocation,
        detailedAnalysis: {
            assets: detailedAssets,
            liabilities: detailedLiabilities
        },
        goals: processedGoals,
        metadata: {
            firstTrackedDate: firstTrackedDate,
            latestTrackedDate: latestTrackedDate
        }
    }
}
