import { create } from 'zustand'
import { upsertNetWorthEntry } from '@/actions/net-worth'
import { toast } from 'sonner'

export type Category = {
    id: string
    name: string
    type: 'asset' | 'liability'
    is_active: boolean
}

export type NetWorthEntry = {
    category_id: string
    month: number
    year: number
    value: number
}

interface NetWorthState {
    categories: Category[]
    entries: NetWorthEntry[]
    isSyncing: boolean

    setInitialData: (categories: Category[], entries: NetWorthEntry[]) => void
    updateValue: (categoryId: string, month: number, year: number, value: number) => void
}

const timeoutMap: Record<string, NodeJS.Timeout> = {}

export const useNetWorthStore = create<NetWorthState>((set, get) => ({
    categories: [],
    entries: [],
    isSyncing: false,

    setInitialData: (categories, entries) => {
        set({ categories, entries })
    },

    updateValue: (categoryId, month, year, value) => {
        // 1. Optimistic update
        set((state) => {
            const existingIndex = state.entries.findIndex(
                e => e.category_id === categoryId && e.month === month && e.year === year
            )

            const newEntries = [...state.entries]
            if (existingIndex >= 0) {
                newEntries[existingIndex] = { ...newEntries[existingIndex], value }
            } else {
                newEntries.push({ category_id: categoryId, month, year, value })
            }

            return { entries: newEntries, isSyncing: true }
        })

        // 2. Debounce save per cell
        const cellKey = `${categoryId}-${month}-${year}`
        if (timeoutMap[cellKey]) {
            clearTimeout(timeoutMap[cellKey])
        }

        timeoutMap[cellKey] = setTimeout(async () => {
            try {
                await upsertNetWorthEntry(categoryId, month, year, value)

                // Ensure UI stops showing "Syncing" ONLY IF no other timeouts are pending
                // Simple heuristic: set to false, but a robust app might refcount syncs
                set({ isSyncing: false })
            } catch (error: any) {
                set({ isSyncing: false })
                toast.error(`Database Error: Could not save data.`, {
                    description: error.message || 'Please check your connection.',
                })
            }
        }, 1000) // 1 second debounce
    },
}))
