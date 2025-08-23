import { PoolClient } from 'pg';
import pool from '@/lib/server/db';

export interface TestContext {
    userId: string;
    qualificationLevelId: string;
    qualificationId: string;
    nodeTypeYearId: string;
    nodeTypeModuleId: string;
    nodeTypeAssessmentId: string;
    rootNodeId: string;
}

/**
 * Provides stub test data, creating prerequisite data if not already present
 */
export class StubUtility {
    private client?: PoolClient;

    /**
     * Creates a new StubUtility instance
     * @param client - Optional database client to use, creates one if not provided
     */
    constructor(client?: PoolClient) {
        if (client) {
            this.client = client;
        }
    }

    /**
     * Initialise this stub utility with a database client
     */
    async initialize(): Promise<void> {
        if (!this.client) {
            this.client = await pool.connect();
        }
    }

    /**
     * Release database client resources
     */
    async release(): Promise<void> {
        if (this.client) {
            await this.client.release();
        }
    }

    /**
     * Get the database client for direct database operations in tests
     */
    get dbClient(): PoolClient {
        if (!this.client) {
            throw new Error('Client not initialised. Call initialize() first.');
        }
        return this.client;
    }

    /**
     * Creates or gets a test user with consistent ID
     * @param options - Optional user properties
     * @returns The user ID
     */
    async getTestUser(options?: {
        id?: string;
        uid?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
    }): Promise<string> {
        if (!this.client) {
            throw new Error('Client not initialised. Call initialize() first.');
        }

        const id = options?.id || '11111111-1111-1111-1111-111111111111';
        const uid = options?.uid || 'test-user-id';
        const email = options?.email || 'test@example.com';
        const firstName = options?.firstName || 'Test User';
        const lastName = options?.lastName;

        const existingUser = await this.client.query(
            'SELECT id FROM users WHERE id = $1 OR uid = $2',
            [id, uid]
        );

        if (existingUser.rows.length > 0) {
            return existingUser.rows[0].id;
        }

        try {
            await this.client.query('BEGIN');

            const checkAgain = await this.client.query(
                'SELECT id FROM users WHERE id = $1 OR uid = $2',
                [id, uid]
            );

            if (checkAgain.rows.length > 0) {
                await this.client.query('COMMIT');
                return checkAgain.rows[0].id;
            }

            const newUser = await this.client.query(
                'INSERT INTO users (id, uid, email, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [id, uid, email, firstName, lastName]
            );

            await this.client.query('COMMIT');
            return newUser.rows[0].id;
        } catch (error) {
            await this.client.query('ROLLBACK');

            try {
                const existingUserRetry = await this.client.query(
                    'SELECT id FROM users WHERE id = $1 OR uid = $2 OR email = $3',
                    [id, uid, email]
                );

                if (existingUserRetry.rows.length > 0) {
                    return existingUserRetry.rows[0].id;
                }

                await this.client.query('BEGIN');

                const generatedId = await this.client.query(
                    'SELECT uuid_generate_v4() as id'
                );
                const newId = generatedId.rows[0].id;
                const uniqueUid = `${uid}-${newId.substring(0, 8)}`;
                const newUser = await this.client.query(
                    'INSERT INTO users (id, uid, email, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                    [newId, uniqueUid, email, firstName, lastName]
                );

                await this.client.query('COMMIT');
                return newUser.rows[0].id;
            } catch (_retryError) {
                try {
                    await this.client.query('ROLLBACK');
                } catch (e) {
                    console.warn('Error rolling back transaction:', e);
                }

                throw _retryError;
            }
        }
    }

    /**
     * Creates or gets a qualification level
     * @param options Level options
     * @returns The level ID
     */
    async getQualificationLevel(options?: {
        name?: string;
        level?: number;
    }): Promise<string> {
        if (!this.client) {
            throw new Error('Client not initialised. Call initialize() first.');
        }

        const name = options?.name || `Test Bachelor ${Date.now()}`; // Make names unique to avoid conflicts
        const level = options?.level || 6;

        const existingLevel = await this.client.query(
            'SELECT id FROM qualification_levels WHERE name = $1',
            [name]
        );

        if (existingLevel.rows.length > 0) {
            return existingLevel.rows[0].id;
        }

        try {
            const newLevel = await this.client.query(
                'INSERT INTO qualification_levels (name, level) VALUES ($1, $2) RETURNING id',
                [name, level]
            );

            return newLevel.rows[0].id;
        } catch (error) {
            // If there's a constraint violation, try to get the existing record
            console.warn(
                `Failed to create qualification level "${name}":`,
                error
            );
            const retryResult = await this.client.query(
                'SELECT id FROM qualification_levels WHERE name = $1',
                [name]
            );

            if (retryResult.rows.length > 0) {
                return retryResult.rows[0].id;
            }

            throw error;
        }
    }

