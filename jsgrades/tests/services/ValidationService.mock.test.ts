import '@jest/globals';
import { ValidationService } from '@/lib/server/ValidationService';

const queryMock = jest.fn();

jest.mock('@/lib/server/db', () => ({
    default: { query: queryMock },
    default: { query: jest.fn() },
const queryMock = (pool as unknown as { query: jest.Mock }).query;

describe('ValidationService (mocked db)', () => {
    beforeEach(() => {
        queryMock.mockReset();
    });

    describe('validateQualificationOwnership', () => {
        it('returns true when qualification is owned by user', async () => {
            queryMock.mockResolvedValueOnce({ rows: [{ id: 'q1' }] });
            await expect(
                ValidationService.validateQualificationOwnership('q1', 'u1')
            ).resolves.toBe(true);
            expect(queryMock).toHaveBeenCalledWith(
                'SELECT id FROM qualifications WHERE id = $1 AND user_id = $2',
                ['q1', 'u1']
            );
        });

        it('returns false when not owned or not found', async () => {
            queryMock.mockResolvedValueOnce({ rows: [] });
            await expect(
                ValidationService.validateQualificationOwnership('qX', 'u1')
            ).resolves.toBe(false);
        });

        it('returns false on query error', async () => {
            queryMock.mockRejectedValueOnce(new Error('db error'));
            await expect(
                ValidationService.validateQualificationOwnership('q1', 'u1')
            ).resolves.toBe(false);
        });
    });

    describe('validateNodeOwnership', () => {
        it('returns true when node is owned by user', async () => {
            queryMock.mockResolvedValueOnce({ rows: [{ id: 'n1' }] });
            await expect(
                ValidationService.validateNodeOwnership('n1', 'u1')
            ).resolves.toBe(true);
            expect(queryMock).toHaveBeenCalledWith(
                'SELECT id FROM qualification_nodes WHERE id = $1 AND user_id = $2',
                ['n1', 'u1']
            );
        });

        it('returns false when not owned, not found, or on error', async () => {
            queryMock.mockResolvedValueOnce({ rows: [] });
            await expect(
                ValidationService.validateNodeOwnership('nX', 'u1')
            ).resolves.toBe(false);

            queryMock.mockRejectedValueOnce(new Error('db error'));
            await expect(
                ValidationService.validateNodeOwnership('n1', 'u1')
            ).resolves.toBe(false);
        });
    });

    describe('validateParentOwnership', () => {
        it('returns qualification parent when qualification matches', async () => {
            queryMock
                .mockResolvedValueOnce({ rows: [{ id: 'q1' }] }) // check qualification
                .mockResolvedValueOnce({ rows: [] }); // not reached ideally

            await expect(
                ValidationService.validateParentOwnership('q1', 'u1')
            ).resolves.toEqual({ isValid: true, parentType: 'qualification' });

            expect(queryMock).toHaveBeenNthCalledWith(
                1,
                'SELECT id FROM qualifications WHERE id = $1 AND user_id = $2',
                ['q1', 'u1']
            );
        });

        it('returns node parent when node matches', async () => {
            queryMock
                .mockResolvedValueOnce({ rows: [] }) // qualification
                .mockResolvedValueOnce({ rows: [{ id: 'n1' }] }); // node

            await expect(
                ValidationService.validateParentOwnership('n1', 'u1')
            ).resolves.toEqual({ isValid: true, parentType: 'node' });

            expect(queryMock).toHaveBeenNthCalledWith(
                2,
                'SELECT id FROM qualification_nodes WHERE id = $1 AND user_id = $2',
                ['n1', 'u1']
            );
        });

        it('returns invalid when neither qualification nor node matches', async () => {
            queryMock
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] });

            await expect(
                ValidationService.validateParentOwnership('x', 'u1')
            ).resolves.toEqual({ isValid: false, parentType: null });
        });

        it('returns invalid on error', async () => {
            queryMock.mockRejectedValueOnce(new Error('db error'));
            await expect(
                ValidationService.validateParentOwnership('x', 'u1')
            ).resolves.toEqual({ isValid: false, parentType: null });
        });
    });

    describe('validateNodeNotLocked', () => {
        it('returns true when node lock_config is false', async () => {
            queryMock.mockResolvedValueOnce({ rows: [{ lock_config: false }] });
            await expect(
                ValidationService.validateNodeNotLocked('n1')
            ).resolves.toBe(true);
            expect(queryMock).toHaveBeenCalledWith(
                'SELECT lock_config FROM qualification_nodes WHERE id = $1',
                ['n1']
            );
        });

        it('returns false when node lock_config is true', async () => {
            queryMock.mockResolvedValueOnce({ rows: [{ lock_config: true }] });
            await expect(
                ValidationService.validateNodeNotLocked('n1')
            ).resolves.toBe(false);
        });

        it('returns false when node not found or on error', async () => {
            queryMock.mockResolvedValueOnce({ rows: [] });
            await expect(
                ValidationService.validateNodeNotLocked('nX')
            ).resolves.toBe(false);

            queryMock.mockRejectedValueOnce(new Error('db error'));
            await expect(
                ValidationService.validateNodeNotLocked('n1')
            ).resolves.toBe(false);
        });
    });

    describe('getQualificationIfOwned', () => {
        it('returns qualification when owned and userId provided', async () => {
            queryMock.mockResolvedValueOnce({
                rows: [{ id: 'q1', user_id: 'u1', name: 'Qual 1' }],
            });
            await expect(
                ValidationService.getQualificationIfOwned('q1', 'u1')
            ).resolves.toEqual({ id: 'q1', userId: 'u1', name: 'Qual 1' });
            expect(queryMock).toHaveBeenCalledWith(
                'SELECT id, user_id, name FROM qualifications WHERE id = $1 AND user_id = $2',
                ['q1', 'u1']
            );
        });

        it('returns qualification when found and userId not provided', async () => {
            queryMock.mockResolvedValueOnce({
                rows: [{ id: 'q2', user_id: 'u2', name: 'Qual 2' }],
            });
            await expect(
                ValidationService.getQualificationIfOwned('q2')
            ).resolves.toEqual({ id: 'q2', userId: 'u2', name: 'Qual 2' });
            expect(queryMock).toHaveBeenCalledWith(
                'SELECT id, user_id, name FROM qualifications WHERE id = $1',
                ['q2']
            );
        });

        it('returns null when not found or on error', async () => {
            queryMock.mockResolvedValueOnce({ rows: [] });
            await expect(
                ValidationService.getQualificationIfOwned('qX', 'u1')
            ).resolves.toBeNull();

            queryMock.mockRejectedValueOnce(new Error('db error'));
            await expect(
                ValidationService.getQualificationIfOwned('q1', 'u1')
            ).resolves.toBeNull();
        });
    });

    describe('validateNewNodeData', () => {
        it('validates required fields and numerical constraints', () => {
            const { isValid, errors } = ValidationService.validateNewNodeData({
                parentId: null,
                type: '',
                name: '   ',
                qualificationId: undefined,
                credits: -5,
                weight: 2,
            });
            expect(isValid).toBe(false);
            expect(errors).toEqual(
                expect.arrayContaining([
                    'parentId is required',
                    'type is required',
                    'name is required and must not be empty',
                    'qualificationId is required',
                    'credits must be a non-negative number',
                    'weight must be between 0 and 1',
                ])
            );
        });

        it('passes for minimal valid data', () => {
            const { isValid, errors } = ValidationService.validateNewNodeData({
                parentId: 'p1',
                type: 'year',
                name: 'Year 1',
                qualificationId: 'q1',
            });
            expect(isValid).toBe(true);
            expect(errors).toHaveLength(0);
        });
    });
});
