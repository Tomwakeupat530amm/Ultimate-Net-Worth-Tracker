import { getTranslations } from 'next-intl/server';
import LoginForm from './LoginForm';

export default async function LoginPage() {
    const t = await getTranslations('Auth');

    return (
        <div className="min-h-screen w-full flex items-center justify-center px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-950 to-zinc-950">
            <LoginForm t={{
                email: t('email'),
                password: t('password'),
                confirmPassword: t('confirmPassword'),
                login: t('login'),
                signup: t('signup'),
                checkEmail: t('checkEmail'),
                welcomeBack: t('welcomeBack'),
                createAccount: t('createAccount'),
                dontHaveAccount: t('dontHaveAccount'),
                alreadyHaveAccount: t('alreadyHaveAccount'),
                passwordsDoNotMatch: t('passwordsDoNotMatch'),
                loginDescription: t('loginDescription'),
                signupDescription: t('signupDescription')
            }} />
        </div>
    )
}
