'use client';

import React, { useState } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Tooltip,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavItem } from '@/types';

import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SettingsIcon from '@mui/icons-material/Settings';

const navItems: NavItem[] = [
    { label: 'Home', href: '/home', icon: <HomeIcon /> },
    { label: 'Grades', href: '/grades', icon: <SchoolIcon /> },
    { label: 'Tasks', href: '/tasks', icon: <AssignmentIcon /> },
    { label: 'Visualise', href: '/vis', icon: <ShowChartIcon /> },
];

export const Sidebar: React.FC = () => {
    const theme = useTheme();
    const pathname = usePathname();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [open, setOpen] = useState(!isMobile);

    const sidebarWidth = open ? 220 : 72;

    return (
        <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={open}
            onClose={() => setOpen(false)}
            ModalProps={{
                keepMounted: true,
            }}
            sx={{
                width: sidebarWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: sidebarWidth,
                    boxSizing: 'border-box',
                    backgroundColor: theme.palette.sidebar.main,
                    color: theme.palette.sidebar.contrastText,
                    borderRight: 'none',
                    transition: 'width 0.3s ease-in-out',
                    overflowX: 'hidden',
                },
            }}
            onMouseEnter={() => !isMobile && setOpen(true)}
            onMouseLeave={() => !isMobile && setOpen(false)}
        >
            <List sx={{ mt: 20 }}>
                {navItems.map(({ label, href, icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link key={label} href={href} passHref>
                            <ListItem
                                disablePadding
                                sx={{ display: 'block', my: 1.5 }}
                            >
                                <Tooltip
                                    title={!open ? label : ''}
                                    placement='right'
                                >
                                    <ListItemButton
                                        sx={{
                                            color: theme.palette.sidebar
                                                .contrastText,
                                            minHeight: 56,
                                            justifyContent: open
                                                ? 'initial'
                                                : 'center',
                                            px: 2.5,
                                            backgroundColor: isActive
                                                ? theme.palette.sidebar.hover
                                                : 'transparent',
                                            transition:
                                                'background-color 0.3s ease',
                                            '& .MuiListItemIcon-root, & .MuiListItemText-primary':
                                                {
                                                    color: theme.palette.sidebar
                                                        .contrastText,
                                                },
                                            '&:hover': {
                                                backgroundColor:
                                                    theme.palette.sidebar.hover,
                                                color: theme.palette.sidebar
                                                    .contrastText,
                                            },
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 0,
                                                mr: open ? 2 : 'auto',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            {icon}
                                        </ListItemIcon>

                                        <ListItemText
                                            primary={label}
                                            sx={{
                                                opacity: open ? 1 : 0,
                                                whiteSpace: 'nowrap',
                                                color: '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        />
                                    </ListItemButton>
                                </Tooltip>
                            </ListItem>
                        </Link>
                    );
                })}
            </List>

            <Box sx={{ flexGrow: 1 }} />
            <List sx={{ mb: 2 }}>
                <Link href='/settings' passHref>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <Tooltip
                            title={!open ? 'Settings' : ''}
                            placement='right'
                        >
                            <ListItemButton
                                sx={{
                                    color: theme.palette.sidebar.contrastText,
                                    minHeight: 56,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                    backgroundColor: 'transparent',
                                    transition: 'background-color 0.3s ease',
                                    '& .MuiListItemIcon-root, & .MuiListItemText-primary':
                                        {
                                            color: theme.palette.sidebar
                                                .contrastText,
                                        },
                                    '&:hover': {
                                        backgroundColor:
                                            theme.palette.sidebar.hover,
                                        color: theme.palette.sidebar
                                            .contrastText,
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 2 : 'auto',
                                        justifyContent: 'center',
                                        color: 'inherit',
                                    }}
                                >
                                    <SettingsIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary='Settings'
                                    sx={{
                                        opacity: open ? 1 : 0,
                                        whiteSpace: 'nowrap',
                                    }}
                                />
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                </Link>
            </List>
        </Drawer>
    );
};
