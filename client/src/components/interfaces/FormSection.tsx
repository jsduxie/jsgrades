import { FormField } from './FormField';

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}
