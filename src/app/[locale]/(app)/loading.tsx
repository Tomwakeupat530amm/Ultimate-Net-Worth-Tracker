'use client'

import { motion } from 'framer-motion'

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]/40 backdrop-blur-md">
            <div className="relative flex flex-col items-center gap-6">
                {/* Stellar Loader Outer Ring */}
                <div className="relative w-20 h-20">
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-white/5 border-t-white/40"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: [0.32, 0.72, 0, 1]
                        }}
                    />

                    {/* Inner Orbiting Pulse */}
                    <motion.div
                        className="absolute inset-2 rounded-full border border-white/10"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: [0.2, 0.5, 0.2],
                            scale: [0.95, 1, 0.95]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    {/* Central Core Light */}
                    <div className="absolute inset-[35%] rounded-full bg-white/10 blur-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
                </div>

                {/* Micro eyebrow tag label */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="rounded-full px-4 py-1.5 bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl"
                >
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60">
                        Synchronizing
                    </span>
                </motion.div>
            </div>

            {/* Subtle mesh background for extra texture */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
        </div>
    )
}
