import { StubUtility } from '../StubUtility';
import pool from '@/lib/server/db';

const originalEnv = process.env;

describe('Qualifications API Integration Tests', () => {
    let stubUtil: StubUtility;
    let testUserId: string;
    let testLevelId: string;

    beforeAll(async () => {
        try {
            stubUtil = await StubUtility.create();

            const result = await pool.query('SELECT 1 as test');
            if (result.rows[0].test !== 1) {
                throw new Error('Database connection test failed');
            }
        } catch (error) {
            console.warn('Database connection test failed:', error);
            throw error;
        }
    });

    beforeEach(async () => {
        testUserId = await stubUtil.getTestUser({
            id: '11111111-1111-1111-1111-111111111111',
            uid: 'test-uid-1',
            email: 'testuser1@example.com',
            firstName: 'Test',
            lastName: 'User',
        });
        testLevelId = await stubUtil.getQualificationLevel({
            name: 'Bachelor',
        });
    });

    afterAll(async () => {
        // Clean up StubUtility and close database connections to avoid hanging handles
        await stubUtil.cleanup();
        // Restore original environment variables
        process.env = originalEnv;
    });

    describe('Real Database Connection', () => {
        it('should connect to Neon PostgreSQL database', async () => {
            const pool = (await import('@/lib/server/db')).default;
            const result = await pool.query(
                'SELECT NOW() as current_time, version() as db_version'
            );

            expect(result.rows).toHaveLength(1);
            expect(result.rows[0].current_time).toBeDefined();
            expect(result.rows[0].db_version).toContain('PostgreSQL');
        });

        it('should verify qualifications table exists', async () => {
            const pool = (await import('@/lib/server/db')).default;
            const result = await pool.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'qualifications'
            `);

            expect(result.rows).toHaveLength(1);
            expect(result.rows[0].table_name).toBe('qualifications');
        });

        it('should verify database environment configuration', async () => {
            expect(process.env.DATABASE_URL_DEV).toBeDefined();
            if (process.env.DATABASE_URL_DEV?.includes('neon')) {
                expect(process.env.DATABASE_URL_DEV).toMatch(
                    /neon\.tech|neon\.database/
                );
            }
        });
    });

    describe('Qualifications CRUD Operations with Real Database', () => {
        it('should add a qualification to real database', async () => {
            const { addQualification } = await import(
                '@/lib/server/qualifications'
            );
            const testQualification = {
                name: 'Integration Test Qualification',
                institution: 'Test University',
                userId: testUserId,
                level: testLevelId,
                startDate: new Date('2023-09-01'),
                endDate: new Date('2026-06-01'),
                currentGrade: 85.5,
                targetGrade: 90,
                predictedGrade: 87.2,
                inProgress: true,
            };
            const createdQualification =
                await addQualification(testQualification);
            expect(createdQualification).toBeDefined();
            expect(createdQualification.id).toBeDefined();
            expect(createdQualification.name).toBe(testQualification.name);
            expect(createdQualification.institution).toBe(
                testQualification.institution
            );
            expect(createdQualification.userId).toBe(testUserId);
            expect(createdQualification.level).toBe(testLevelId);
            expect(createdQualification.currentGrade).toBe(85.5);
            expect(createdQualification.inProgress).toBe(true);
            await pool.query('DELETE FROM qualifications WHERE id = $1', [
                createdQualification.id,
            ]);
        });

        it('should read qualifications from real database', async () => {
            const { addQualification, getQualifications } = await import(
                '@/lib/server/qualifications'
            );
            const testQualification = {
                name: 'Integration Test Qualification',
                institution: 'Test University',
                userId: testUserId,
                level: testLevelId,
                startDate: new Date('2023-09-01'),
                endDate: new Date('2026-06-01'),
                currentGrade: 85.5,
                targetGrade: 90,
                predictedGrade: 87.2,
                inProgress: true,
            };
            const createdQualification =
                await addQualification(testQualification);
            const qualifications = await getQualifications(testUserId);
            expect(qualifications).toBeDefined();
            expect(Array.isArray(qualifications)).toBe(true);
            expect(qualifications.length).toBeGreaterThan(0);
            const qualification = qualifications.find(
                (q) => q.id === createdQualification.id
            );
            expect(qualification).toBeDefined();
            if (!qualification) throw new Error('Qualification not found');
            expect(qualification.name).toBe('Integration Test Qualification');
            expect(qualification.institution).toBe('Test University');
            expect(qualification.userId).toBe(testUserId);
            await pool.query('DELETE FROM qualifications WHERE id = $1', [
                createdQualification.id,
            ]);
        });

        it('should update a qualification in real database', async () => {
            const { addQualification, updateQualification, getQualifications } =
                await import('@/lib/server/qualifications');
            const testQualification = {
                name: 'Integration Test Qualification',
                institution: 'Test University',
                userId: testUserId,
                level: testLevelId,
                startDate: new Date('2023-09-01'),
                endDate: new Date('2026-06-01'),
                currentGrade: 85.5,
                targetGrade: 90,
                predictedGrade: 87.2,
                inProgress: true,
            };
            const createdQualification =
                await addQualification(testQualification);
            const updates = {
                name: 'Updated Integration Test Qualification',
                currentGrade: 88.0,
                targetGrade: 92,
                inProgress: false,
                endDate: new Date('2025-12-15'),
            };
            const updatedQualification = await updateQualification(
                createdQualification.id,
                updates
            );
            expect(updatedQualification.id).toBe(createdQualification.id);
            expect(updatedQualification.name).toBe(
                'Updated Integration Test Qualification'
            );
            expect(updatedQualification.currentGrade).toBe(88.0);
            expect(updatedQualification.targetGrade).toBe(92);
            expect(updatedQualification.inProgress).toBe(false);
            const qualifications = await getQualifications(testUserId);
            const updated = qualifications.find(
                (q) => q.id === createdQualification.id
            );
            expect(updated).toBeDefined();
            if (!updated) throw new Error('Updated qualification not found');
            expect(updated?.name).toBe(
                'Updated Integration Test Qualification'
            );
            expect(updated?.currentGrade).toBe(88.0);
            await pool.query('DELETE FROM qualifications WHERE id = $1', [
                createdQualification.id,
            ]);
        });

        it('should delete a qualification from real database', async () => {
            const { addQualification, deleteQualification, getQualifications } =
                await import('@/lib/server/qualifications');
            const testQualification = {
                name: 'Integration Test Qualification',
                institution: 'Test University',
                userId: testUserId,
                level: testLevelId,
                startDate: new Date('2023-09-01'),
                endDate: new Date('2026-06-01'),
                currentGrade: 85.5,
                targetGrade: 90,
                predictedGrade: 87.2,
                inProgress: true,
            };
            const createdQualification =
                await addQualification(testQualification);
            const deleted = await deleteQualification(
                createdQualification.id,
                testUserId
            );
            expect(deleted).toBe(true);
            const qualifications = await getQualifications(testUserId);
            const found = qualifications.find(
                (q) => q.id === createdQualification.id
            );
            expect(found).toBeUndefined();
        });
    });
});
