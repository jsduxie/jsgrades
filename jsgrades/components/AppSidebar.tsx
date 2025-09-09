'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSignOut } from '@/hooks/useSignOut';
import { useProtectedRoute } from '@/hooks/useProtectedHook';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import { ClientUserDetails } from '@/types';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import {
    ClipboardList,
    GraduationCap,
    Home,
    LineChart,
    LogOut,
    Settings,
    User,
} from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const items = [
    { title: 'Home', url: '/home', icon: Home },
    { title: 'Qualifications', url: '/qualifications', icon: GraduationCap },
    { title: 'Tasks', url: '/tasks', icon: ClipboardList },
    { title: 'Visualise', url: '/visualise', icon: LineChart },
    { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar({
    user,
}: {
    user: ClientUserDetails | null | undefined;
}) {
    const pathname = usePathname();
    const protectedRouter = useProtectedRoute();
    const signOut = useSignOut();

    function getInitials(firstName?: string, lastName?: string) {
        return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
    }

    return (
        <Sidebar className='flex h-screen flex-col justify-between border-r bg-muted/40'>
            <SidebarHeader>
                <Logo />
            </SidebarHeader>
            <SidebarContent className='flex-1'>
                <SidebarGroup>
                    <SidebarGroupLabel className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                        JSGrades
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive = pathname.startsWith(item.url);
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link
                                                href={item.url}
                                                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                                                    isActive
                                                        ? 'bg-accent font-semibold text-accent-foreground'
                                                        : 'text-muted-foreground hover:bg-muted'
                                                }`}
                                            >
                                                <item.icon className='h-4 w-4' />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Profile section */}
            <div className='border-t border-border px-4 py-3'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className='flex w-full items-center justify-between rounded-md px-2 py-1.5 transition hover:bg-muted'>
                            <div className='flex items-center gap-3'>
                                <Avatar className='h-8 w-8'>
                                    <AvatarImage
                                        src={user?.avatarUrl ?? ''}
                                        alt='User avatar'
                                    />
                                    <AvatarFallback>
                                        {getInitials(
                                            user?.firstName,
                                            user?.lastName
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='text-left'>
                                    <p className='text-sm font-medium leading-none'>
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className='max-w-[150px] truncate text-xs text-muted-foreground'>
                                        {user?.email}
                                    </p>
                                </div>
                            </div>
                            <User className='h-4 w-4 text-muted-foreground' />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className='w-56' align='start'>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() =>
                                protectedRouter.push('/profile-settings')
                            }
                        >
                            Profile Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => signOut.signOut()}
                            className='text-red-600 focus:text-red-600'
                        >
                            <LogOut className='mr-2 h-4 w-4' />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Sidebar>
    );
}
