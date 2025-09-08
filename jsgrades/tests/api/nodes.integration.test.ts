import { StubUtility, TestContext } from '../StubUtility';
import { jest } from '@jest/globals';
import * as authModule from '@/lib/server/auth';
import { Node } from '@/types/qualificationNode';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/nodes/route';

jest.mock('@/lib/server/auth');

const mockValidateAuth = jest.mocked(authModule.validateAuth);

const mockNextResponse = {
    json: jest.fn((data: unknown, init?: { status?: number }) => ({
        json: async () => data,
        status: init?.status || 200,
    })),
};

jest.mock('next/server', () => ({
    NextResponse: mockNextResponse,
}));

describe('POST /api/nodes', () => {
    let stubUtil: StubUtility;
    let testContext: TestContext;

    beforeAll(async () => {
        stubUtil = await StubUtility.create();
        testContext = await stubUtil.getTestContext({
            userId: '11111111-1111-1111-1111-111111111111',
            userName: 'testuser1',
            qualificationName: 'Computer Science BSc',
        });

        mockValidateAuth.mockResolvedValue({
            id: testContext.userId,
            email: 'test@example.com',
            uid: testContext.userId,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await stubUtil.cleanup();
    });

    const createMockRequest = (body: Partial<Node>): Partial<NextRequest> => ({
        json: () => Promise.resolve(body),
        headers: {
            get: (h: string) =>
                h === 'Authorization' ? 'Bearer validtoken' : null,
            append: jest.fn(),
            delete: jest.fn(),
            forEach: jest.fn(),
            has: jest.fn().mockReturnValue(true),
            set: jest.fn(),
            entries: jest.fn().mockReturnValue([]),
            keys: jest.fn().mockReturnValue([]),
            values: jest.fn().mockReturnValue([]),
            [Symbol.iterator]: jest.fn(),
            getSetCookie: jest.fn().mockReturnValue([]),
        } as Headers,
    });

    describe('Authentication', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockValidateAuth.mockResolvedValueOnce(null);
            const req = createMockRequest({
                parentId: testContext.qualificationId,
                type: 'year',
                name: 'Year 1',
                qualificationId: testContext.qualificationId,
            });

            const response = await POST(req as NextRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.status).toBe('error');
            expect(data.message).toBe('Unauthorized');
        });
    });

    // Add other test cases here
});
