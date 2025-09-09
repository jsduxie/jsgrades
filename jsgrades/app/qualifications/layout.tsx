'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/context/AuthContext';

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const auth = useAuth();

    return (
        <SidebarProvider>
            <AppSidebar user={auth?.userDetails} />
            <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
    );
}
