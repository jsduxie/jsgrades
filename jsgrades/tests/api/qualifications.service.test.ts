const mockQuery = jest.fn();
const mockPool = {
    query: mockQuery,
};

jest.mock('@/lib/server/db', () => mockPool);

import {
    addQualification,
    getQualifications,
    getQualificationLevels,
} from '@/lib/server/qualifications';

describe('Qualifications Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    describe('getQualificationLevels', () => {
        it('should fetch qualification levels successfully', async () => {
            const mockLevels = [
                { id: '1', name: 'Certificate', level: 1 },
                { id: '2', name: 'Diploma', level: 2 },
                { id: '3', name: 'Bachelor', level: 3 },
                { id: '4', name: 'Master', level: 4 },
                { id: '5', name: 'PhD', level: 5 },
            ];

            mockQuery.mockResolvedValue({ rows: mockLevels });

            const result = await getQualificationLevels();

            expect(result).toEqual(mockLevels);
            expect(mockQuery).toHaveBeenCalledWith(
                'SELECT id, name, level FROM qualification_levels ORDER BY level ASC'
            );
        });

        it('should handle database errors in getQualificationLevels', async () => {
            mockQuery.mockRejectedValue(
                new Error('Database connection failed')
            );

            await expect(getQualificationLevels()).rejects.toThrow(
                'Database connection failed'
            );
        });
    });

    describe('addQualification', () => {
        const mockNewQualification = {
            userId: 'user123',
            level: 'Bachelor',
            name: 'Computer Science',
            institution: 'Test University',
            startDate: new Date('2023-09-01'),
            endDate: new Date('2026-06-01'),
            currentGrade: 85,
            targetGrade: 90,
            predictedGrade: 87,
            inProgress: true,
        };

        const mockSavedQualification = {
            id: 'qual123',
            ...mockNewQualification,
            created: new Date(),
            updated: new Date(),
        };

        it('should add a new qualification successfully', async () => {
            mockQuery.mockResolvedValue({ rows: [mockSavedQualification] });

            const result = await addQualification(mockNewQualification);

            expect(result).toEqual(mockSavedQualification);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO qualifications'),
                [
                    'user123',
                    'Bachelor',
                    'Computer Science',
                    'Test University',
                    new Date('2023-09-01'),
                    new Date('2026-06-01'),
                    85,
                    90,
                    87,
                    true,
                ]
            );
        });

        it('should handle qualification with minimal data', async () => {
            const minimalQualification = {
                userId: 'user123',
                level: 'Certificate',
                name: 'Basic Course',
                institution: 'Online University',
            };

            const mockMinimalSaved = {
                id: 'qual456',
                ...minimalQualification,
                startDate: expect.any(Date),
                endDate: expect.any(Date),
                currentGrade: null,
                targetGrade: null,
                predictedGrade: null,
                inProgress: true,
                created: new Date(),
                updated: new Date(),
            };

            mockQuery.mockResolvedValue({ rows: [mockMinimalSaved] });

            const result = await addQualification(minimalQualification);

            expect(result).toEqual(mockMinimalSaved);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO qualifications'),
                [
                    'user123',
                    'Certificate',
                    'Basic Course',
                    'Online University',
                    expect.any(Date),
                    expect.any(Date),
                    null,
                    null,
                    null,
                    true,
                ]
            );
        });

        it('should handle database errors in addQualification', async () => {
            mockQuery.mockRejectedValue(new Error('Constraint violation'));

            await expect(
                addQualification(mockNewQualification)
            ).rejects.toThrow('Constraint violation');
        });
    });

    describe('getQualifications', () => {
        const userId = 'user123';
        const mockQualifications = [
            {
                id: 'qual1',
                userId: 'user123',
                level: 'Bachelor',
                name: 'Computer Science',
                institution: 'Tech University',
                startDate: new Date('2023-09-01'),
                endDate: new Date('2026-06-01'),
                currentGrade: 85,
                targetGrade: 90,
                predictedGrade: 87,
                inProgress: true,
                created: new Date(),
                updated: new Date(),
            },
            {
                id: 'qual2',
                userId: 'user123',
                level: 'Master',
                name: 'Software Engineering',
                institution: 'Advanced Institute',
                startDate: new Date('2024-09-01'),
                endDate: new Date('2025-12-01'),
                currentGrade: null,
                targetGrade: 85,
                predictedGrade: null,
                inProgress: false,
                created: new Date(),
                updated: new Date(),
            },
        ];

        it('should fetch qualifications for a user successfully', async () => {
            mockQuery.mockResolvedValue({ rows: mockQualifications });

            const result = await getQualifications(userId);

            expect(result).toEqual(mockQualifications);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [userId]
            );
        });

        it('should return empty array when user has no qualifications', async () => {
            mockQuery.mockResolvedValue({ rows: [] });

            const result = await getQualifications('user456');

            expect(result).toEqual([]);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                ['user456']
            );
        });

        it('should handle database errors in getQualifications', async () => {
            mockQuery.mockRejectedValue(new Error('Connection timeout'));
            await expect(getQualifications(userId)).rejects.toThrow(
                'Connection timeout'
            );
        });
    });

    describe('SQL Query Validation', () => {
        it('should use correct SQL for qualification insertion', async () => {
            const qualification = {
                userId: 'test-user',
                level: 'Test Level',
                name: 'Test Name',
                institution: 'Test Institution',
            };

            mockQuery.mockResolvedValue({ rows: [{ id: 'test-id' }] });

            await addQualification(qualification);

            const [query, values] = mockQuery.mock.calls[0];
            expect(query).toMatch(/INSERT INTO qualifications/);
            expect(query).toMatch(
                /user_id[\s\S]*level[\s\S]*name[\s\S]*institution/
            );
            expect(query).toMatch(/RETURNING/);
            expect(values).toHaveLength(10);
        });

        it('should use correct SQL for qualification retrieval', async () => {
            mockQuery.mockResolvedValue({ rows: [] });
            await getQualifications('test-user');
            const [query, values] = mockQuery.mock.calls[0];
            expect(query).toMatch(/SELECT[\s\S]*FROM qualifications/);
            expect(query).toMatch(/WHERE user_id = \$1/);
            expect(query).toMatch(/ORDER BY start_date DESC/);
            expect(values).toEqual(['test-user']);
        });
    });
});
