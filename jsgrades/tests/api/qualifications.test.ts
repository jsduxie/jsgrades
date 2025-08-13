const mockAddQualification = jest.fn();
const mockGetQualifications = jest.fn();

jest.mock('@/lib/server/qualifications', () => ({
    addQualification: mockAddQualification,
    getQualifications: mockGetQualifications,
}));

const mockNextResponse = {
    json: jest.fn((data: any, init?: { status?: number }) => ({
        json: async () => data,
        status: init?.status || 200,
    })),
};

jest.mock('next/server', () => ({
    NextResponse: mockNextResponse,
}));

import { POST, GET } from '@/app/api/qualifications/route';

describe('Qualifications API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    describe('POST /api/qualifications', () => {
        const validRequestBody = {
            name: 'Computer Science Degree',
            institution: 'University of Technology',
            userId: 'user123',
            level: 'Bachelor',
            startDate: '2023-09-01',
            endDate: '2026-06-01',
            currentGrade: 85,
            targetGrade: 90,
            predictedGrade: 87,
            inProgress: true,
        };

        const mockSavedQualification = {
            id: 'qual123',
            userId: 'user123',
            level: 'Bachelor',
            name: 'Computer Science Degree',
            institution: 'University of Technology',
            startDate: new Date('2023-09-01'),
            endDate: new Date('2026-06-01'),
            currentGrade: 85,
            targetGrade: 90,
            predictedGrade: 87,
            inProgress: true,
            created: new Date(),
            updated: new Date(),
        };

        it('should create a qualification successfully with all fields', async () => {
            mockAddQualification.mockResolvedValue(mockSavedQualification);
            const mockRequest = {
                json: jest.fn().mockResolvedValue(validRequestBody),
            } as any;

            const response = await POST(mockRequest);
            const responseData = await response.json();

            expect(response.status).toBe(201);
            expect(responseData.status).toBe('success');
            expect(responseData.message).toBe('Qualification saved');
            expect(responseData.data).toEqual(mockSavedQualification);
            expect(mockAddQualification).toHaveBeenCalledWith({
                userId: 'user123',
                level: 'Bachelor',
                name: 'Computer Science Degree',
                institution: 'University of Technology',
                startDate: new Date('2023-09-01'),
                endDate: null,
                currentGrade: 85,
                targetGrade: 90,
                predictedGrade: 87,
                inProgress: true,
            });
        });

        it('should create a qualification with minimal required fields', async () => {
            const minimalBody = {
                name: 'Basic Course',
                institution: 'Online University',
                userId: 'user123',
                level: 'Certificate',
            };

            const mockMinimalQualification = {
                ...mockSavedQualification,
                name: 'Basic Course',
                institution: 'Online University',
                level: 'Certificate',
            };

            mockAddQualification.mockResolvedValue(mockMinimalQualification);
            const mockRequest = {
                json: jest.fn().mockResolvedValue(minimalBody),
            } as any;

            const response = await POST(mockRequest);
            const responseData = await response.json();

            expect(response.status).toBe(201);
            expect(responseData.status).toBe('success');
            expect(mockAddQualification).toHaveBeenCalledWith({
                userId: 'user123',
                level: 'Certificate',
                name: 'Basic Course',
                institution: 'Online University',
                startDate: null,
                endDate: null,
                currentGrade: undefined,
                targetGrade: undefined,
                predictedGrade: undefined,
                inProgress: true,
            });
        });

        it('should return 400 error when required fields are missing', async () => {
            const incompleteBody = {
                name: 'Incomplete Course',
            };

            const mockRequest = {
                json: jest.fn().mockResolvedValue(incompleteBody),
            } as any;

            const response = await POST(mockRequest);
            const responseData = await response.json();

            expect(response.status).toBe(400);
            expect(responseData.status).toBe('error');
            expect(responseData.message).toBe('Missing required fields');
            expect(mockAddQualification).not.toHaveBeenCalled();
        });

        it('should return 500 error when database operation fails', async () => {
            mockAddQualification.mockRejectedValue(new Error('Database error'));
            const mockRequest = {
                json: jest.fn().mockResolvedValue(validRequestBody),
            } as any;

            const response = await POST(mockRequest);
            const responseData = await response.json();

            expect(response.status).toBe(500);
            expect(responseData.status).toBe('error');
            expect(responseData.message).toBe('Failed to create qualification');
        });

        it('should handle JSON parsing errors', async () => {
            const mockRequest = {
                json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
            } as any;

            const response = await POST(mockRequest);
            const responseData = await response.json();

            expect(response.status).toBe(500);
            expect(responseData.status).toBe('error');
            expect(responseData.message).toBe('Failed to create qualification');
        });
    });

    describe('GET /api/qualifications', () => {
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
                startDate: new Date('2026-09-01'),
                endDate: new Date('2027-12-01'),
                currentGrade: null,
                targetGrade: 85,
                predictedGrade: null,
                inProgress: false,
                created: new Date(),
                updated: new Date(),
            },
        ];

        it('should fetch qualifications successfully for valid userId', async () => {
            const userId = 'user123';
            mockGetQualifications.mockResolvedValue(mockQualifications);

            const mockRequest = {
                url: `http://localhost:3000/api/qualifications?userId=${userId}`,
            } as any;

            const response = await GET(mockRequest);
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData.status).toBe('success');
            expect(responseData.message).toBe('Qualifications fetched');
            expect(responseData.data).toEqual(mockQualifications);
            expect(mockGetQualifications).toHaveBeenCalledWith(userId);
        });

        it('should return empty array when user has no qualifications', async () => {
            const userId = 'user456';
            mockGetQualifications.mockResolvedValue([]);

            const mockRequest = {
                url: `http://localhost:3000/api/qualifications?userId=${userId}`,
            } as any;

            const response = await GET(mockRequest);
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData.status).toBe('success');
            expect(responseData.data).toEqual([]);
        });

        it('should return 400 error when userId is missing', async () => {
            const mockRequest = {
                url: 'http://localhost:3000/api/qualifications',
            } as any;

            const response = await GET(mockRequest);
            const responseData = await response.json();

            expect(response.status).toBe(400);
            expect(responseData.status).toBe('error');
            expect(responseData.message).toBe('Missing userId');
            expect(mockGetQualifications).not.toHaveBeenCalled();
        });

        it('should return 400 error when userId is empty string', async () => {
            const mockRequest = {
                url: 'http://localhost:3000/api/qualifications?userId=',
            } as any;

            const response = await GET(mockRequest);
            const responseData = await response.json();

            expect(response.status).toBe(400);
            expect(responseData.status).toBe('error');
            expect(responseData.message).toBe('Missing userId');
        });

        it('should return 500 error when database operation fails', async () => {
            const userId = 'user123';
            mockGetQualifications.mockRejectedValue(
                new Error('Database query failed')
            );

            const mockRequest = {
                url: `http://localhost:3000/api/qualifications?userId=${userId}`,
            } as any;

            const response = await GET(mockRequest);
            const responseData = await response.json();

            expect(response.status).toBe(500);
            expect(responseData.status).toBe('error');
            expect(responseData.message).toBe('Failed to fetch qualifications');
        });
    });
});
