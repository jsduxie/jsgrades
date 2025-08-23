import pool from './db';
import type { PoolClient } from 'pg';

export class ValidationService {
    /**
     * Validates that a qualification belongs to the specified user.
     * @param qualificationId The qualification ID to validate
     * @param userId The user ID to check ownership against
     * @returns True if the qualification belongs to the user
     */
    static async validateQualificationOwnership(
        qualificationId: string,
        userId: string
    ): Promise<boolean> {
        try {
            const result = await pool.query(
                'SELECT id FROM qualifications WHERE id = $1 AND user_id = $2',
                [qualificationId, userId]
            );
            const owned = result.rows.length > 0;
            console.log('[ValidationService.validateQualificationOwnership]', { qualificationId, userId, owned });
            return owned;
        } catch (error) {
            console.error('Error validating qualification ownership:', error, { qualificationId, userId });
            return false;
        }
    }

    /**
     * Validates that a node belongs to the specified user.
     * @param nodeId The node ID to validate
     * @param userId The user ID to check ownership against
     * @returns True if the node belongs to the user
     */
    static async validateNodeOwnership(
        nodeId: string,
        userId: string
    ): Promise<boolean> {
        try {
            const result = await pool.query(
                'SELECT id FROM qualification_nodes WHERE id = $1 AND user_id = $2',
                [nodeId, userId]
            );
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error validating node ownership:', error);
            return false;
        }
    }

    /**
     * Validates that a parent ID (either qualification or node) belongs to the user.
     * This is used when creating a new node where parentId could be either.
     * @param parentId The parent ID (qualification or node)
     * @param userId The user ID to check ownership against
     * @returns Object with validation result and parent type
     */
    static async validateParentOwnership(
        parentId: string,
        userId: string
    ): Promise<{ isValid: boolean; parentType: 'qualification' | 'node' | null }> {
        try {
            const qualResult = await pool.query(
                'SELECT id FROM qualifications WHERE id = $1 AND user_id = $2',
                [parentId, userId]
            );
            if (qualResult.rows.length > 0) {
                console.log('[ValidationService.validateParentOwnership] qualification parent', { parentId, userId });
                return { isValid: true, parentType: 'qualification' };
            }

            const nodeResult = await pool.query(
                'SELECT id FROM qualification_nodes WHERE id = $1 AND user_id = $2',
                [parentId, userId]
            );
            if (nodeResult.rows.length > 0) {
                console.log('[ValidationService.validateParentOwnership] node parent', { parentId, userId });
                return { isValid: true, parentType: 'node' };
            }

            console.log('[ValidationService.validateParentOwnership] invalid parent', { parentId, userId });
            return { isValid: false, parentType: null };
        } catch (error) {
            console.error('Error validating parent ownership:', error, { parentId, userId });
            return { isValid: false, parentType: null };
        }
    }

    /**
     * Validates that a node configuration is not locked before allowing modifications.
     * @param nodeId The node ID to check
     * @returns True if the node is not locked
     */
    static async validateNodeNotLocked(nodeId: string): Promise<boolean> {
        try {
            const result = await pool.query(
                'SELECT lock_config FROM qualification_nodes WHERE id = $1',
                [nodeId]
            );

            if (result.rows.length === 0) {
                return false;
            }

            return !result.rows[0].lock_config;
        } catch (error) {
            console.error('Error validating node lock status:', error);
            return false;
        }
    }

    /**
     * Validates that a qualification exists and gets its details.
     * @param qualificationId The qualification ID
     * @param userId The user ID (optional, for ownership check)
     * @returns Qualification details or null if not found/not owned
     */
    static async getQualificationIfOwned(
        qualificationId: string,
        userId?: string
    ): Promise<{ id: string; userId: string; name: string } | null> {
        try {
            const query = userId
                ? 'SELECT id, user_id, name FROM qualifications WHERE id = $1 AND user_id = $2'
                : 'SELECT id, user_id, name FROM qualifications WHERE id = $1';

            const params = userId ? [qualificationId, userId] : [qualificationId];
            const result = await pool.query(query, params);

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];
            return {
                id: row.id,
                userId: row.user_id,
                name: row.name
            };
        } catch (error) {
            console.error('Error getting qualification:', error);
            return null;
        }
    }

    /**
     * Validates node creation input data.
     * @param data The new node data
     * @returns Validation result with any error messages
     */
    static validateNewNodeData(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.parentId || typeof data.parentId !== 'string') {
            errors.push('parentId is required and must be a string');
        }

        if (!data.type || typeof data.type !== 'string') {
            errors.push('type is required and must be a string');
        }

        if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
            errors.push('name is required and must be a non-empty string');
        }

        if (!data.qualificationId || typeof data.qualificationId !== 'string') {
            errors.push('qualificationId is required and must be a string');
        }

        if (data.credits !== undefined && data.credits !== null) {
            const credits = Number(data.credits);
            if (isNaN(credits) || credits < 0) {
                errors.push('credits must be a non-negative number');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
