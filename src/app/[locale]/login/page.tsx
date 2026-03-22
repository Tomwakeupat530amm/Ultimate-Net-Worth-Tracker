import { getTranslations } from 'next-intl/server';
import LoginForm from './LoginForm';

export default async function LoginPage() {
    const t = await getTranslations('Auth');

    return (
        <div className="flex h-screen w-full items-center justify-center px-4 bg-gray-50 dark:bg-zinc-950">
            <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h1 className="mb-6 text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
                    {t('title')}
                </h1>

                <LoginForm t={{
                    email: t('email'),
                    password: t('password'),
                    login: t('login'),
                    signup: t('signup'),
                    checkEmail: t('checkEmail')
                }} />
            </div>
        </div>
    )
}
