import { AppLayout } from '@/components/layout/AppLayout'
import { Toaster } from '@/components/ui/sonner'

export default function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <AppLayout>{children}</AppLayout>
            <Toaster />
        </>
    )
}
