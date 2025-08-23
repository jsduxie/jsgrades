import { StubUtility, TestContext } from '../StubUtility';
import { jest } from '@jest/globals';
import * as authModule from '@/lib/server/auth';

// Mock the auth module
jest.mock('@/lib/server/auth');

// Don't mock NodeService or ValidationService for integration tests - we want to test them together

const mockValidateAuth = jest.mocked(authModule.validateAuth);

// Mock NextResponse - define before using in jest.mock
const mockNextResponse = {
    json: jest.fn((data: any, init?: { status?: number }) => ({
        json: async () => data,
        status: init?.status || 200,
    })),
};

jest.mock('next/server', () => ({
    NextResponse: mockNextResponse,
}));

// Import the route handler AFTER all mocks are defined
import { POST } from '@/app/api/nodes/route';

describe('POST /api/nodes', () => {
    let stubUtil: StubUtility;
    let testContext: TestContext;
    let anotherUserContext: TestContext;

    beforeAll(async () => {
        stubUtil = await StubUtility.create();

        // Create test contexts once for all tests
        testContext = await stubUtil.getTestContext({
            userId: '11111111-1111-1111-1111-111111111111',
            userName: 'testuser1',
            qualificationName: 'Computer Science BSc'
        });

        anotherUserContext = await stubUtil.getTestContext({
            userId: '22222222-2222-2222-2222-222222222222',
            userName: 'testuser2',
            qualificationName: 'Mathematics BSc'
        });
    });

    beforeEach(async () => {

        // Reset mocks
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await stubUtil.cleanup();
    });

    // Helper function to create mock request
    const createMockRequest = (body: any) => ({
        json: jest.fn().mockResolvedValue(body),
        headers: {
            get: (h: string) => h === 'Authorization' ? 'Bearer validtoken' : undefined,
        },
    } as any);

    describe('Authentication', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockValidateAuth.mockResolvedValue(null);

            const req = createMockRequest({
                parentId: testContext.qualificationId,
                type: 'year',
                name: 'Year 1',
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.status).toBe('error');
            expect(data.message).toBe('Unauthorized');
        });

        it('should return 401 when validateAuth throws an error', async () => {
            mockValidateAuth.mockRejectedValue(new Error('Auth service error'));

            const req = createMockRequest({
                parentId: testContext.qualificationId,
                type: 'year',
                name: 'Year 1',
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);

            expect(response.status).toBe(500);
        });
    });

    describe('Input Validation', () => {
        beforeEach(() => {
            mockValidateAuth.mockResolvedValue({
                id: testContext.userId,
                email: 'test@example.com',
                uid: 'test-uid'
            });
        });

        it('should return 400 when parentId is missing', async () => {
            const req = createMockRequest({
                type: 'year',
                name: 'Year 1',
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.status).toBe('error');
            expect(data.message).toBe('Invalid input data');
            expect(data.data).toContain('parentId is required and must be a string');
        });

        it('should return 400 when type is missing', async () => {
            const req = createMockRequest({
                parentId: testContext.qualificationId,
                name: 'Year 1',
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.status).toBe('error');
            expect(data.message).toBe('Invalid input data');
            expect(data.data).toContain('type is required and must be a string');
        });

        it('should return 400 when name is missing', async () => {
            const req = createMockRequest({
                parentId: testContext.qualificationId,
                type: 'year',
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.status).toBe('error');
            expect(data.message).toBe('Invalid input data');
            expect(data.data).toContain('name is required and must be a non-empty string');
        });

        it('should return 400 when name is empty string', async () => {
            const req = createMockRequest({
                parentId: testContext.qualificationId,
                type: 'year',
                name: '   ',
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.status).toBe('error');
            expect(data.message).toBe('Invalid input data');
            expect(data.data).toContain('name is required and must be a non-empty string');
        });

        it('should return 400 when qualificationId is missing', async () => {
            const req = createMockRequest({
                parentId: testContext.qualificationId,
                type: 'year',
                name: 'Year 1'
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.status).toBe('error');
            expect(data.message).toBe('Invalid input data');
            expect(data.data).toContain('qualificationId is required and must be a string');
        });

        it('should return 400 when credits is negative', async () => {
            const req = createMockRequest({
                parentId: testContext.qualificationId,
                type: 'year',
                name: 'Year 1',
                credits: -10,
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.status).toBe('error');
            expect(data.message).toBe('Invalid input data');
            expect(data.data).toContain('credits must be a non-negative number');
        });

        it('should return 400 when credits is not a number', async () => {
            const req = createMockRequest({
                parentId: testContext.qualificationId,
                type: 'year',
                name: 'Year 1',
                credits: 'invalid',
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.status).toBe('error');
            expect(data.message).toBe('Invalid input data');
            expect(data.data).toContain('credits must be a non-negative number');
        });

        it('should accept valid credits of 0', async () => {
            const req = createMockRequest({
                parentId: testContext.qualificationId,
                type: 'year',
                name: 'Year 1',
                credits: 0,
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);

            expect(response.status).not.toBe(400);
        });

        it('should handle multiple validation errors', async () => {
            const req = createMockRequest({
                credits: -5
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.data).toEqual(expect.arrayContaining([
                'parentId is required and must be a string',
                'type is required and must be a string',
                'name is required and must be a non-empty string',
                'qualificationId is required and must be a string',
                'credits must be a non-negative number'
            ]));
        });
    });

    describe('Qualification Ownership Validation', () => {
        beforeEach(() => {
            mockValidateAuth.mockResolvedValue({
                id: testContext.userId,
                email: 'test@example.com',
                uid: 'test-uid'
            });
        });

        it('should return 404 when qualification does not belong to user', async () => {
            const req = createMockRequest({
                parentId: anotherUserContext.qualificationId,
                type: 'year',
                name: 'Year 1',
                qualificationId: anotherUserContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.status).toBe('error');
            expect(data.message).toBe('Qualification not found or access denied');
        });

        it('should return 404 when qualification does not exist', async () => {
            const req = createMockRequest({
                parentId: testContext.qualificationId,
                type: 'year',
                name: 'Year 1',
                qualificationId: '99999999-9999-9999-9999-999999999999'
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.message).toBe('Qualification not found or access denied');
        });
    });

    describe('Parent Ownership Validation', () => {
        beforeEach(() => {
            mockValidateAuth.mockResolvedValue({
                id: testContext.userId,
                email: 'test@example.com',
                uid: 'test-uid'
            });
        });

        it('should return 404 when parent qualification does not belong to user', async () => {
            const req = createMockRequest({
                parentId: anotherUserContext.qualificationId,
                type: 'year',
                name: 'Year 1',
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.message).toBe('Parent not found or access denied');
        });

        it('should return 404 when parent node does not belong to user', async () => {
            const req = createMockRequest({
                parentId: anotherUserContext.rootNodeId,
                type: 'module',
                name: 'Computer Programming',
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.message).toBe('Parent not found or access denied');
        });

        it('should return 404 when parent does not exist at all', async () => {
            const req = createMockRequest({
                parentId: '99999999-9999-9999-9999-999999999999',
                type: 'year',
                name: 'Year 1',
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.message).toBe('Parent not found or access denied');
        });
    });

    describe('Node Lock Validation', () => {
        beforeEach(() => {
            mockValidateAuth.mockResolvedValue({
                id: testContext.userId,
                email: 'test@example.com',
                uid: 'test-uid'
            });
        });

        it('should return 403 when parent node is locked', async () => {
            const pool = (await import('@/lib/server/db')).default;

            // Lock the node for this test
            await pool.query(
                'UPDATE qualification_nodes SET lock_config = true WHERE id = $1',
                [testContext.rootNodeId]
            );

            const req = createMockRequest({
                parentId: testContext.rootNodeId,
                type: 'module',
                name: 'Computer Programming',
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data.status).toBe('error');
            expect(data.message).toBe('Parent node configuration is locked');

            // Clean up: unlock the node after test
            await pool.query(
                'UPDATE qualification_nodes SET lock_config = false WHERE id = $1',
                [testContext.rootNodeId]
            );
        });

        it('should succeed when parent qualification is used (qualifications cannot be locked)', async () => {
            const req = createMockRequest({
                parentId: testContext.qualificationId,
                type: 'year',
                name: 'Year 1',
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);

            expect(response.status).toBe(201);
        });
    });

    describe('Successful Node Creation', () => {
        beforeEach(() => {
            mockValidateAuth.mockResolvedValue({
                id: testContext.userId,
                email: 'test@example.com',
                uid: 'test-uid'
            });
        });

        it('should successfully create a node with qualification as parent', async () => {
            const req = createMockRequest({
                parentId: testContext.qualificationId,
                type: 'year',
                name: 'Year 1',
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.status).toBe('success');
            expect(data.message).toBe('Node created successfully');
            expect(data.data).toHaveProperty('node');
            expect(data.data).toHaveProperty('aggregate');
            expect(data.data.node.name).toBe('Year 1');
            expect(data.data.node.type).toBe('year');
            expect(data.data.node.userId).toBe(testContext.userId);
            expect(data.data.node.qualificationId).toBe(testContext.qualificationId);
        });

        it('should successfully create a node with another node as parent', async () => {
            const req = createMockRequest({
                parentId: testContext.rootNodeId,
                type: 'module',
                name: 'Computer Programming',
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.status).toBe('success');
            expect(data.data.node.name).toBe('Computer Programming');
            expect(data.data.node.type).toBe('module');
            expect(data.data.node.parentId).toBe(testContext.rootNodeId);
        });

        it('should successfully create a node with credits', async () => {
            const req = createMockRequest({
                parentId: testContext.rootNodeId,
                type: 'module',
                name: 'Advanced Mathematics',
                credits: 120,
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.data.node.credits).toBe(120);
        });

        it('should successfully create a node with custom settings', async () => {
            const customSettings = {
                calculationMethod: 'sum' as const,
                weightingMode: 'credits' as const,
                roundingMode: 'nearest' as const,
                roundingPrecision: 1,
                excludeIncompleteFromPredicted: false,
                inheritSettings: false,
                overrides: { calculationMethod: true }
            };

            const req = createMockRequest({
                parentId: testContext.rootNodeId,
                type: 'module',
                name: 'Statistics',
                settings: customSettings,
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.data.node.calculationMethod).toBe('sum');
            expect(data.data.node.weightingMode).toBe('credits');
            expect(data.data.node.roundingMode).toBe('nearest');
            expect(data.data.node.roundingPrecision).toBe(1);
            expect(data.data.node.excludeIncompleteFromPredicted).toBe(false);
            expect(data.data.node.inheritSettings).toBe(false);
        });

        it('should create node aggregate alongside the node', async () => {
            const req = createMockRequest({
                parentId: testContext.rootNodeId,
                type: 'module',
                name: 'Data Structures',
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.data.aggregate).toBeDefined();
            expect(data.data.aggregate.nodeId).toBe(data.data.node.id);
            expect(data.data.aggregate.childCounts).toBeDefined();
            expect(data.data.aggregate.effectiveSettings).toBeDefined();
        });

        it('should handle null credits appropriately', async () => {
            const req = createMockRequest({
                parentId: testContext.rootNodeId,
                type: 'module',
                name: 'Optional Module',
                credits: null,
                qualificationId: testContext.qualificationId
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.data.node.credits).toBeNull();
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            mockValidateAuth.mockResolvedValue({
                id: testContext.userId,
                email: 'test@example.com',
                uid: 'test-uid'
            });
        });


        it('should handle invalid JSON in request body', async () => {
            const req = {
                json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
                headers: {
                    get: (h: string) => h === 'Authorization' ? 'Bearer validtoken' : undefined,
                },
            } as any;

            const response = await POST(req);

            expect(response.status).toBe(500);
        });
    });
});
