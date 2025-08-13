'use client';

import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Box,
    Tooltip,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { NavbarProps } from '@/types';
import { Logo } from '@/components/ui/UI';

export const Navbar: React.FC<NavbarProps> = ({
    user,
    onSignOut,
    onProfileSettings,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const navLinks = [
        { label: 'Home', href: '/home' },
        { label: 'Support', href: '/support' },
    ];

    const drawerContent = (
        <Box
            width={250}
            role='presentation'
            onClick={() => setDrawerOpen(false)}
        >
            <List>
                {navLinks.map(({ label, href }) => (
                    <Link key={label} href={href} passHref>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemText primary={label} />
                            </ListItemButton>
                        </ListItem>
                    </Link>
                ))}
                <ListItem disablePadding>
                    <ListItemButton onClick={onProfileSettings}>
                        <ListItemText primary='Profile Settings' />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={onSignOut}>
                        <ListItemText
                            primary='Sign Out'
                            sx={{ color: 'error.main' }}
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <AppBar
            position='fixed'
            color='primary'
            elevation={0}
            sx={{
                backgroundColor: theme.palette.primary.main,
                zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        height: '100%',
                        ml: 5,
                    }}
                >
                    <Logo height={60} fill='#fff' />
                </Box>

                {/* Desktop Links */}
                {!isMobile && (
                    <Box display='flex' alignItems='center' gap={3}>
                        {navLinks.map(({ label, href }) => (
                            <Link key={label} href={href} passHref>
                                <Button
                                    color='inherit'
                                    sx={{ fontSize: '1rem', fontWeight: 500 }}
                                >
                                    {label}
                                </Button>
                            </Link>
                        ))}
                    </Box>
                )}

                {/* Mobile Hamburger */}
                {isMobile && (
                    <>
                        <IconButton
                            edge='end'
                            color='inherit'
                            onClick={() => setDrawerOpen(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Drawer
                            anchor='right'
                            open={drawerOpen}
                            onClose={() => setDrawerOpen(false)}
                        >
                            {drawerContent}
                        </Drawer>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};
