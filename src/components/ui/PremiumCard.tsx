'use client'

import * as React from 'react'

export function PremiumCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`p-1.5 rounded-[2rem] bg-black/5 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 ${className}`}>
            <div className="bg-white dark:bg-[#0a0a0a] rounded-[calc(2rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] p-6 md:p-8 h-full">
                {children}
            </div>
        </div>
    )
}
