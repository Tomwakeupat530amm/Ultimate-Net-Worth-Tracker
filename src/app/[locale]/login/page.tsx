import { getTranslations } from 'next-intl/server';
import { login, signup } from './actions';
import { Button } from '@/components/ui/button';

export default async function LoginPage() {
    const t = await getTranslations('Auth');

    return (
        <div className="flex h-screen w-full items-center justify-center px-4 bg-gray-50 dark:bg-zinc-950">
            <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h1 className="mb-6 text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
                    {t('title')}
                </h1>
                <form className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('email')}</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent dark:border-zinc-700 dark:focus:ring-zinc-300"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('password')}</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent dark:border-zinc-700 dark:focus:ring-zinc-300"
                        />
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                        <Button formAction={login} variant="default" className="w-full">
                            {t('login')}
                        </Button>
                        <Button formAction={signup} variant="outline" className="w-full cursor-pointer">
                            {t('signup')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
