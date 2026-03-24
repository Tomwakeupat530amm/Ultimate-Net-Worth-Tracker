'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { login, signup } from '@/app/[locale]/login/actions'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react'

interface LoginFormProps {
    t: {
        email: string
        password: string
        confirmPassword: string
        login: string
        signup: string
        checkEmail: string
        welcomeBack: string
        createAccount: string
        dontHaveAccount: string
        alreadyHaveAccount: string
        passwordsDoNotMatch: string
        loginDescription: string
        signupDescription: string
    }
}

export default function LoginForm({ t }: LoginFormProps) {
    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)

        if (mode === 'signup') {
            const password = formData.get('password')
            const confirmPassword = formData.get('confirmPassword')
            if (password !== confirmPassword) {
                toast.error(t.passwordsDoNotMatch)
                setIsLoading(false)
                return
            }
        }

        const action = mode === 'signup' ? signup : login
        const result = await action(formData)

        if (result?.error) {
            toast.error(result.error)
            setIsLoading(false)
        } else if (result?.success) {
            if (result.confirmationRequired) {
                toast.success(t.checkEmail, {
                    duration: 10000,
                })
                setIsSuccess(true)
                setIsLoading(false)
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        } else {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="w-full max-w-md mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-10 h-10 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Verification Sent
                    </h2>
                    <p className="text-gray-500 dark:text-zinc-400 mb-8 leading-relaxed">
                        {t.checkEmail}
                    </p>
                    <Button
                        onClick={() => setIsSuccess(false)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6"
                    >
                        {t.login}
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative group mt-8"
            >
                {/* Decorative background glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

                <div className="relative bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-8 overflow-hidden">

                    {/* Mode-specific Header */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.3 }}
                            className="mb-8"
                        >
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                                {mode === 'login' ? t.welcomeBack : t.createAccount}
                            </h1>
                            <p className="text-gray-500 dark:text-zinc-400 text-sm">
                                {mode === 'login' ? t.loginDescription : t.signupDescription}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform duration-200">
                            <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 ml-1">
                                {t.email}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform duration-200">
                            <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 ml-1">
                                {t.password}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Confirm Password Field (Signup only) */}
                        <AnimatePresence>
                            {mode === 'signup' && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                    animate={{ height: "auto", opacity: 1, marginTop: 20 }}
                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-1.5 focus-within:translate-x-1 transition-transform duration-200">
                                        <label htmlFor="confirmPassword" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 ml-1">
                                            {t.confirmPassword}
                                        </label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                required={mode === 'signup'}
                                                placeholder="••••••••"
                                                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 relative overflow-hidden group shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2 text-sm font-bold">
                                {isLoading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                    />
                                ) : mode === 'login' ? (
                                    <>
                                        <LogIn className="w-4 h-4" />
                                        {t.login}
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        {t.signup}
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Button>
                    </form>

                    {/* Footer Toggle */}
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 text-center">
                        <p className="text-sm text-gray-500 dark:text-zinc-400 flex items-center justify-center gap-2">
                            {mode === 'login' ? t.dontHaveAccount : t.alreadyHaveAccount}
                            <button
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="text-blue-600 dark:text-blue-400 font-bold hover:underline underline-offset-4 flex items-center gap-1 group/link transition-all"
                            >
                                {mode === 'login' ? t.signup : t.login}
                                <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
