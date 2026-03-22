'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { login, signup } from '@/app/[locale]/login/actions'

interface LoginFormProps {
    t: {
        email: string
        password: string
        login: string
        signup: string
        checkEmail: string
    }
}

export default function LoginForm({ t }: LoginFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const actionType = (e.nativeEvent as any).submitter?.name

        const action = actionType === 'signup' ? signup : login
        const result = await action(formData)

        if (result?.error) {
            toast.error(result.error)
            setIsLoading(false)
        } else if (result?.success) {
            if (result.confirmationRequired) {
                toast.success(t.checkEmail)
                setIsLoading(false)
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        } else {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.email}</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent dark:border-zinc-700 dark:focus:ring-zinc-300"
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.password}</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent dark:border-zinc-700 dark:focus:ring-zinc-300"
                />
            </div>
            <div className="flex flex-col gap-2 pt-2">
                <Button
                    type="submit"
                    name="login"
                    disabled={isLoading}
                    variant="default"
                    className="w-full"
                >
                    {t.login}
                </Button>
                <Button
                    type="submit"
                    name="signup"
                    disabled={isLoading}
                    variant="outline"
                    className="w-full cursor-pointer"
                >
                    {t.signup}
                </Button>
            </div>
        </form>
    )
}
