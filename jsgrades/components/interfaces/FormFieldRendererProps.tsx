import { FormField } from './FormField';

export interface FormFieldRendererProps {
    field: FormField;
    value: any;
    onChange: (value: any) => void;
    error?: string;
    formData: Record<string, any>;
}
