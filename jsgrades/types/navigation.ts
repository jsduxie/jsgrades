import { ClientUserDetails } from './';

export interface NavbarProps {
    user: ClientUserDetails;
    onSignOut: () => void;
    onProfileSettings?: () => void;
    logoSrc?: string;
    logoAlt?: string;
}

export type NavItem = {
    label: string;
    href: string;
    icon: React.ReactNode;
};
