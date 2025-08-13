'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Stack,
    CircularProgress,
    Box,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
    QualificationLevel,
    QualificationFormData,
    AddQualificationProps,
} from '@/types';

export default function AddQualification({
    open,
    onClose,
    onSave,
}: AddQualificationProps) {
    const [levels, setLevels] = useState<QualificationLevel[]>([]);
    const [isLoadingLevels, setIsLoadingLevels] = useState(false);
    const [formData, setFormData] = useState<QualificationFormData>({
        name: '',
        institution: '',
        level: '',
        startDate: '',
        endDate: '',
        currentGrade: '',
        targetGrade: '',
        predictedGrade: '',
        inProgress: true,
    });

    useEffect(() => {
        if (!open) return;
        const fetchLevels = async () => {
            setIsLoadingLevels(true);
            try {
                const res = await fetch('/api/qualifications/levels');
                const json = await res.json();
                if (json.status === 'success') setLevels(json.data);
            } catch (error) {
                console.error('Failed to fetch qualification levels:', error);
            } finally {
                setIsLoadingLevels(false);
            }
        };
        fetchLevels();
    }, [open]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async () => {
        const payload = {
            ...formData,
            currentGrade: parseFloat(formData.currentGrade) || undefined,
            targetGrade: parseFloat(formData.targetGrade) || undefined,
            predictedGrade: parseFloat(formData.predictedGrade) || undefined,
        };

        await onSave(payload);
        onClose();
        setFormData({
            name: '',
            institution: '',
            level: '',
            startDate: '',
            endDate: '',
            currentGrade: '',
            targetGrade: '',
            predictedGrade: '',
            inProgress: true,
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle>Add Qualification</DialogTitle>
            <DialogContent>
                {isLoadingLevels ? (
                    <Box
                        display='flex'
                        flexDirection='column'
                        alignItems='center'
                        justifyContent='center'
                        minHeight='200px'
                        gap={2}
                    >
                        <CircularProgress />
                        <Typography variant='body2' color='text.secondary'>
                            Loading qualification levels...
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label='Name'
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            label='Institution'
                            name='institution'
                            value={formData.institution}
                            onChange={handleChange}
                            required
                        />
                        <TextField
                            select
                            label='Level'
                            name='level'
                            value={formData.level}
                            onChange={handleChange}
                            required
                        >
                            {levels.map((l) => (
                                <MenuItem key={l.id} value={l.id}>
                                    {l.name} (Level {l.level})
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            type='date'
                            label='Start Date'
                            name='startDate'
                            value={formData.startDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            type='date'
                            label='End Date'
                            name='endDate'
                            value={formData.endDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            disabled={formData.inProgress}
                        />
                        <TextField
                            label='Current Grade'
                            name='currentGrade'
                            value={formData.currentGrade}
                            onChange={handleChange}
                        />
                        <TextField
                            label='Target Grade'
                            name='targetGrade'
                            value={formData.targetGrade}
                            onChange={handleChange}
                        />
                        <TextField
                            label='Predicted Grade'
                            name='predictedGrade'
                            value={formData.predictedGrade}
                            onChange={handleChange}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.inProgress}
                                    onChange={handleChange}
                                    name='inProgress'
                                />
                            }
                            label='In Progress'
                        />
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant='contained'
                    disabled={isLoadingLevels}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}
