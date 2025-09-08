import '@jest/globals';
import { ValidationService } from '@/lib/server/ValidationService';
import { StubUtility, TestContext } from '@/tests/StubUtility';

let stubUtil: StubUtility;
let ctx: TestContext;

jest.setTimeout(30000);

describe('ValidationService', () => {
    beforeAll(async () => {
        stubUtil = await StubUtility.create();
        ctx = await stubUtil.getTestContext();
    });

    afterAll(async () => {
        await stubUtil.cleanup();
    });

    describe('validateQualificationOwnership', () => {
        it('should return true when qualification belongs to user', async () => {
            const result =
                await ValidationService.validateQualificationOwnership(
                    ctx.qualificationId,
                    ctx.userId
                );
            expect(result).toBe(true);
        });

        it('should return false when qualification does not belong to user', async () => {
            const otherUserId = '22222222-2222-2222-2222-222222222222';
            const result =
                await ValidationService.validateQualificationOwnership(
                    ctx.qualificationId,
                    otherUserId
                );
            expect(result).toBe(false);
        });

        it('should return false when qualification does not exist', async () => {
            const nonExistentId = '99999999-9999-9999-9999-999999999999';
            const result =
                await ValidationService.validateQualificationOwnership(
                    nonExistentId,
                    ctx.userId
                );
            expect(result).toBe(false);
        });

        it('should handle database errors gracefully', async () => {
            // Test with malformed UUID to trigger database error
            const result =
                await ValidationService.validateQualificationOwnership(
                    'invalid-uuid',
                    ctx.userId
                );
            expect(result).toBe(false);
        });
    });

    describe('validateNodeOwnership', () => {
        it('should return true when node belongs to user', async () => {
            const result = await ValidationService.validateNodeOwnership(
                ctx.rootNodeId,
                ctx.userId
            );
            expect(result).toBe(true);
        });

        it('should return false when node does not belong to user', async () => {
            const otherUserId = '22222222-2222-2222-2222-222222222222';
            const result = await ValidationService.validateNodeOwnership(
                ctx.rootNodeId,
                otherUserId
            );
            expect(result).toBe(false);
        });

        it('should return false when node does not exist', async () => {
            const nonExistentId = '99999999-9999-9999-9999-999999999999';
            const result = await ValidationService.validateNodeOwnership(
                nonExistentId,
                ctx.userId
            );
            expect(result).toBe(false);
        });

        it('should handle database errors gracefully', async () => {
            const result = await ValidationService.validateNodeOwnership(
                'invalid-uuid',
                ctx.userId
            );
            expect(result).toBe(false);
        });
    });

    describe('validateParentOwnership', () => {
        it('should return valid qualification parent', async () => {
            const result = await ValidationService.validateParentOwnership(
                ctx.qualificationId,
                ctx.userId
            );
            expect(result.isValid).toBe(true);
            expect(result.parentType).toBe('qualification');
        });

        it('should return valid node parent', async () => {
            const result = await ValidationService.validateParentOwnership(
                ctx.rootNodeId,
                ctx.userId
            );
            expect(result.isValid).toBe(true);
            expect(result.parentType).toBe('node');
        });

        it('should return invalid when parent does not belong to user', async () => {
            const otherUserId = '22222222-2222-2222-2222-222222222222';
            const result = await ValidationService.validateParentOwnership(
                ctx.qualificationId,
                otherUserId
            );
            expect(result.isValid).toBe(false);
            expect(result.parentType).toBe(null);
        });

        it('should return invalid when parent does not exist', async () => {
            const nonExistentId = '99999999-9999-9999-9999-999999999999';
            const result = await ValidationService.validateParentOwnership(
                nonExistentId,
                ctx.userId
            );
            expect(result.isValid).toBe(false);
            expect(result.parentType).toBe(null);
        });

        it('should handle database errors gracefully', async () => {
            const result = await ValidationService.validateParentOwnership(
                'invalid-uuid',
                ctx.userId
            );
            expect(result.isValid).toBe(false);
            expect(result.parentType).toBe(null);
        });
    });

    describe('validateNodeNotLocked', () => {
        it('should return true when node is not locked', async () => {
            const result = await ValidationService.validateNodeNotLocked(
                ctx.rootNodeId
            );
            expect(result).toBe(true);
        });

        it('should return false when node does not exist', async () => {
            const nonExistentId = '99999999-9999-9999-9999-999999999999';
            const result =
                await ValidationService.validateNodeNotLocked(nonExistentId);
            expect(result).toBe(false);
        });

        it('should handle database errors gracefully', async () => {
            const result =
                await ValidationService.validateNodeNotLocked('invalid-uuid');
            expect(result).toBe(false);
        });

        it('should return false when node is locked', async () => {
            // First create a locked node for testing
            const lockedNodeResult = await stubUtil.dbClient.query(
                `INSERT INTO qualification_nodes (
                    qualification_id, user_id, parent_id, name, type,
                    calculation_method, weighting_mode, rounding_mode, rounding_precision,
                    exclude_incomplete_from_predicted, inherit_settings, overrides,
                    credit_enforcement, config_status, lock_config
                ) VALUES ($1, $2, $3, 'Locked Node', $4, 'weighted_mean', 'equal', 'none', 2, 
                    TRUE, TRUE, '{}', 'warn', 'partial', TRUE)
                RETURNING id`,
                [
                    ctx.qualificationId,
                    ctx.userId,
                    ctx.rootNodeId,
                    ctx.nodeTypeModuleId,
                ]
            );

            const lockedNodeId = lockedNodeResult.rows[0].id;

            const result =
                await ValidationService.validateNodeNotLocked(lockedNodeId);
            expect(result).toBe(false);

            // Clean up
            await stubUtil.dbClient.query(
                'DELETE FROM qualification_nodes WHERE id = $1',
                [lockedNodeId]
            );
        });
    });

    describe('getQualificationIfOwned', () => {
        it('should return qualification details when owned by user', async () => {
            const result = await ValidationService.getQualificationIfOwned(
                ctx.qualificationId,
                ctx.userId
            );
            expect(result).not.toBeNull();
            expect(result!.id).toBe(ctx.qualificationId);
            expect(result!.userId).toBe(ctx.userId);
            expect(result!.name).toBe('Test Qualification');
        });

        it('should return null when qualification does not belong to user', async () => {
            const otherUserId = '22222222-2222-2222-2222-222222222222';
            const result = await ValidationService.getQualificationIfOwned(
                ctx.qualificationId,
                otherUserId
            );
            expect(result).toBeNull();
        });

        it('should return null when qualification does not exist', async () => {
            const nonExistentId = '99999999-9999-9999-9999-999999999999';
            const result = await ValidationService.getQualificationIfOwned(
                nonExistentId,
                ctx.userId
            );
            expect(result).toBeNull();
        });

        it('should return qualification details when no userId provided (admin check)', async () => {
            const result = await ValidationService.getQualificationIfOwned(
                ctx.qualificationId
            );
            expect(result).not.toBeNull();
            expect(result!.id).toBe(ctx.qualificationId);
            expect(result!.userId).toBe(ctx.userId);
        });

        it('should handle database errors gracefully', async () => {
            const result = await ValidationService.getQualificationIfOwned(
                'invalid-uuid',
                ctx.userId
            );
            expect(result).toBeNull();
        });
    });

    describe('validateNewNodeData', () => {
        it('should pass validation with valid data', () => {
            const validData = {
                parentId: ctx.rootNodeId,
                type: 'module',
                name: 'Test Module',
                qualificationId: ctx.qualificationId,
                credits: 120,
            };

            const result = ValidationService.validateNewNodeData(validData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail validation when parentId is missing', () => {
            const invalidData = {
                type: 'module',
                name: 'Test Module',
                qualificationId: ctx.qualificationId,
            };

            const result = ValidationService.validateNewNodeData(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('parentId is required');
        });

        it('should fail validation when type is missing', () => {
            const invalidData = {
                parentId: ctx.rootNodeId,
                name: 'Test Module',
                qualificationId: ctx.qualificationId,
            };

            const result = ValidationService.validateNewNodeData(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('type is required');
        });

        it('should fail validation when name is missing or empty', () => {
            // Test missing name
            const invalidData1 = {
                parentId: ctx.rootNodeId,
                type: 'module',
                qualificationId: ctx.qualificationId,
            };

            const result1 = ValidationService.validateNewNodeData(invalidData1);
            expect(result1.isValid).toBe(false);
            expect(result1.errors).toContain(
                'name is required and must not be empty'
            );

            // Test empty name
            const invalidData2 = {
                parentId: ctx.rootNodeId,
                type: 'module',
                name: '',
                qualificationId: ctx.qualificationId,
            };

            const result2 = ValidationService.validateNewNodeData(invalidData2);
            expect(result2.isValid).toBe(false);
            expect(result2.errors).toContain(
                'name is required and must not be empty'
            );

            // Test whitespace-only name
            const invalidData3 = {
                parentId: ctx.rootNodeId,
                type: 'module',
                name: '   ',
                qualificationId: ctx.qualificationId,
            };

            const result3 = ValidationService.validateNewNodeData(invalidData3);
            expect(result3.isValid).toBe(false);
            expect(result3.errors).toContain(
                'name is required and must not be empty'
            );
        });

        it('should fail validation when qualificationId is missing', () => {
            const invalidData = {
                parentId: ctx.rootNodeId,
                type: 'module',
                name: 'Test Module',
            };

            const result = ValidationService.validateNewNodeData(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('qualificationId is required');
        });

        it('should fail validation when credits is negative', () => {
            const invalidData = {
                parentId: ctx.rootNodeId,
                type: 'module',
                name: 'Test Module',
                qualificationId: ctx.qualificationId,
                credits: -10,
            };

            const result = ValidationService.validateNewNodeData(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                'credits must be a non-negative number'
            );
        });

        it('should fail validation when credits is not a number', () => {
            const invalidData = {
                parentId: ctx.rootNodeId,
                type: 'module',
                name: 'Test Module',
                qualificationId: ctx.qualificationId,
                credits: 'not-a-number',
            };

            const result = ValidationService.validateNewNodeData(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                'credits must be a non-negative number'
            );
        });

        it('should pass validation with credits as 0', () => {
            const validData = {
                parentId: ctx.rootNodeId,
                type: 'module',
                name: 'Test Module',
                qualificationId: ctx.qualificationId,
                credits: 0,
            };

            const result = ValidationService.validateNewNodeData(validData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should pass validation when credits is null or undefined', () => {
            const validData1 = {
                parentId: ctx.rootNodeId,
                type: 'module',
                name: 'Test Module',
                qualificationId: ctx.qualificationId,
                credits: null,
            };

            const validData2 = {
                parentId: ctx.rootNodeId,
                type: 'module',
                name: 'Test Module',
                qualificationId: ctx.qualificationId,
                credits: undefined,
            };

            const result1 = ValidationService.validateNewNodeData(validData1);
            expect(result1.isValid).toBe(true);
            expect(result1.errors).toHaveLength(0);

            const result2 = ValidationService.validateNewNodeData(validData2);
            expect(result2.isValid).toBe(true);
            expect(result2.errors).toHaveLength(0);
        });

        it('should collect multiple validation errors', () => {
            const invalidData = {
                credits: -50,
            };

            const result = ValidationService.validateNewNodeData(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThanOrEqual(4);
            expect(result.errors).toContain('parentId is required');
            expect(result.errors).toContain('type is required');
            expect(result.errors).toContain(
                'name is required and must not be empty'
            );
            expect(result.errors).toContain('qualificationId is required');
            expect(result.errors).toContain(
                'credits must be a non-negative number'
            );
        });
    });
});
