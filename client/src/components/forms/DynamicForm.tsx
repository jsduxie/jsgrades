import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { FormFieldRenderer } from './FormFieldRenderer';
import { FormConfig } from '../interfaces/FormConfig';

interface DynamicFormProps {
  config: FormConfig;
  onSubmit: (data: Record<string, any>) => void;
  isLoading?: boolean;
  initialData?: Record<string, any>;
  submitText?: string;
  showStepper?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  config,
  onSubmit,
  isLoading = false,
  initialData = {},
  submitText = 'Submit',
  showStepper = false,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form data only once when config changes
  useEffect(() => {
    if (!config || !config.sections || isInitialized) return;

    console.log('Initializing form with config:', config);
    const defaultData = { ...initialData };

    config.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.defaultValue !== undefined && !defaultData[field.id]) {
          defaultData[field.id] = field.defaultValue;
        } else if (!defaultData[field.id]) {
          // Initialize with empty values based on field type
          switch (field.type) {
            case 'number':
            case 'slider':
              defaultData[field.id] = field.validation?.min || 0;
              break;
            case 'checkbox':
              defaultData[field.id] = false;
              break;
            case 'dropdown':
              defaultData[field.id] = field.options?.[0]?.value || '';
              break;
            default:
              defaultData[field.id] = '';
          }
        }
      });
    });

    console.log('Setting initial form data:', defaultData);
    setFormData(defaultData);
    setIsInitialized(true);
  }, [config.title, config.sections.length]);

  const handleFieldChange = (fieldId: string, value: any) => {
    console.log(`Field ${fieldId} changed to:`, value);
    setFormData((prev) => {
      const newData = { ...prev, [fieldId]: value };
      console.log('Updated form data:', newData);
      return newData;
    });

    // Clear field error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateField = (field: any, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      const { min, max, pattern } = field.validation;

      if (min !== undefined && value < min) {
        return `${field.label} must be at least ${min}`;
      }

      if (max !== undefined && value > max) {
        return `${field.label} must be at most ${max}`;
      }

      if (
        pattern &&
        typeof value === 'string' &&
        !new RegExp(pattern).test(value)
      ) {
        return `${field.label} format is invalid`;
      }
    }

    return null;
  };

  const validateSection = (section: any): Record<string, string> => {
    const sectionErrors: Record<string, string> = {};

    section.fields.forEach((field: any) => {
      // Skip validation for fields that are conditionally hidden
      if (field.dependsOn && field.showWhen) {
        const dependentValue = formData[field.dependsOn];
        if (dependentValue !== field.showWhen) {
          return; // Skip this field if it's hidden
        }
      }

      const fieldValue = formData[field.id];
      const error = validateField(field, fieldValue);
      if (error) {
        sectionErrors[field.id] = error;
      }
    });

    return sectionErrors;
  };

  const handleNext = () => {
    const currentSection = config.sections[currentStep];
    const sectionErrors = validateSection(currentSection);

    if (Object.keys(sectionErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...sectionErrors }));
      return;
    }

    // Clear any existing errors for the current section when moving forward
    setErrors(prev => {
      const newErrors = { ...prev };
      currentSection.fields.forEach(field => {
        delete newErrors[field.id];
      });
      return newErrors;
    });

    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('Submitting form with data:', formData);

    // Validate all sections only on final submit
    const allErrors: Record<string, string> = {};
    
    config.sections.forEach((section) => {
      const sectionErrors = validateSection(section);
      Object.assign(allErrors, sectionErrors);
    });

    // Cross validation
    if (config.crossValidation?.rules) {
      config.crossValidation.rules.forEach((rule) => {
        const value1 = formData[rule.field1];
        const value2 = formData[rule.field2];

        switch (rule.type) {
          case 'match':
            if (value1 !== value2) {
              allErrors[rule.field2] = rule.message;
            }
            break;
          case 'greater':
            if (value1 <= value2) {
              allErrors[rule.field1] = rule.message;
            }
            break;
          case 'less':
            if (value1 >= value2) {
              allErrors[rule.field1] = rule.message;
            }
            break;
          case 'different':
            if (value1 === value2) {
              allErrors[rule.field2] = rule.message;
            }
            break;
        }
      });
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setIsSubmitting(false);
      
      // If there are errors, go to the first step that has errors
      if (showStepper && config.sections.length > 1) {
        const errorStep = config.sections.findIndex(section => 
          section.fields.some((field: any) => allErrors[field.id])
        );
        if (errorStep !== -1 && errorStep !== currentStep) {
          setCurrentStep(errorStep);
        }
      }
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSection = (section: any) => (
    <Card key={section.id} className="form-card">
      <CardContent className="p-6">
        <div className="mb-4">
          <Typography
            variant="h6"
            component="h2"
            color="text.primary"
            className="mb-2"
          >
            {section.title}
          </Typography>
          {section.description && (
            <Typography variant="body2" color="text.secondary" className="leading-relaxed">
              {section.description}
            </Typography>
          )}
        </div>

        <Divider className="mb-6" />

        <div className="space-y-6">
          {section.fields.map((field: any) => (
            <div key={field.id} className="transition-all duration-200">
              <FormFieldRenderer
                field={field}
                value={formData[field.id] || ''}
                onChange={(value) => handleFieldChange(field.id, value)}
                error={errors[field.id]}
                formData={formData}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Don't render until form is initialized
  if (isLoading || !isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <CircularProgress size={40} className="mb-4" />
          <Typography variant="body1" color="text.secondary">
            Loading form configuration...
          </Typography>
        </div>
      </div>
    );
  }

  // Get current step errors for display
  const currentStepErrors = showStepper && config.sections.length > 1 
    ? Object.keys(errors).filter(errorKey => 
        config.sections[currentStep]?.fields.some((field: any) => field.id === errorKey)
      )
    : Object.keys(errors);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Typography variant="h3" component="h1" color="text.primary" className="mb-3">
            {config.title}
          </Typography>

          {config.description && (
            <div className="flex justify-center">
              <Typography 
                variant="h6" 
                color="text.secondary" 
                className="max-w-2xl leading-relaxed text-center"
              >
                {config.description}
              </Typography>
            </div>
          )}
        </div>

        {/* Stepper */}
        {showStepper && config.sections.length > 1 && (
          <Card className="mb-8">
            <CardContent className="py-6">
              <Stepper activeStep={currentStep} alternativeLabel>
                {config.sections.map((section) => (
                  <Step key={section.id}>
                    <StepLabel>{section.title}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        )}

        {/* Error Alert - Only show errors for current step in stepper mode */}
        {currentStepErrors.length > 0 && (
          <Alert
            severity="error"
            className="mb-6"
          >
            <Typography variant="body2" className="font-medium">
              Please fix the errors below before continuing.
            </Typography>
          </Alert>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {showStepper && config.sections.length > 1 ? (
            <>
              {renderSection(config.sections[currentStep])}

              {/* Navigation Buttons */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={handleBack}
                      disabled={currentStep === 0}
                      variant="outlined"
                      size="large"
                      className="back-button px-8"
                    >
                      Back
                    </Button>

                    {currentStep === config.sections.length - 1 ? (
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        size="large"
                        className="primary-button px-8"
                        startIcon={
                          isSubmitting ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : null
                        }
                      >
                        {isSubmitting ? 'Submitting...' : submitText}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        variant="contained"
                        size="large"
                        className="primary-button px-8"
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {config.sections.map(renderSection)}

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  size="large"
                  className="submit-button"
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  {isSubmitting ? 'Submitting...' : submitText}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
