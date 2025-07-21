export interface FormField {
  id: string;
  type:
    | 'text'
    | 'email'
    | 'number'
    | 'textarea'
    | 'dropdown'
    | 'slider'
    | 'date'
    | 'checkbox';
  label: string;
  required?: boolean;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
  options?: { value: string | number; label: string }[];
  defaultValue?: any;
  step?: number;
  helperText?: string;
  dependsOn?: string;
  showWhen?: any;
}
