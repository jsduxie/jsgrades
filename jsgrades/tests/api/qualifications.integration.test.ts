import { v4 as uuidv4 } from 'uuid';

const originalEnv = process.env;

describe('Qualifications API Integration Tests', () => {
    beforeAll(async () => {
        if (!process.env.DATABASE_URL_DEV) {
            throw new Error(
                'DATABASE_URL_DEV not found in environment variables. Make sure .env.local is loaded.'
            );
        }

        try {
            const pool = (await import('@/lib/server/db')).default;
            const result = await pool.query('SELECT 1 as test');
            if (result.rows[0].test !== 1) {
                throw new Error('Database connection test failed');
            }
        } catch (error) {
            console.warn('Database connection test failed:', error);
            throw error;
        }

        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterAll(async () => {
        process.env = originalEnv;

        try {
            const pool = (await import('@/lib/server/db')).default;
            await pool.end();
        } catch (error) {
            console.warn('Error closing database connection:', error);
        }
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
            expect(process.env.DATABASE_URL_DEV).toContain('postgresql://');

            if (process.env.DATABASE_URL_DEV?.includes('neon')) {
                expect(process.env.DATABASE_URL_DEV).toMatch(
                    /neon\.tech|neon\.database/
                );
            }
        });
    });

    describe('Qualifications CRUD Operations with Real Database', () => {
        const testUserId = uuidv4();
        let testQualificationId: string;
        let testLevelId: string;

        beforeAll(async () => {
            const pool = (await import('@/lib/server/db')).default;
            await pool.query(
                `
                INSERT INTO users (id, uid, email, first_name, last_name) 
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (uid) DO NOTHING
            `,
                [
                    testUserId,
                    `test-${testUserId}`,
                    `test-${testUserId}@example.com`,
                    'Test',
                    'User',
                ]
            );

            const { getQualificationLevels } = await import(
                '@/lib/server/qualifications'
            );
            const levels = await getQualificationLevels();
            if (levels.length === 0) {
                const levelResult = await pool.query(
                    `
                    INSERT INTO qualification_levels (name, level) 
                    VALUES ($1, $2) 
                    ON CONFLICT (name) DO UPDATE SET level = EXCLUDED.level
                    RETURNING id
                `,
                    ['Bachelor', 6]
                );
                testLevelId = levelResult.rows[0].id;
            } else {
                testLevelId = levels[0].id;
            }
        });

        afterAll(async () => {
            try {
                const pool = (await import('@/lib/server/db')).default;
                await pool.query(
                    'DELETE FROM qualifications WHERE user_id = $1',
                    [testUserId]
                );
                await pool.query('DELETE FROM users WHERE id = $1', [
                    testUserId,
                ]);
            } catch (error) {}
        });

        it('should read qualification levels from database', async () => {
            const { getQualificationLevels } = await import(
                '@/lib/server/qualifications'
            );

            const levels = await getQualificationLevels();
            expect(levels).toBeDefined();
            expect(Array.isArray(levels)).toBe(true);

            if (levels.length > 0) {
                expect(levels[0]).toHaveProperty('id');
                expect(levels[0]).toHaveProperty('name');
                expect(levels[0]).toHaveProperty('level');
                expect(typeof levels[0].level).toBe('number');
            }
        });

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
            testQualificationId = createdQualification.id;

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
        });

        it('should read qualifications from real database', async () => {
            const { getQualifications } = await import(
                '@/lib/server/qualifications'
            );

            const qualifications = await getQualifications(testUserId);
            expect(qualifications).toBeDefined();
            expect(Array.isArray(qualifications)).toBe(true);
            expect(qualifications.length).toBeGreaterThan(0);

            const qualification = qualifications[0];
            expect(qualification.name).toBe('Integration Test Qualification');
            expect(qualification.institution).toBe('Test University');
            expect(qualification.userId).toBe(testUserId);
        });

        it('should update a qualification in real database', async () => {
            const { updateQualification, getQualifications } = await import(
                '@/lib/server/qualifications'
            );

            const updates = {
                name: 'Updated Integration Test Qualification',
                currentGrade: 88.0,
                targetGrade: 92,
                inProgress: false,
                endDate: new Date('2025-12-15'),
            };

            const updatedQualification = await updateQualification(
                testQualificationId,
                updates
            );

            expect(updatedQualification.id).toBe(testQualificationId);
            expect(updatedQualification.name).toBe(
                'Updated Integration Test Qualification'
            );
            expect(updatedQualification.currentGrade).toBe(88.0);
            expect(updatedQualification.targetGrade).toBe(92);
            expect(updatedQualification.inProgress).toBe(false);

            const qualifications = await getQualifications(testUserId);
            const updated = qualifications.find(
                (q) => q.id === testQualificationId
            );
            expect(updated?.name).toBe(
                'Updated Integration Test Qualification'
            );
            expect(updated?.currentGrade).toBe(88.0);
        });

        it('should delete a qualification from real database', async () => {
            const { deleteQualification, getQualifications } = await import(
                '@/lib/server/qualifications'
            );

            const deleted = await deleteQualification(
                testQualificationId,
                testUserId
            );
            expect(deleted).toBe(true);

            const qualifications = await getQualifications(testUserId);
            const found = qualifications.find(
                (q) => q.id === testQualificationId
            );
            expect(found).toBeUndefined();
        });

        it('should handle invalid qualification operations', async () => {
            const { updateQualification, deleteQualification } = await import(
                '@/lib/server/qualifications'
            );

            const nonExistentId = uuidv4();
            await expect(
                updateQualification(nonExistentId, { name: 'Test' })
            ).rejects.toThrow('not found');

            const wrongUserId = uuidv4();
            const result = await deleteQualification(
                nonExistentId,
                wrongUserId
            );
            expect(result).toBe(false);
        });
    });
});
