'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { createCategoryGroup, assignCategoryToGroup, toggleCategory, createCategory, deleteCategory, deleteCategoryGroup } from './actions'
import { toast } from 'sonner'
import { useState } from 'react'
import { Layers, Plus, ChevronRight, FolderPlus, Tag, Settings2, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PremiumCard } from '@/components/ui/PremiumCard'

export function CategoryGroupsManager({ categories, categoryGroups }: { categories: any[], categoryGroups: any[] }) {
    const t = useTranslations('Settings')
    const [isCreatingAssetGroup, setIsCreatingAssetGroup] = useState(false)
    const [isCreatingLiabilityGroup, setIsCreatingLiabilityGroup] = useState(false)
    const [isCreatingAsset, setIsCreatingAsset] = useState(false)
    const [isCreatingLiability, setIsCreatingLiability] = useState(false)

    const assets = categories?.filter(c => c.type === 'asset') || []
    const liabilities = categories?.filter(c => c.type === 'liability') || []

    const assetGroups = categoryGroups?.filter(g => g.type === 'asset') || []
    const liabilityGroups = categoryGroups?.filter(g => g.type === 'liability') || []

    async function handleCreateGroup(formData: FormData) {
        try {
            await createCategoryGroup(formData)
            toast.success(t('groupCreated'))
            setIsCreatingAssetGroup(false)
            setIsCreatingLiabilityGroup(false)
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    async function handleCreateCategory(formData: FormData) {
        try {
            await createCategory(formData)
            toast.success(t('categoryCreated'))
            setIsCreatingAsset(false)
            setIsCreatingLiability(false)
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    async function handleAssignCategory(categoryId: string, groupId: string) {
        try {
            const formData = new FormData()
            formData.append('categoryId', categoryId)
            formData.append('groupId', groupId)
            await assignCategoryToGroup(formData)
            toast.success(t('categoryUpdated'))
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    return (
        <PremiumCard className="!p-0">
            <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-500" />
                        {t('categoryHierarchy')}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t('categoryHierarchyDesc')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-100 dark:divide-zinc-900">
                {/* Assets Column */}
                <div className="p-6 md:p-8 space-y-6">
                    <div className="flex justify-between items-center pb-2">
                        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-600 dark:text-emerald-400">{t('assetGroups')}</h3>
                        <div className="flex gap-1">
                            <button onClick={() => setIsCreatingAsset(!isCreatingAsset)} className="p-1.5 text-zinc-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all" title="Add Asset Category">
                                <Plus className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsCreatingAssetGroup(!isCreatingAssetGroup)} className="p-1.5 text-zinc-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all" title="Add Asset Group">
                                <FolderPlus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isCreatingAssetGroup && (
                            <motion.form
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                action={handleCreateGroup}
                                className="flex gap-2 bg-zinc-50/50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-4 overflow-hidden"
                            >
                                <input type="hidden" name="type" value="asset" />
                                <input name="name" required placeholder={t('newGroupName')} autoFocus className="flex h-9 w-full bg-transparent px-3 py-1 text-sm focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400" />
                                <Button type="submit" size="sm" className="h-9 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg">{t('add')}</Button>
                            </motion.form>
                        )}

                        {isCreatingAsset && (
                            <motion.form
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                action={handleCreateCategory}
                                className="flex gap-2 bg-emerald-50/20 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 mb-4 overflow-hidden ring-1 ring-emerald-500/20"
                            >
                                <input type="hidden" name="type" value="asset" />
                                <input name="name" required placeholder={t('assetPlaceholder')} autoFocus className="flex h-9 w-full bg-transparent px-3 py-1 text-sm focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-emerald-400/50" />
                                <Button type="submit" size="sm" className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">{t('add')}</Button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="space-y-6">
                        {assetGroups.map(group => (
                            <div key={group.id} className="space-y-3">
                                <div className="flex items-center gap-2 px-1">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{group.name}</h4>
                                    <div className="h-px bg-zinc-100 dark:bg-zinc-900 flex-1" />
                                    <button
                                        onClick={async () => {
                                            if (confirm(t('confirmDeleteGroup'))) {
                                                const fd = new FormData()
                                                fd.append('groupId', group.id)
                                                try {
                                                    await deleteCategoryGroup(fd)
                                                    toast.success(t('groupDeleted'))
                                                } catch (e: any) {
                                                    toast.error(e.message)
                                                }
                                            }
                                        }}
                                        className="p-1 text-zinc-300 hover:text-rose-500 transition-colors"
                                        title="Delete Group"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                                <ul className="space-y-1.5">
                                    {assets.filter(a => a.group_id === group.id).map(asset => (
                                        <CategoryItem key={asset.id} item={asset} groups={assetGroups} onAssign={handleAssignCategory} />
                                    ))}
                                    {assets.filter(a => a.group_id === group.id).length === 0 && <p className="text-[10px] text-zinc-400 italic px-4 py-2">{t('noItems')}</p>}
                                </ul>
                            </div>
                        ))}

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-orange-400">{t('uncategorized')}</h4>
                                <div className="h-px bg-orange-100/50 dark:bg-orange-900/20 flex-1" />
                            </div>
                            <ul className="space-y-1.5">
                                {assets.filter(a => !a.group_id).map(asset => (
                                    <CategoryItem key={asset.id} item={asset} groups={assetGroups} onAssign={handleAssignCategory} />
                                ))}
                                {assets.filter(a => !a.group_id).length === 0 && <p className="text-[10px] text-zinc-400 italic px-4 py-2">{t('allOrganized')}</p>}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Liabilities Column */}
                <div className="p-6 md:p-8 space-y-6">
                    <div className="flex justify-between items-center pb-2">
                        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-rose-600 dark:text-rose-400">{t('liabilityGroups')}</h3>
                        <div className="flex gap-1">
                            <button onClick={() => setIsCreatingLiability(!isCreatingLiability)} className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all" title="Add Liability Category">
                                <Plus className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsCreatingLiabilityGroup(!isCreatingLiabilityGroup)} className="p-1.5 text-zinc-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all" title="Add Liability Group">
                                <FolderPlus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isCreatingLiabilityGroup && (
                            <motion.form
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                action={handleCreateGroup}
                                className="flex gap-2 bg-zinc-50/50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-4 overflow-hidden"
                            >
                                <input type="hidden" name="type" value="liability" />
                                <input name="name" required placeholder={t('newGroupName')} autoFocus className="flex h-9 w-full bg-transparent px-3 py-1 text-sm focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400" />
                                <Button type="submit" size="sm" className="h-9 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg">{t('add')}</Button>
                            </motion.form>
                        )}

                        {isCreatingLiability && (
                            <motion.form
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                action={handleCreateCategory}
                                className="flex gap-2 bg-rose-50/20 dark:bg-rose-950/10 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 mb-4 overflow-hidden ring-1 ring-rose-500/20"
                            >
                                <input type="hidden" name="type" value="liability" />
                                <input name="name" required placeholder={t('liabilityPlaceholder')} autoFocus className="flex h-9 w-full bg-transparent px-3 py-1 text-sm focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-rose-400/50" />
                                <Button type="submit" size="sm" className="h-9 bg-rose-600 hover:bg-rose-700 text-white rounded-lg">{t('add')}</Button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="space-y-6">
                        {liabilityGroups.map(group => (
                            <div key={group.id} className="space-y-3">
                                <div className="flex items-center gap-2 px-1">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{group.name}</h4>
                                    <div className="h-px bg-zinc-100 dark:bg-zinc-900 flex-1" />
                                </div>
                                <ul className="space-y-1.5">
                                    {liabilities.filter(a => a.group_id === group.id).map(liability => (
                                        <CategoryItem key={liability.id} item={liability} groups={liabilityGroups} onAssign={handleAssignCategory} />
                                    ))}
                                    {liabilities.filter(a => a.group_id === group.id).length === 0 && <p className="text-[10px] text-zinc-400 italic px-4 py-2">{t('noItems')}</p>}
                                </ul>
                            </div>
                        ))}

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-orange-400">{t('uncategorized')}</h4>
                                <div className="h-px bg-orange-100/50 dark:bg-orange-900/20 flex-1" />
                            </div>
                            <ul className="space-y-1.5">
                                {liabilities.filter(a => !a.group_id).map(liability => (
                                    <CategoryItem key={liability.id} item={liability} groups={liabilityGroups} onAssign={handleAssignCategory} />
                                ))}
                                {liabilities.filter(a => !a.group_id).length === 0 && <p className="text-[10px] text-zinc-400 italic px-4 py-2">{t('allOrganized')}</p>}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </PremiumCard>
    )
}

function CategoryItem({ item, groups, onAssign }: { item: any, groups: any[], onAssign: (id: string, gid: string) => void }) {
    const t = useTranslations('Settings')
    const isActive = item.is_active

    return (
        <motion.li
            layout
            className="flex items-center justify-between p-2 pl-3 rounded-lg border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950/50 hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors group"
        >
            <div className="flex items-center gap-3">
                <Tag className={`w-3 h-3 ${isActive ? 'text-indigo-400' : 'text-zinc-300'}`} />
                <span className={`text-sm tracking-tight ${isActive ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-400 italic font-normal'}`}>{item.name}</span>
            </div>

            <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                <select
                    value={item.group_id || 'none'}
                    onChange={(e) => onAssign(item.id, e.target.value)}
                    className="text-[10px] font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-md px-1.5 py-0.5 text-zinc-500 outline-none cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <option value="none">{t('organizePlaceholder')}</option>
                    {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>

                <form action={toggleCategory} className="flex items-center">
                    <input type="hidden" name="categoryId" value={item.id} />
                    <input type="hidden" name="isActive" value={isActive ? 'false' : 'true'} />
                    <button type="submit" className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors cursor-pointer ${isActive ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                        <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-3.5' : 'translate-x-1'}`} />
                    </button>
                </form>

                <button
                    onClick={async () => {
                        if (confirm(t('confirmDeleteCategory'))) {
                            const fd = new FormData()
                            fd.append('categoryId', item.id)
                            try {
                                await deleteCategory(fd)
                                toast.success(t('categoryDeleted'))
                            } catch (e: any) {
                                toast.error(e.message)
                            }
                        }
                    }}
                    className="p-1 text-zinc-300 hover:text-rose-500 transition-colors"
                    title="Delete Category"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </motion.li>
    )
}
