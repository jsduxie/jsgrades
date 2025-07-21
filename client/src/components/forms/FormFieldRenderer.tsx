import React from 'react';
import {
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Checkbox,
  Box,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { FormFieldRendererProps } from '../interfaces/FormFieldRendererProps';

export const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
    field,
    value,
    onChange,
    error,
    formData
}) => {
    if (field.dependsOn && field.showWhen) {
        const dependentValue = formData[field.dependsOn];
        if (dependentValue !== field.showWhen) {
            return null;
        }
    }

    switch (field.type) {
        case 'text':
        case 'email':
            return (
                <TextField
                    label={field.label}
                    type={field.type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    error={Boolean(error)}
                    helperText={error || field.helperText}
                    required={field.required}
                />
            );

        case 'number':
            return (
                <TextField
                    label={field.label}
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    placeholder={field.placeholder}
                    error={Boolean(error)}
                    helperText={error || field.helperText}
                    required={field.required}
                    inputProps={{
                        min: field.validation?.min,
                        max: field.validation?.max,
                        step: field.step || 1,
                    }}
                />
            );

        case 'textarea':
            return (
                <TextField
                    label={field.label}
                    multiline
                    rows={4}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    error={Boolean(error)}
                    helperText={error || field.helperText}
                    required={field.required}
                />
            );

        case 'dropdown':
            return (
                <FormControl error={Boolean(error)} required={field.required}>
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        label={field.label}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid #e5e7eb',
                                    mt: 1,
                                }
                            }
                        }}
                    >
                        {field.options?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                    {(error || field.helperText) && (
                        <FormHelperText error={Boolean(error)}>
                            {error || field.helperText}
                        </FormHelperText>
                    )}
                </FormControl>
            );

        case 'slider':
            return (
                <div className="w-full bg-white p-6 rounded-lg border border-gray-200">
                    <Typography variant="body1" color="text.primary" className="mb-4">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Typography>
                    <Box sx={{ px: 2 }}>
                        <Slider
                            value={value || field.validation?.min || 0}
                            onChange={(_, newValue) => onChange(newValue)}
                            min={field.validation?.min || 0}
                            max={field.validation?.max || 100}
                            step={field.step || 1}
                            valueLabelDisplay="auto"
                            marks={field.validation?.min !== undefined && field.validation?.max !== undefined ? [
                                { value: field.validation.min, label: field.validation.min.toString() },
                                { value: field.validation.max, label: field.validation.max.toString() },
                            ] : undefined}
                        />
                    </Box>
                    {(error || field.helperText) && (
                        <FormHelperText error={Boolean(error)} className="mt-2">
                            {error || field.helperText}
                        </FormHelperText>
                    )}
                </div>
            );

        case 'date':
            return (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label={field.label}
                        value={value ? new Date(value) : null}
                        onChange={(date) => onChange(date ? date.toISOString().split('T')[0] : '')}
                        slotProps={{
                            textField: {
                                error: Boolean(error),
                                helperText: error || field.helperText,
                                required: field.required,
                            },
                        }}
                    />
                </LocalizationProvider>
            );

        case 'checkbox':
            return (
                <div className="w-full bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={Boolean(value)}
                                onChange={(e) => onChange(e.target.checked)}
                            />
                        }
                        label={
                            <Typography color="text.primary" className="font-medium">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Typography>
                        }
                    />
                </div>
            );

        default:
            return (
                <TextField
                    label={field.label}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    error={Boolean(error)}
                    helperText={error || field.helperText}
                    required={field.required}
                />
            );
    }
};
