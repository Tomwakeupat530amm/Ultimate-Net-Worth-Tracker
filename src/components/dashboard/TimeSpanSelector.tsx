'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, subYears, parseISO, startOfMonth, eachMonthOfInterval } from 'date-fns'

interface TimeSpanSelectorProps {
    firstTrackedDate: string // YYYY-MM-DD
    latestTrackedDate: string // YYYY-MM-DD
    currentFrom: string
    currentTo: string
}

export function TimeSpanSelector({ firstTrackedDate, latestTrackedDate, currentFrom, currentTo }: TimeSpanSelectorProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Generate month options from first to latest, then reverse
    const start = parseISO(firstTrackedDate)
    const end = parseISO(latestTrackedDate)
    const months = eachMonthOfInterval({ start, end }).reverse()

    const updateParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams ? searchParams.toString() : '')
        params.set(key, value)
        router.push(`${pathname}?${params.toString()}`)
    }

    const fromOptions = [
        { label: 'All Time (Max)', value: firstTrackedDate },
        { label: 'Focus - 1 Year', value: 'focus-1y' },
        { label: 'Focus - 2 Years', value: 'focus-2y' },
        { label: 'Focus - 3 Years', value: 'focus-3y' },
        { label: 'Focus - 5 Years', value: 'focus-5y' },
        ...months.map(m => ({
            label: format(m, 'MMM yy'),
            value: format(m, 'yyyy-MM-01')
        }))
    ]

    const toOptions = [
        { label: 'Latest Month', value: latestTrackedDate },
        ...months.map(m => ({
            label: format(m, 'MMM yy'),
            value: format(m, 'yyyy-MM-01')
        }))
    ]

    // Handle relative values for 'from'
    const displayFrom = currentFrom || firstTrackedDate
    const displayTo = currentTo || latestTrackedDate

    return (
        <div className="grid grid-cols-2 text-center text-xs h-full bg-white dark:bg-[#050505]">
            <div className="flex flex-col border-r border-[#EAEAEA] dark:border-[#333333] px-0.5 justify-center overflow-hidden">
                <span className="font-semibold text-[#787774] dark:text-[#A1A1AA] mb-[1px] text-[8px] uppercase tracking-tighter shrink-0">From</span>
                <Select value={displayFrom} onValueChange={(v) => updateParams('from', v)}>
                    <SelectTrigger className="h-6 text-[9px] border-none bg-transparent hover:bg-[#F4F9F4] dark:hover:bg-[#0D211A] text-[#346538] dark:text-[#34D399] font-mono px-1 py-0 shadow-none focus:ring-0">
                        <SelectValue placeholder="From" />
                    </SelectTrigger>
                    <SelectContent>
                        {fromOptions.map((opt, i) => (
                            <SelectItem key={i} value={opt.value} className="text-[10px]">
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-col px-0.5 justify-center overflow-hidden">
                <span className="font-semibold text-[#787774] dark:text-[#A1A1AA] mb-[1px] text-[8px] uppercase tracking-tighter shrink-0">To (Focus)</span>
                <Select value={displayTo} onValueChange={(v) => updateParams('to', v)}>
                    <SelectTrigger className="h-6 text-[9px] border-none bg-transparent hover:bg-[#F4F9F4] dark:hover:bg-[#0D211A] text-[#346538] dark:text-[#34D399] font-mono px-1 py-0 shadow-none focus:ring-0">
                        <SelectValue placeholder="To" />
                    </SelectTrigger>
                    <SelectContent>
                        {toOptions.map((opt, i) => (
                            <SelectItem key={i} value={opt.value} className="text-[10px]">
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
