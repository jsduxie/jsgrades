'use client';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
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
            <SidebarTrigger />
            <div className='p-10'>{children}</div>
        </SidebarProvider>
    );
}
