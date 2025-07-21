import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { DynamicForm } from '../components/forms/DynamicForm';
import { FormConfig } from '../components/interfaces/FormConfig';
import { useAuth } from '../context/AuthContext';

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

interface AddQualificationFormProps {
  onSuccess?: (qualification: any) => void;
  onCancel?: () => void;
}

export const AddQualificationForm: React.FC<AddQualificationFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auth = useAuth();

  useEffect(() => {
    fetchFormConfig();
  }, []);

  const fetchFormConfig = async () => {
    try {
      const response = await fetch(
        `${REACT_APP_API_URL}/qualification/form-config`,
        {
          headers: {
            Authorization: `Bearer ${await auth?.currentUser?.getIdToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch form configuration');
      }

      const config = await response.json();
      setFormConfig(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${REACT_APP_API_URL}/qualification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await auth?.currentUser?.getIdToken()}`,
        },
        body: JSON.stringify({
          ...formData,
          user_id: auth?.currentUser?.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create qualification');
      }

      const qualification = await response.json();
      onSuccess?.(qualification);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Typography>Loading form...</Typography>
      </Box>
    );
  }

  if (error && !formConfig) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!formConfig) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        No form configuration available
      </Alert>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DynamicForm
        config={formConfig}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitText="Create Qualification"
        showStepper={formConfig.sections.length > 1}
      />
    </Box>
  );
};