    /**
     * Creates or gets node types for testing
     */
    async getNodeTypes(): Promise<{
        yearId: string;
        moduleId: string;
        assessmentId: string;
    }> {
        if (!this.client) {
            throw new Error('Client not initialised. Call initialize() first.');
        }

        const yearName = 'year';
        const moduleName = 'module';
        const assessmentName = 'assessment';

        const typeNames = [yearName, moduleName, assessmentName];
        const existingTypes = await this.client.query(
            `SELECT id, name FROM node_types WHERE name = ANY($1::node_type_enum[])`,
            [typeNames]
        );

        let yearId: string | null = null;
        let moduleId: string | null = null;
        let assessmentId: string | null = null;

        for (const row of existingTypes.rows) {
            if (row.name === yearName) yearId = row.id;
            if (row.name === moduleName) moduleId = row.id;
            if (row.name === assessmentName) assessmentId = row.id;
        }

        if (!yearId) {
            const year = await this.client.query(
                'INSERT INTO node_types (name, allow_children) VALUES ($1::node_type_enum, true) RETURNING id',
                [yearName]
            );
            yearId = year.rows[0].id;
        }

        if (!moduleId) {
            const moduleResult = await this.client.query(
                'INSERT INTO node_types (name, allow_children) VALUES ($1::node_type_enum, true) RETURNING id',
                [moduleName]
            );
            moduleId = moduleResult.rows[0].id;
        }

        if (!assessmentId) {
            const assessment = await this.client.query(
                'INSERT INTO node_types (name, allow_children) VALUES ($1::node_type_enum, false) RETURNING id',
                [assessmentName]
            );
            assessmentId = assessment.rows[0].id;
        }

        return {
            yearId: yearId!,
            moduleId: moduleId!,
            assessmentId: assessmentId!,
        };
    }

    /**
     * Creates or gets a qualification
     */
    async getQualification(
        userId: string,
        levelId: string,
        options?: {
            name?: string;
            institution?: string;
        }
    ): Promise<string> {
        if (!this.client) {
            throw new Error('Client not initialised. Call initialize() first.');
        }

        const name = options?.name || 'Test Qualification';
        const institution = options?.institution || 'Test University';

        const existingQual = await this.client.query(
            'SELECT id FROM qualifications WHERE user_id = $1 AND name = $2',
            [userId, name]
        );

        if (existingQual.rows.length > 0) {
            return existingQual.rows[0].id;
        }

        const newQual = await this.client.query(
            'INSERT INTO qualifications (user_id, level, name, institution) VALUES ($1, $2, $3, $4) RETURNING id',
            [userId, levelId, name, institution]
        );

        return newQual.rows[0].id;
    }

