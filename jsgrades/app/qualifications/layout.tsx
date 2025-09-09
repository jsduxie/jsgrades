'use client';

import {SidebarInset, SidebarProvider, SidebarTrigger,} from '@/components/ui/sidebar';
import {AppSidebar} from '@/components/AppSidebar';
import {useAuth} from '@/context/AuthContext';

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
                <header className='group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear'>
                    <div className='flex items-center gap-2 px-4'>
                        <SidebarTrigger className='-ml-1' />
                    </div>
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
