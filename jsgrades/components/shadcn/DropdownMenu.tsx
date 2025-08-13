import * as React from 'react';

type DropdownMenuProps = {
    children: React.ReactNode;
};

export function DropdownMenu({ children }: DropdownMenuProps) {
    return <div>{children}</div>;
}

export function DropdownMenuTrigger({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div>{children}</div>;
}

export function DropdownMenuContent({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <div className={className}>{children}</div>;
}

export function DropdownMenuItem({
    children,
    onSelect,
    className,
}: {
    children: React.ReactNode;
    onSelect?: () => void;
    className?: string;
}) {
    return (
        <div
            onClick={onSelect}
            className={className}
            role='menuitem'
            tabIndex={0}
        >
            {children}
        </div>
    );
}
