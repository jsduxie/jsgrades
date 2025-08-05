'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSignOut } from '@/app/hooks/useSignOut';
import { useProtectedRoute } from '@/app/hooks/useProtectedHook';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ClientUserDetails } from '@/types';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import {
    Home,
    GraduationCap,
    ClipboardList,
    LineChart,
    Settings,
    LogOut,
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
        <Sidebar className='bg-muted/40 flex h-screen flex-col justify-between border-r pt-16'>
            <SidebarContent className='flex-1'>
                <SidebarGroup>
                    <SidebarGroupLabel className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>
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
                                                        ? 'bg-accent text-accent-foreground font-semibold'
                                                        : 'hover:bg-muted text-muted-foreground'
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
            <div className='border-border border-t px-4 py-3'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className='hover:bg-muted flex w-full items-center justify-between rounded-md px-2 py-1.5 transition'>
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
                                    <p className='text-sm leading-none font-medium'>
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className='text-muted-foreground max-w-[150px] truncate text-xs'>
                                        {user?.email}
                                    </p>
                                </div>
                            </div>
                            <User className='text-muted-foreground h-4 w-4' />
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
