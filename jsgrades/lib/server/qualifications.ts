import pool from './db';
import QualificationRepository from '@/lib/repositories/QualificationRepository';
import { Qualification, NewQualification, QualificationLevel } from '@/types';

export async function getQualifications(
    userId: string
): Promise<Qualification[]> {
    const client = await pool.connect();
    try {
        const repo = new QualificationRepository(client);
        return await repo.getAllUserQualifications(userId);
    } finally {
        client.release();
    }
}

export async function getQualificationById(
    id: string
): Promise<Qualification | null> {
    const client = await pool.connect();
    try {
        const repo = new QualificationRepository(client);
        return await repo.getQualificationById(id);
    } finally {
        client.release();
    }
}

export async function addQualification(
    qualification: NewQualification
): Promise<Qualification> {
    const client = await pool.connect();
    try {
        const repo = new QualificationRepository(client);
        return await repo.createQualification(qualification);
    } finally {
        client.release();
    }
}

export async function updateQualification(
    id: string,
    updates: Partial<Qualification>
): Promise<Qualification> {
    const client = await pool.connect();
    try {
        const repo = new QualificationRepository(client);
        return await repo.updateQualification(id, updates);
    } finally {
        client.release();
    }
}

export async function deleteQualification(id: string): Promise<void> {
    const client = await pool.connect();
    try {
        const repo = new QualificationRepository(client);
        await repo.deleteQualification(id);
    } finally {
        client.release();
    }
}

export async function getQualificationLevels(): Promise<QualificationLevel[]> {
    const client = await pool.connect();
    try {
        const query =
            'SELECT id, name, level FROM qualification_levels ORDER BY level ASC';
        const result = await client.query(query);
        return result.rows.map((row) => ({
            id: row.id,
            name: row.name,
            level: row.level,
        }));
    } finally {
        client.release();
    }
}