    /**
     * Creates or gets a root node
     */
    async getRootNode(
        qualificationId: string,
        userId: string,
        typeId: string,
        options?: {
            name?: string;
        }
    ): Promise<string> {
        if (!this.client) {
            throw new Error('Client not initialised. Call initialize() first.');
        }

        const name = options?.name || 'Test Root Node';

        const existingNode = await this.client.query(
            'SELECT id FROM qualification_nodes WHERE qualification_id = $1 AND parent_id IS NULL',
            [qualificationId]
        );

        if (existingNode.rows.length > 0) {
            const nodeId = existingNode.rows[0].id;

            const hasAggregate = await this.client.query(
                'SELECT 1 FROM node_aggregates WHERE node_id = $1',
                [nodeId]
            );

            if (hasAggregate.rows.length === 0) {
                await this.client.query(
                    'INSERT INTO node_aggregates (node_id, child_counts, effective_settings) VALUES ($1, $2, $3)',
                    [nodeId, '{}', '{}']
                );
            }

            return nodeId;
        }

        const root = await this.client.query(
            `
            INSERT INTO qualification_nodes (
                qualification_id, user_id, parent_id, name, type,
                calculation_method, weighting_mode, rounding_mode, rounding_precision,
                exclude_incomplete_from_predicted, inherit_settings, overrides,
                credit_enforcement, config_status, lock_config
            ) VALUES ($1, $2, NULL, $3, $4, 'weighted_mean', 'equal', 'none', 2, 
                TRUE, TRUE, '{}', 'warn', 'partial', FALSE)
            RETURNING id
        `,
            [qualificationId, userId, name, typeId]
        );

        const nodeId = root.rows[0].id;

        await this.client.query(
            'INSERT INTO node_aggregates (node_id, child_counts, effective_settings) VALUES ($1, $2, $3)',
            [nodeId, '{}', '{}']
        );

        return nodeId;
    }

    /**
     * Sets up complete test context with all required data
     */
    async getTestContext(options?: {
        userId?: string;
        userName?: string;
        levelName?: string;
        qualificationName?: string;
    }): Promise<TestContext> {
        if (!this.client) {
            throw new Error('Client not initialised. Call initialize() first.');
        }

        try {
            // Don't start a transaction here - let each method handle its own transaction if needed
            const userId = await this.getTestUser({
                id: options?.userId,
                uid: options?.userName,
                firstName: options?.userName,
            });

            const qualificationLevelId = await this.getQualificationLevel({
                name: options?.levelName || 'Test Bachelor',
            });

            const nodeTypes = await this.getNodeTypes();

            const qualificationId = await this.getQualification(
                userId,
                qualificationLevelId,
                { name: options?.qualificationName }
            );

            const rootNodeId = await this.getRootNode(
                qualificationId,
                userId,
                nodeTypes.yearId
            );

            // Final verification that all data was created successfully
            const verifications = await Promise.all([
                this.client.query('SELECT id FROM users WHERE id = $1', [
                    userId,
                ]),
                this.client.query(
                    'SELECT id FROM qualification_levels WHERE id = $1',
                    [qualificationLevelId]
                ),
                this.client.query(
                    'SELECT id FROM qualifications WHERE id = $1',
                    [qualificationId]
                ),
                this.client.query(
                    'SELECT id FROM qualification_nodes WHERE id = $1',
                    [rootNodeId]
                ),
            ]);

            const [userCheck, levelCheck, qualCheck, nodeCheck] = verifications;

            if (userCheck.rows.length === 0) {
                throw new Error(`Failed to verify user: ${userId}`);
            }
            if (levelCheck.rows.length === 0) {
                throw new Error(
                    `Failed to verify qualification level: ${qualificationLevelId}`
                );
            }
            if (qualCheck.rows.length === 0) {
                throw new Error(
                    `Failed to verify qualification: ${qualificationId}`
                );
            }
            if (nodeCheck.rows.length === 0) {
                throw new Error(`Failed to verify root node: ${rootNodeId}`);
            }

            return {
                userId,
                qualificationLevelId,
                qualificationId,
                nodeTypeYearId: nodeTypes.yearId,
                nodeTypeModuleId: nodeTypes.moduleId,
                nodeTypeAssessmentId: nodeTypes.assessmentId,
                rootNodeId,
            };
        } catch (error) {
            console.error('Error setting up test context:', error);
            throw error;
        }
    }

    /**
     * Static factory method to create and initialise a StubUtility instance
     * Makes sure to handle connection cleanup properly
     */
    static async create(): Promise<StubUtility> {
        const client = await pool.connect();
        return new StubUtility(client);
    }

    /**
     * Properly releases all resources used by this StubUtility instance
     * Call this in afterAll blocks to ensure connections are closed
     */
    async cleanup(): Promise<void> {
        try {
            if (this.client) {
                try {
                    await this.client.query('ROLLBACK');
                } catch (e) {
                    console.warn(
                        'Error rolling back transaction during cleanup:',
                        e
                    );
                }

                this.client.release();
            }
        } catch (error) {
            console.error('Error during StubUtility cleanup:', error);
        }
    }
}

export const stubUtil = new StubUtility();
