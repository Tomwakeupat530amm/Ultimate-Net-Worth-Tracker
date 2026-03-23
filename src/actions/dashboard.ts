import { createClient } from '@/utils/supabase/server'
import { format, subYears, parseISO, startOfMonth } from 'date-fns'

export async function getDashboardData(providedFrom?: string, providedTo?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // 1. Parallel Fetch of Initial Metadata
    const [
        { data: settings },
        { data: firstEntry },
        { data: latestEntry },
        { data: goals }
    ] = await Promise.all([
        supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('net_worth_entries').select('month, year').eq('user_id', user.id).order('year', { ascending: true }).order('month', { ascending: true }).limit(1).maybeSingle(),
        supabase.from('net_worth_entries').select('month, year').eq('user_id', user.id).order('year', { ascending: false }).order('month', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('goals').select('*').eq('user_id', user.id).order('target_amount', { ascending: true })
    ])

    const startMonth = settings?.starting_month || 1
    const startYear = settings?.starting_year || new Date().getFullYear()
    const leverageMode = settings?.leverage_ratio_mode || 'simple'
    const lazyMode = settings?.latest_month_mode === 'lazy'

    const startYearData = firstEntry?.year || startYear
    const startMonthData = firstEntry?.month || startMonth
    const firstTrackedDate = `${startYearData}-${String(startMonthData).padStart(2, '0')}-01`

    const latestYearData = latestEntry?.year || startYearData
    const latestMonthData = latestEntry?.month || startMonthData
    const latestTrackedDate = `${latestYearData}-${String(latestMonthData).padStart(2, '0')}-01`

    // 2. Compute Active Range (Logic moved from Page for better performance)
    const activeTo = providedTo || latestTrackedDate
    let activeFrom = providedFrom || firstTrackedDate

    if (activeFrom === 'focus-1y') {
        activeFrom = format(subYears(parseISO(activeTo), 1), 'yyyy-MM-01')
    } else if (activeFrom === 'focus-2y') {
        activeFrom = format(subYears(parseISO(activeTo), 2), 'yyyy-MM-01')
    } else if (activeFrom === 'focus-3y') {
        activeFrom = format(subYears(parseISO(activeTo), 3), 'yyyy-MM-01')
    }

    // Ensure activeFrom is not earlier than firstTrackedDate if it was a default
    // (Optional, matches Excel behavior better)

    // 3. Parallel Fetch of Heavy RPCs
    const [timelineRes, detailedRes] = await Promise.all([
        supabase.rpc('get_dashboard_timeline', {
            p_start_date: activeFrom,
            p_end_date: activeTo,
            p_lazy_mode: Boolean(lazyMode)
        }),
        supabase.rpc('get_detailed_analysis', {
            p_start_date: activeFrom,
            p_end_date: activeTo,
            p_lazy_mode: Boolean(lazyMode)
        })
    ])

    if (timelineRes.error) throw new Error(`Timeline RPC Error: ${timelineRes.error.message}`)
    if (detailedRes.error) throw new Error(`Detailed Analysis RPC Error: ${detailedRes.error.message}`)

    const timelineData = timelineRes.data || []
    const detailedData = detailedRes.data || []

    // 4. Transform Data
    const monthlyData = timelineData.map((row: any) => {
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

    const assetsRaw = detailedData.filter((d: any) => d.category_type === 'asset')
    const liabRaw = detailedData.filter((d: any) => d.category_type === 'liability')

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

    // 5. KPIs Calculation
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

    const startD = new Date(activeFrom)
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
        goals: goals?.map(g => {
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
        }) || [],
        metadata: {
            firstTrackedDate: firstTrackedDate,
            latestTrackedDate: latestTrackedDate
        }
    }
}
