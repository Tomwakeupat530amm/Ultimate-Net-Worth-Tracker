import { create } from 'zustand'
import { upsertContributionEntry } from '@/actions/contributions'
import { toast } from 'sonner'
import { Category } from './netWorthStore'

export type ContributionEntry = {
    category_id: string
    month: number
    year: number
    inflow: number
    outflow: number
}

interface ContributionsState {
    categories: Category[]
    entries: ContributionEntry[]
    isSyncing: boolean

    setInitialData: (categories: Category[], entries: ContributionEntry[]) => void
    updateValue: (categoryId: string, month: number, year: number, type: 'inflow' | 'outflow', value: number) => void
}

const timeoutMap: Record<string, NodeJS.Timeout> = {}

export const useContributionsStore = create<ContributionsState>((set, get) => ({
    categories: [],
    entries: [],
    isSyncing: false,

    setInitialData: (categories, entries) => {
        set({ categories, entries })
    },

    updateValue: (categoryId, month, year, type, value) => {
        set((state) => {
            const existingIndex = state.entries.findIndex(
                e => e.category_id === categoryId && e.month === month && e.year === year
            )

            const newEntries = [...state.entries]
            let currentInflow = 0
            let currentOutflow = 0

            if (existingIndex >= 0) {
                currentInflow = newEntries[existingIndex].inflow
                currentOutflow = newEntries[existingIndex].outflow

                if (type === 'inflow') currentInflow = value
                else currentOutflow = value

                newEntries[existingIndex] = { ...newEntries[existingIndex], inflow: currentInflow, outflow: currentOutflow }
            } else {
                if (type === 'inflow') currentInflow = value
                else currentOutflow = value

                newEntries.push({ category_id: categoryId, month, year, inflow: currentInflow, outflow: currentOutflow })
            }

            const cellKey = `${categoryId}-${month}-${year}`
            if (timeoutMap[cellKey]) clearTimeout(timeoutMap[cellKey])

            timeoutMap[cellKey] = setTimeout(async () => {
                try {
                    await upsertContributionEntry(categoryId, month, year, currentInflow, currentOutflow)
                    set({ isSyncing: false })
                } catch (error: any) {
                    set({ isSyncing: false })
                    toast.error(`Database Error: Could not save contributions.`, {
                        description: error.message || 'Please check your connection.',
                    })
                }
            }, 1000)

            return { entries: newEntries, isSyncing: true }
        })
    },
}))
