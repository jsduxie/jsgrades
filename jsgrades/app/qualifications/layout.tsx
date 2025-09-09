'use client';

import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
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
            <SidebarInset>
                <header className='group-has-data-[collapsible=icon]/sidebar-wrapper:h-8 relative z-50 mb-0 flex h-12 shrink-0 items-center gap-2 bg-background/95 backdrop-blur transition-[width,height] ease-linear supports-[backdrop-filter]:bg-background/60'>
                    <div className='flex items-center px-3'>
                        <SidebarTrigger className='-ml-1' />
                    </div>
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
