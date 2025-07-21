import { FormConfig } from './FormConfig';

export interface DynamicFormProps {
  config: FormConfig;
  onSubmit: (data: Record<string, any>) => void;
  isLoading?: boolean;
  initialData?: Record<string, any>;
  submitText?: string;
  showStepper?: boolean;
}
