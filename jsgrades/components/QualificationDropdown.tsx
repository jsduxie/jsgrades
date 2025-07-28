'use client';

import React from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
} from '@mui/material';
import { styled } from '@mui/material/styles';

type QualificationLevel = {
    value: number;
    label: string;
};

const educationLevels: QualificationLevel[] = [
    { value: 2, label: 'GCSE' },
    { value: 3, label: 'A-Level' },
    { value: 6, label: 'Undergraduate' },
    { value: 7, label: 'Postgraduate' },
    { value: 0, label: 'Not Applicable' },
];

interface QualificationDropdownProps {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    variant?: 'outlined' | 'filled' | 'standard';
    fullWidth?: boolean;
}

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
        },
    },
}));

// Reusable component to display dropdown to select qualifications level and store as int based on level
// numbers are based on standard qualifications levels in UK
export function QualificationDropdown({
    value,
    onChange,
    label = 'Qualification Level',
    variant = 'outlined',
    fullWidth = true,
}: QualificationDropdownProps) {
    const handleChange = (event: SelectChangeEvent<number>) => {
        onChange(Number(event.target.value));
    };

    return (
        <StyledFormControl variant={variant} fullWidth={fullWidth}>
            <InputLabel id='qualification-level-label'>{label}</InputLabel>
            <Select
                labelId='qualification-level-label'
                id='qualification-level-select'
                value={value}
                label={label}
                onChange={handleChange}
            >
                {educationLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                        {level.label}
                    </MenuItem>
                ))}
            </Select>
        </StyledFormControl>
    );
}
