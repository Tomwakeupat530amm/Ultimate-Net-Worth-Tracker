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
    const displayFrom = currentFrom || firstTrackedDate || ''
    const displayTo = currentTo || latestTrackedDate || ''

    return (
        <div className="grid grid-cols-2 text-center text-xs h-full bg-white dark:bg-[#050505]">
            <div className="flex flex-col border-r border-[#EAEAEA] dark:border-[#333333] px-2 py-2 justify-center overflow-hidden hover:bg-[#FBFBFA] dark:hover:bg-[#111111] transition-colors">
                <span className="font-bold text-[#787774] dark:text-[#A1A1AA] mb-0.5 text-[9px] uppercase tracking-wider shrink-0">From</span>
                <Select value={displayFrom} onValueChange={(v) => updateParams('from', v || '')}>
                    <SelectTrigger className="h-7 text-[10px] border-none bg-transparent hover:bg-transparent text-[#111111] dark:text-[#F7F6F3] font-mono px-0 shadow-none focus:ring-0">
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
            <div className="flex flex-col px-2 py-2 justify-center overflow-hidden hover:bg-[#FBFBFA] dark:hover:bg-[#111111] transition-colors">
                <span className="font-bold text-[#787774] dark:text-[#A1A1AA] mb-0.5 text-[9px] uppercase tracking-wider shrink-0">To (Focus)</span>
                <Select value={displayTo} onValueChange={(v) => updateParams('to', v || '')}>
                    <SelectTrigger className="h-7 text-[10px] border-none bg-transparent hover:bg-transparent text-[#3B82F6] dark:text-[#60A5FA] font-mono px-0 shadow-none focus:ring-0">
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
