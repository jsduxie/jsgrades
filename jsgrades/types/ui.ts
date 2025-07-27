import {
    CardProps,
    SelectProps,
    TextFieldProps,
    ButtonProps,
} from '@mui/material';
import React from 'react';

export type LogoProps = {
    height?: number;
    bg?: string;
    fill?: string;
    style?: string;
};

export interface CustomButtonProps
    extends Omit<ButtonProps, 'variant' | 'size'> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export type CustomTextFieldProps = TextFieldProps & {
    className?: string;
};

export type CustomSelectProps = SelectProps & {
    label?: string;
    options: { value: string | number; label: string }[];
    className?: string;
    fullWidth?: boolean;
};

export interface CustomCardProps extends CardProps {
    children: React.ReactNode;
    hover?: boolean;
}

export interface LoadingIconProps {
    colour?:
        | 'primary'
        | 'secondary'
        | 'inherit'
        | 'error'
        | 'info'
        | 'success'
        | 'warning';
    size?: 'sm' | 'md' | 'lg';
}
