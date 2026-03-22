'use client'

import { Button } from '@/components/ui/button'
import { updateGoal } from './actions'

export function GoalsManager({ goals }: { goals: any[] }) {

    return (
        <section className="space-y-6 bg-white dark:bg-[#050505] p-6 rounded-xl border border-[#EAEAEA] dark:border-[#333333] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div>
                <h2 className="text-xl font-semibold tracking-tight text-[#111111] dark:text-[#F7F6F3]">Standard Goals</h2>
                <p className="text-sm text-[#787774] dark:text-[#A1A1AA] mt-1">
                    Set target dates and amounts for your key milestones. (Leave date blank if undecided)
                </p>
            </div>

            <div className="flex flex-col gap-4">
                {goals.map(goal => (
                    <form key={goal.id} action={updateGoal} className="flex flex-col sm:flex-row gap-4 items-end bg-[#FBFBFA] dark:bg-[#111111] p-4 rounded-lg border border-[#EAEAEA] dark:border-[#333333]">
                        <input type="hidden" name="goal_id" value={goal.id} />
                        <div className="w-full sm:w-1/4">
                            <label className="text-xs font-semibold uppercase tracking-wider text-[#787774] dark:text-[#A1A1AA] block mb-2">Goal Name</label>
                            <input type="text" readOnly disabled value={goal.name} className="flex h-10 w-full rounded-md border-0 bg-transparent px-0 py-2 text-sm font-semibold text-[#111111] dark:text-[#F7F6F3]" />
                        </div>
                        <div className="w-full sm:w-1/4 space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-[#787774] dark:text-[#A1A1AA]">Target Amount</label>
                            <input name="target_amount" type="number" step="0.01" defaultValue={goal.target_amount} className="flex h-10 w-full rounded-md border border-[#EAEAEA] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] dark:border-[#333333] dark:bg-[#050505] dark:focus:ring-white transition-all text-[#111111] dark:text-[#F7F6F3] font-mono" />
                        </div>
                        <div className="w-full sm:w-1/4 space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-[#787774] dark:text-[#A1A1AA]">Target Date</label>
                            <input name="target_date" type="date" defaultValue={goal.target_date ? goal.target_date.split('T')[0] : ''} className="flex h-10 w-full rounded-md border border-[#EAEAEA] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] dark:border-[#333333] dark:bg-[#050505] dark:focus:ring-white transition-all text-[#111111] dark:text-[#F7F6F3] font-mono" />
                        </div>
                        <div className="w-full sm:w-auto">
                            <Button type="submit" variant="outline" className="w-full dark:border-[#333333] dark:text-[#F7F6F3] dark:hover:bg-[#1A1A1A]">Save</Button>
                        </div>
                    </form>
                ))}
                {goals.length === 0 && (
                    <div className="text-sm text-[#787774]">No standard goals found.</div>
                )}
            </div>
        </section>
    )
}
