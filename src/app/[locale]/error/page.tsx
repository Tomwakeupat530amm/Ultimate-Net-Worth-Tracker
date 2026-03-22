'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
    const searchParams = useSearchParams()
    const message = searchParams.get('message')

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4 text-red-600">Authentication Error</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-md text-center">
                {message || 'An unknown error occurred during authentication.'}
            </p>
            <Link href="/login">
                <Button>Back to Login</Button>
            </Link>
        </div>
    )
}

export default function ErrorPage() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4">
            <Suspense fallback={<p>Loading error details...</p>}>
                <ErrorContent />
            </Suspense>
        </div>
    )
}
