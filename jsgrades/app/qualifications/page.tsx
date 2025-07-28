'use client';

import { useState, useEffect } from 'react';
import AddQualification from '@/components/AddQualification';
import { Qualification, APIResponse } from '@/types';
import { Button, Container, Typography, Stack } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

export default function QualificationsPage() {
    const auth = useAuth();
    const userId = auth?.userDetails?.id;

    const [open, setOpen] = useState(false);
    const [qualifications, setQualifications] = useState<Qualification[]>([]);

    useEffect(() => {
        async function fetchQualifications() {
            if (!userId) return;
            try {
                const res = await fetch(`/api/qualifications?userId=${userId}`);
                const json: APIResponse<Qualification[]> = await res.json();
                if (json.status === 'success' && json.data) {
                    setQualifications(json.data);
                } else {
                    console.error(json.message);
                }
            } catch (error) {
                console.error('Failed to fetch qualifications', error);
            }
        }
        fetchQualifications();
    }, [userId]);

    const handleAddQualification = async (newQual: Partial<Qualification>) => {
        if (!userId) return;
        try {
            const res = await fetch('/api/qualifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newQual, userId }),
            });
            const json: APIResponse<Qualification> = await res.json();
            if (json.status === 'success' && json.data) {
                setQualifications((prev) => [...prev, json.data!]);
            } else {
                console.error(json.message);
            }
        } catch (error) {
            console.error('Failed to add qualification', error);
        }
    };

    return (
        <Container maxWidth='md' sx={{ mt: 5 }}>
            <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                mb={3}
            >
                <Typography variant='h4'>My Qualifications</Typography>
                <Button variant='contained' onClick={() => setOpen(true)}>
                    Add Qualification
                </Button>
            </Stack>

            {qualifications.length === 0 ? (
                <Typography color='text.secondary'>
                    No qualifications added yet.
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {qualifications.map((q) => (
                        <div key={q.id}>
                            <Typography variant='subtitle1'>
                                {q.name} — {q.level}
                            </Typography>
                            <Typography variant='body2'>
                                {q.institution}
                            </Typography>
                            {/*
                Here you could add an Edit button that opens a modal/form
                to update the qualification by calling handleUpdateQualification
              */}
                        </div>
                    ))}
                </Stack>
            )}

            <AddQualification
                open={open}
                onClose={() => setOpen(false)}
                onSave={handleAddQualification}
            />
        </Container>
    );
}
