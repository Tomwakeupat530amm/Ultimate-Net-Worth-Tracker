'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { updateGoal, createGoal, deleteGoal } from './actions'
import { toast } from 'sonner'
import { useState } from 'react'
import { Plus, Trash2, Save, Target, Calendar, Check, CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PremiumCard } from '@/components/ui/PremiumCard'

export function GoalsManager({ goals }: { goals: any[] }) {
    const t = useTranslations('Settings')
    const [isAdding, setIsAdding] = useState(false)

    return (
        <PremiumCard className="overflow-visible !p-0">
            <div className="p-6 md:p-8 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-500" />
                        {t('standardGoals')}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t('standardGoalsDesc')}</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAdding(!isAdding)}
                    className="h-9 gap-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all active:scale-95 rounded-full px-4"
                >
                    <Plus className={`w-4 h-4 transition-transform duration-300 ${isAdding ? 'rotate-45' : ''}`} />
                    {isAdding ? t('cancel') : t('addGoal')}
                </Button>
            </div>

            <div className="p-2 md:p-4 space-y-1">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 dark:text-zinc-600 mb-2">
                    <div className="col-span-12 md:col-span-4">{t('goalName')}</div>
                    <div className="hidden md:block md:col-span-3 text-right pr-4">{t('targetAmount')}</div>
                    <div className="hidden md:block md:col-span-3">{t('targetDate')}</div>
                    <div className="hidden md:block md:col-span-2 text-right">{t('actions')}</div>
                </div>

                <AnimatePresence mode="popLayout">
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="overflow-hidden"
                        >
                            <form action={async (fd) => {
                                try {
                                    await createGoal(fd)
                                    toast.success(t('goalCreated'))
                                    setIsAdding(false)
                                } catch (e: any) {
                                    toast.error(e.message)
                                }
                            }} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-emerald-50/30 dark:bg-emerald-950/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 mb-4 ring-1 ring-emerald-500/20">
                                <div className="md:col-span-4">
                                    <input name="name" placeholder={t('placeholderGoal')} required className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium placeholder:zinc-400 text-zinc-900 dark:text-zinc-100" autoFocus />
                                </div>
                                <div className="md:col-span-3 flex items-center gap-2 md:justify-end md:pr-4">
                                    <span className="text-zinc-400 font-mono text-xs">$</span>
                                    <input name="target_amount" type="number" step="0.01" placeholder="0" required className="bg-transparent border-none focus:ring-0 text-sm w-48 font-mono placeholder:zinc-400 text-zinc-900 dark:text-zinc-100 text-right" />
                                </div>
                                <div className="md:col-span-3">
                                    <input name="target_date" type="date" className="bg-transparent border-none focus:ring-0 text-xs w-full text-zinc-500" />
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                    <Button type="submit" size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform">
                                        {t('create')}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {goals.map((goal, index) => (
                        <GoalRow key={goal.id} goal={goal} index={index} />
                    ))}

                    {goals.length === 0 && !isAdding && (
                        <div className="text-sm text-zinc-400 text-center py-12 bg-zinc-50/50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                            {t('noGoals')}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </PremiumCard>
    )
}

function GoalRow({ goal, index }: { goal: any, index: number }) {
    const t = useTranslations('Settings')
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Auto-save logic
    const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const form = e.currentTarget.form
        if (!form) return

        // Compare current value with defaultValue to avoid redundant saves
        if (e.target.value === e.target.defaultValue) return

        // Update the defaultValue so subsequent blurs without changes don't trigger
        e.target.defaultValue = e.target.value

        form.requestSubmit()
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 } }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-lg transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800"
        >
            <div className="md:col-span-4">
                <form id={`form-${goal.id}`} action={async (fd) => {
                    setIsSaving(true)
                    try {
                        await updateGoal(fd)
                        toast.success(t('changesSaved'), {
                            description: `${fd.get('name')} updated successfully.`,
                            duration: 2000
                        })
                    } catch (e: any) {
                        toast.error(e.message)
                    } finally {
                        setIsSaving(false)
                    }
                }}>
                    <input type="hidden" name="goal_id" value={goal.id} />
                    <input
                        name="name"
                        defaultValue={goal.name}
                        onBlur={handleBlur}
                        autoComplete="off"
                        className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                    />
                </form>
            </div>

            <div className="md:col-span-3 flex items-center gap-2 md:justify-end md:pr-4">
                <span className="text-zinc-400 font-mono text-xs">$</span>
                <input
                    form={`form-${goal.id}`}
                    name="target_amount"
                    type="number"
                    step="0.01"
                    defaultValue={goal.target_amount}
                    onBlur={handleBlur}
                    className="bg-transparent border-none focus:ring-0 text-sm w-48 font-mono text-zinc-600 dark:text-zinc-400 text-right"
                />
            </div>

            <div className="md:col-span-3">
                <div className="relative">
                    <Calendar className={`absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-all ${isSaving ? 'text-emerald-500 animate-pulse' : 'text-zinc-300 opacity-40 group-hover:opacity-100'}`} />
                    <input
                        form={`form-${goal.id}`}
                        name="target_date"
                        type="date"
                        defaultValue={goal.target_date ? goal.target_date.split('T')[0] : ''}
                        onBlur={handleBlur}
                        onChange={(e) => {
                            if (e.target.value !== e.target.defaultValue) {
                                e.target.defaultValue = e.target.value
                                e.currentTarget.form?.requestSubmit()
                            }
                        }}
                        className="bg-transparent border-none focus:ring-0 text-xs w-full text-zinc-500 pl-6 cursor-pointer"
                    />
                </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                <button
                    form={`form-${goal.id}`}
                    type="submit"
                    disabled={isSaving}
                    className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-full transition-all active:scale-95"
                    title={t('save')}
                >
                    {isSaving ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" /> : <Save className="w-4 h-4" />}
                </button>
                <button
                    onClick={async () => {
                        if (confirm(t('confirmDeleteGoal'))) {
                            setIsDeleting(true)
                            try {
                                const fd = new FormData()
                                fd.append('goal_id', goal.id)
                                await deleteGoal(fd)
                                toast.success(t('goalDeleted'))
                            } catch (e: any) {
                                toast.error(e.message)
                                setIsDeleting(false)
                            }
                        }
                    }}
                    disabled={isDeleting}
                    className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full transition-all active:scale-95"
                    title={t('delete')}
                >
                    {isDeleting ? <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent animate-spin rounded-full" /> : <Trash2 className="w-4 h-4" />}
                </button>
            </div>
        </motion.div>
    )
}
