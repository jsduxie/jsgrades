import { FormSection } from './FormSection';

export interface FormConfig {
    title: string;
    description?: string;
    sections: FormSection[];
    crossValidation?: {
        rules: {
            field1: string;
            field2: string;
            type: 'match' | 'greater' | 'less' | 'different';
            message: string;
        }[];
    };
}
