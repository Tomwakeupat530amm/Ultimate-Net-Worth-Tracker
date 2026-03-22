'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { createCategoryGroup, assignCategoryToGroup, toggleCategory } from './actions'
import { toast } from 'sonner'
import { useState } from 'react'

export function CategoryGroupsManager({ categories, categoryGroups }: { categories: any[], categoryGroups: any[] }) {
    const t = useTranslations('Settings')
    const [isCreatingAssetGroup, setIsCreatingAssetGroup] = useState(false)
    const [isCreatingLiabilityGroup, setIsCreatingLiabilityGroup] = useState(false)

    const assets = categories?.filter(c => c.type === 'asset') || []
    const liabilities = categories?.filter(c => c.type === 'liability') || []

    const assetGroups = categoryGroups?.filter(g => g.type === 'asset') || []
    const liabilityGroups = categoryGroups?.filter(g => g.type === 'liability') || []

    async function handleCreateGroup(formData: FormData) {
        try {
            await createCategoryGroup(formData)
            toast.success('Group created successfully')
            setIsCreatingAssetGroup(false)
            setIsCreatingLiabilityGroup(false)
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
            toast.success('Category moved')
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    return (
        <section className="space-y-6 bg-white dark:bg-[#050505] p-6 rounded-xl border border-[#EAEAEA] dark:border-[#333333] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-[#111111] dark:text-[#F7F6F3]">Category Hierarchy</h2>
                    <p className="text-sm text-[#787774] dark:text-[#A1A1AA] mt-1">Organize your accounts into specific groups (e.g. Cash, Equities).</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                {/* Assets Column */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-[#EAEAEA] dark:border-[#333333] pb-2">
                        <h3 className="text-sm uppercase tracking-widest font-semibold text-[#346538] dark:text-[#34D399]">Asset Groups</h3>
                        <Button variant="ghost" size="sm" onClick={() => setIsCreatingAssetGroup(!isCreatingAssetGroup)} className="text-xs h-7">+ Group</Button>
                    </div>

                    {isCreatingAssetGroup && (
                        <form action={handleCreateGroup} className="flex gap-2">
                            <input type="hidden" name="type" value="asset" />
                            <input name="name" required placeholder="Group Name" autoFocus className="flex h-8 w-full rounded border border-[#EAEAEA] bg-[#FBFBFA] px-2 py-1 text-sm focus:outline-none dark:border-[#333333] dark:bg-[#111111] text-[#111111] dark:text-[#F7F6F3]" />
                            <Button type="submit" size="sm" className="h-8">Add</Button>
                        </form>
                    )}

                    <div className="space-y-4">
                        {assetGroups.map(group => (
                            <div key={group.id} className="bg-[#FBFBFA] dark:bg-[#111111] border border-[#EAEAEA] dark:border-[#333333] rounded-lg p-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111] dark:text-[#F7F6F3] mb-3">{group.name}</h4>
                                <ul className="space-y-2">
                                    {assets.filter(a => a.group_id === group.id).map(asset => (
                                        <CategoryItem key={asset.id} item={asset} groups={assetGroups} onAssign={handleAssignCategory} />
                                    ))}
                                    {assets.filter(a => a.group_id === group.id).length === 0 && <p className="text-xs text-[#787774] italic">Empty</p>}
                                </ul>
                            </div>
                        ))}

                        <div className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-lg p-3 border-dashed">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-orange-800 dark:text-orange-500 mb-3">Uncategorized Assets</h4>
                            <ul className="space-y-2">
                                {assets.filter(a => !a.group_id).map(asset => (
                                    <CategoryItem key={asset.id} item={asset} groups={assetGroups} onAssign={handleAssignCategory} />
                                ))}
                                {assets.filter(a => !a.group_id).length === 0 && <p className="text-xs text-[#787774] italic">All categorized</p>}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Liabilities Column */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-[#EAEAEA] dark:border-[#333333] pb-2">
                        <h3 className="text-sm uppercase tracking-widest font-semibold text-[#9F2F2D] dark:text-[#FB7185]">Liability Groups</h3>
                        <Button variant="ghost" size="sm" onClick={() => setIsCreatingLiabilityGroup(!isCreatingLiabilityGroup)} className="text-xs h-7">+ Group</Button>
                    </div>

                    {isCreatingLiabilityGroup && (
                        <form action={handleCreateGroup} className="flex gap-2">
                            <input type="hidden" name="type" value="liability" />
                            <input name="name" required placeholder="Group Name" autoFocus className="flex h-8 w-full rounded border border-[#EAEAEA] bg-[#FBFBFA] px-2 py-1 text-sm focus:outline-none dark:border-[#333333] dark:bg-[#111111] text-[#111111] dark:text-[#F7F6F3]" />
                            <Button type="submit" size="sm" className="h-8">Add</Button>
                        </form>
                    )}

                    <div className="space-y-4">
                        {liabilityGroups.map(group => (
                            <div key={group.id} className="bg-[#FBFBFA] dark:bg-[#111111] border border-[#EAEAEA] dark:border-[#333333] rounded-lg p-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111] dark:text-[#F7F6F3] mb-3">{group.name}</h4>
                                <ul className="space-y-2">
                                    {liabilities.filter(a => a.group_id === group.id).map(liability => (
                                        <CategoryItem key={liability.id} item={liability} groups={liabilityGroups} onAssign={handleAssignCategory} />
                                    ))}
                                    {liabilities.filter(a => a.group_id === group.id).length === 0 && <p className="text-xs text-[#787774] italic">Empty</p>}
                                </ul>
                            </div>
                        ))}

                        <div className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-lg p-3 border-dashed">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-orange-800 dark:text-orange-500 mb-3">Uncategorized Liab.</h4>
                            <ul className="space-y-2">
                                {liabilities.filter(a => !a.group_id).map(liability => (
                                    <CategoryItem key={liability.id} item={liability} groups={liabilityGroups} onAssign={handleAssignCategory} />
                                ))}
                                {liabilities.filter(a => !a.group_id).length === 0 && <p className="text-xs text-[#787774] italic">All categorized</p>}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function CategoryItem({ item, groups, onAssign }: { item: any, groups: any[], onAssign: (id: string, gid: string) => void }) {
    return (
        <li className="flex items-center justify-between p-2 rounded border border-[#EAEAEA] dark:border-[#333333] bg-white dark:bg-[#050505] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <span className="font-medium text-sm text-[#111111] dark:text-[#F7F6F3]">{item.name}</span>
            <div className="flex items-center gap-2">
                <select
                    value={item.group_id || 'none'}
                    onChange={(e) => onAssign(item.id, e.target.value)}
                    className="text-xs border border-[#EAEAEA] dark:border-[#333333] bg-[#FBFBFA] dark:bg-[#111111] rounded px-1 py-1 text-[#787774] max-w-[100px] truncate outline-none cursor-pointer"
                >
                    <option value="none">Ungrouped</option>
                    {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>

                <form action={toggleCategory}>
                    <input type="hidden" name="categoryId" value={item.id} />
                    <input type="hidden" name="isActive" value={item.is_active ? 'false' : 'true'} />
                    <button type="submit" className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${item.is_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-[#333333]'}`}>
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${item.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                </form>
            </div>
        </li>
    )
}
