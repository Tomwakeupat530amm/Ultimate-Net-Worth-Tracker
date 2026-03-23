'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
    BookOpen,
    Settings,
    BarChart3,
    ArrowRightLeft,
    Zap,
    ShieldCheck,
    Info,
    HelpCircle,
    LayoutDashboard
} from 'lucide-react'
import { PremiumCard } from '@/components/ui/PremiumCard'
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerReveal'

export default function GuidePage() {
    const t = useTranslations('Guide')

    const steps = [
        {
            id: '01',
            title: t('step1'),
            phase: t('step1_phase'),
            icon: Settings,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            points: [
                t('step1_desc1'),
                t('step1_desc2'),
                t('step1_desc3')
            ]
        },
        {
            id: '02',
            title: t('step2'),
            phase: t('step2_phase'),
            icon: BarChart3,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            quote: t('step2_quote'),
            points: [
                t('step2_desc1'),
                t('step2_desc2')
            ]
        },
        {
            id: '03',
            title: t('step3'),
            phase: t('step3_phase'),
            icon: ArrowRightLeft,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            infoTitle: t('step3_infoTitle'),
            infoDesc: t('step3_infoDesc'),
            subsections: [
                { title: t('step3_inflowTitle'), desc: t('step3_inflowDesc') },
                { title: t('step3_outflowTitle'), desc: t('step3_outflowDesc') }
            ]
        },
        {
            id: '04',
            title: t('step4'),
            phase: t('step4_phase'),
            icon: LayoutDashboard,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            points: [
                t('step4_desc1'),
                t('step4_desc2')
            ]
        }
    ]

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20 p-4">
            {/* Header section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-wider mb-2 mx-auto">
                    <BookOpen size={12} />
                    <span>Documentation</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-900 dark:text-white uppercase leading-none">
                    {t('title')}
                </h1>
                <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
                    {t('description')}
                </p>
            </motion.div>

            {/* Steps Section */}
            <div className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
                        {t('workflowTitle')}
                    </h2>
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                </div>

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {steps.map((step) => (
                        <StaggerItem key={step.id} className="h-full">
                            <PremiumCard className="h-full">
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className={`p-4 rounded-2xl ${step.bg} ${step.color} shadow-sm shadow-black/5`}>
                                            <step.icon size={28} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono">
                                            {step.phase}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                                        {step.title}
                                    </h3>

                                    <div className="space-y-4">
                                        {step.quote && (
                                            <div className="pl-4 border-l-2 border-emerald-500/50 italic text-sm text-zinc-500 dark:text-zinc-400 py-1 font-medium bg-emerald-500/5 rounded-r-lg pr-2">
                                                "{step.quote}"
                                            </div>
                                        )}

                                        {step.infoTitle && (
                                            <div className="bg-zinc-50 dark:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-2">
                                                <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                                    <Info size={14} className="text-blue-500" />
                                                    {step.infoTitle}
                                                </h4>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                                                    {step.infoDesc}
                                                </p>
                                            </div>
                                        )}

                                        <ul className="space-y-4 pt-2">
                                            {step.points?.map((point, idx) => (
                                                <li key={idx} className="flex items-start gap-4 text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500/40 dark:bg-blue-400/40 shrink-0" />
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                            {step.subsections?.map((sub, idx) => (
                                                <li key={idx} className="space-y-1.5">
                                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-200">
                                                        {sub.title}
                                                    </h4>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                                                        {sub.desc}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </PremiumCard>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>

            {/* Formulas Section */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="pt-12 border-t border-zinc-200 dark:border-zinc-800"
            >
                <div className="bg-zinc-950 rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden group shadow-2xl border border-white/5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(59,130,246,0.3),transparent)] transition-opacity duration-1000" />
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(59,130,246,0.1)_0deg,transparent_60deg)] animate-[spin_10s_linear_infinite]" />

                    <div className="relative z-10 space-y-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-3 text-center md:text-left">
                                <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none">{t('formulasTitle')}</h2>
                                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">{t('versionInfo')}</p>
                            </div>
                            <div className="hidden md:block">
                                <div className="p-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl group-hover:scale-110 transition-transform duration-700">
                                    <HelpCircle size={40} strokeWidth={1} className="text-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] space-y-4 hover:bg-white/10 transition-colors duration-500">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">{t('formulaNW_Label')}</p>
                                <p className="text-sm font-mono text-zinc-100 leading-relaxed font-bold">{t('formulaNW_Value')}</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] space-y-4 hover:bg-white/10 transition-colors duration-500">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">{t('formulaFIRE_Label')}</p>
                                <div className="space-y-2">
                                    <p className="text-sm font-mono text-zinc-100 leading-relaxed font-bold">{t('formulaFIRE_Value')}</p>
                                    <p className="text-[10px] text-zinc-500 italic font-medium">{t('formulaFIRE_Hint')}</p>
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] space-y-4 hover:bg-white/10 transition-colors duration-500">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">{t('formulaWaterfall_Label')}</p>
                                <div className="space-y-3">
                                    <p className="text-sm font-mono text-zinc-100 font-bold">{t('formulaGrowth_Value')}</p>
                                    <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">{t('formulaGain_Desc')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6">
                            <div className="flex -space-x-3">
                                <div className="h-10 w-10 rounded-full border-2 border-zinc-950 bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-900/20">
                                    <Zap size={18} className="fill-white" />
                                </div>
                                <div className="h-10 w-10 rounded-full border-2 border-zinc-950 bg-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-900/20">
                                    <ShieldCheck size={18} className="fill-white" />
                                </div>
                            </div>
                            <button className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors underline underline-offset-8 decoration-blue-500/50">
                                {t('needSupport')}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
