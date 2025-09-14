'use client';

import React, { ReactNode, useCallback, useContext, useEffect, useState, } from 'react';
import { useAuth } from '@/context/AuthContext';
import type {
    NewNode,
    NewQualification,
    Node,
    NodeSummary,
    Qualification,
    QualificationLevel,
    QualificationNodeType,
    UpdateGradeInput,
    ValidationResult,
    WeightUpdateInput,
} from '@/types';
import {
    createQualification as apiCreateQualification,
    deleteQualification as apiDeleteQualification,
    fetchQualificationLevels as apiFetchQualificationLevels,
    fetchQualifications as apiFetchQualifications,
    updateQualification as apiUpdateQualification,
} from '@/lib/client/qualifications/qualifications.api';
import {
    createNode as apiCreateNode,
    deleteNode as apiDeleteNode,
    fetchNodes as apiFetchNodes,
    fetchNodeSummary as apiFetchNodeSummary,
    fetchNodeTypes as apiFetchNodeTypes,
    updateGrade as apiUpdateGrade,
    updateNode as apiUpdateNode,
    updateWeights as apiUpdateWeights,
    validateNode as apiValidateNode,
} from '@/lib/client/qualifications/nodes.api';

interface QualificationContextType {
    // Qualifications
    qualifications: Qualification[];
    currentQualificationId: string | null;
    qualificationLevels: QualificationLevel[];
    qualificationNodeTypes: QualificationNodeType[];

    // Node navigation and progression
    currentNodeId: string | null;
    navigation: string[];
    nodeHierarchy: Node[];
    currentNodeSummary: NodeSummary | null;

    // Loading states
    loading: boolean;
    loadingNodes: boolean;

    // Actions
    setCurrentQualification: (id: string) => void;
    setCurrentNode: (nodeId: string) => void;
    addQualification: (qualification: Partial<Qualification>) => Promise<void>;
    updateQualification: (
        updates: Partial<Qualification>,
        id?: string
    ) => Promise<void>;
    deleteQualification: (id: string) => Promise<void>;

    // Node actions
    createNode: (nodeData: NewNode) => Promise<Node | null>;
    updateNode: (nodeId: string, updates: Partial<Node>) => Promise<void>;
    deleteNode: (nodeId: string) => Promise<void>;
    updateGrade: (input: UpdateGradeInput) => Promise<void>;
    updateWeights: (
        parentId: string,
        input: WeightUpdateInput
    ) => Promise<void>;
    validateNode: (nodeId: string) => Promise<ValidationResult>;

    // Navigation
    navigateToNode: (nodeId: string) => void;
    navigateBack: () => void;
    getBreadcrumbPath: () => Node[];

    // Data fetching
    refreshQualifications: () => Promise<void>;
    refreshNodes: (qualificationId?: string) => Promise<void>;
}

const QualificationContext = React.createContext<
    QualificationContextType | undefined
>(undefined);

export function useQualification() {
    const context = useContext(QualificationContext);
    if (!context) {
        throw new Error(
            'useQualification must be used within a QualificationProvider'
        );
    }
    return context;
}

export function QualificationProvider({ children }: { children: ReactNode }) {
    const auth = useAuth();

    // State
    const [qualifications, setQualifications] = useState<Qualification[]>([]);
    const [currentQualificationId, setCurrentQualificationId] = useState<
        string | null
    >(null);
    const [qualificationLevels, setQualificationLevels] = useState<
        QualificationLevel[]
    >([]);
    const [qualificationNodeTypes, setQualificationNodeTypes] = useState<
        QualificationNodeType[]
    >([]);
    const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
    const [navigation, setNavigation] = useState<string[]>([]);
    const [nodeHierarchy, setNodeHierarchy] = useState<Node[]>([]);
    const [currentNodeSummary, setCurrentNodeSummary] =
        useState<NodeSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingNodes, setLoadingNodes] = useState(false);

    // Helper function to get auth token
    const getAuthToken = useCallback(async () => {
        if (!auth?.currentUser) {
            throw new Error('User not authenticated');
        }
        return await auth.currentUser.getIdToken();
    }, [auth?.currentUser]);

    // Helper to build auth options for API client
    const getAuthOptions = useCallback(
        async () => ({
            token: await getAuthToken(),
            onUnauthorized: () => {
                // Allow request() default redirect to /home; hook here if we need extra cleanup.
            },
        }),
        [getAuthToken]
    );

    // Fetch qualifications
    const refreshQualifications = useCallback(async () => {
        if (!auth?.userDetails?.id) return;

        setLoading(true);
        try {
            const authOpts = await getAuthOptions();
            const json = await apiFetchQualifications(
                auth.userDetails.id,
                authOpts
            );
            if (json.status === 'success' && json.data) {
                setQualifications(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch qualifications:', error);
        } finally {
            setLoading(false);
        }
    }, [auth?.userDetails?.id, getAuthOptions]);

    // Fetch qualification levels
    const fetchQualificationLevels = useCallback(async () => {
        try {
            const authOpts = await getAuthOptions();
            const json = await apiFetchQualificationLevels(authOpts);
            if (json.status === 'success' && json.data) {
                setQualificationLevels(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch qualification levels:', error);
        }
    }, [getAuthOptions]);

    const fetchQualificationNodeTypes = useCallback(async () => {
        try {
            const authOpts = await getAuthOptions();
            const json = await apiFetchNodeTypes(authOpts);
            if (json.status === 'success' && json.data) {
                setQualificationNodeTypes(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch qualification node types:', error);
        }
    }, [getAuthOptions]);

    // Fetch nodes for a qualification
    const refreshNodes = useCallback(
        async (qualificationId?: string) => {
            const targetQualificationId =
                qualificationId || currentQualificationId;
            if (!targetQualificationId) return;

            setLoadingNodes(true);
            try {
                const authOpts = await getAuthOptions();
                const json = await apiFetchNodes(
                    targetQualificationId,
                    authOpts
                );
                if (json.status === 'success' && json.data) {
                    setNodeHierarchy(json.data);
                }
            } catch (error) {
                console.error('Failed to fetch nodes:', error);
            } finally {
                setLoadingNodes(false);
            }
        },
        [currentQualificationId, getAuthOptions]
    );

    // Fetch current node summary
    const fetchNodeSummary = useCallback(
        async (nodeId: string) => {
            try {
                const authOpts = await getAuthOptions();
                const json = await apiFetchNodeSummary(nodeId, authOpts);
                if (json.status === 'success' && json.data) {
                    setCurrentNodeSummary(json.data);
                }
            } catch (error) {
                console.error('Failed to fetch node summary:', error);
            }
        },
        [getAuthOptions]
    );

    // Set current qualification
    const setCurrentQualification = useCallback(
        (id: string) => {
            setCurrentQualificationId(id);
            setCurrentNodeId(null);
            setNavigation([]);
            setCurrentNodeSummary(null);
            refreshNodes(id);
        },
        [refreshNodes]
    );

    // Set current node and update navigation
    const setCurrentNode = useCallback(
        (nodeId: string) => {
            setCurrentNodeId(nodeId);
            fetchNodeSummary(nodeId);

            // Update navigation breadcrumb
            const node = nodeHierarchy.find((n) => n.id === nodeId);
            if (node) {
                const path: string[] = [];
                let current: Node | null = node;
                while (current) {
                    path.unshift(current.id);
                    current =
                        nodeHierarchy.find((n) => n.id === current?.parentId) ||
                        null;
                }
                setNavigation(path);
            }
        },
        [nodeHierarchy, fetchNodeSummary]
    );

    // Navigation helpers
    const navigateToNode = useCallback(
        (nodeId: string) => {
            setCurrentNode(nodeId);
        },
        [setCurrentNode]
    );

    const navigateBack = useCallback(() => {
        if (navigation.length > 1) {
            const parentNodeId = navigation[navigation.length - 2];
            setCurrentNode(parentNodeId);
        }
    }, [navigation, setCurrentNode]);

    const getBreadcrumbPath = useCallback((): Node[] => {
        return navigation
            .map((nodeId) => nodeHierarchy.find((n) => n.id === nodeId))
            .filter(Boolean) as Node[];
    }, [navigation, nodeHierarchy]);

    // CRUD operations for qualifications
    const addQualification = useCallback(
        async (qualification: Partial<Qualification>) => {
            const authOpts = await getAuthOptions();
            const newQualification: NewQualification = {
                userId: auth?.userDetails?.id ?? '',
                level: String(qualification.level ?? ''),
                name: String(qualification.name ?? ''),
                institution: String(qualification.institution ?? ''),
                startDate: qualification.startDate ?? undefined,
                endDate: qualification.endDate ?? undefined,
                currentGrade: qualification.currentGrade ?? undefined,
                targetGrade: qualification.targetGrade ?? undefined,
                predictedGrade: qualification.predictedGrade ?? undefined,
                inProgress: qualification.inProgress ?? true,
            };
            const json = await apiCreateQualification(
                newQualification,
                authOpts
            );
            if (json.status === 'success' && json.data) {
                setQualifications((prev) => [...prev, json.data!]);
                return;
            }
            throw new Error(json.message || 'Failed to add qualification');
        },
        [auth?.userDetails?.id, getAuthOptions]
    );

    const updateQualification = useCallback(
        async (updates: Partial<Qualification>, qualificationId?: string) => {
            const id = qualificationId || currentQualificationId;
            if (!id) {
                throw new Error('No qualification ID provided');
            }
            const authOpts = await getAuthOptions();
            const json = await apiUpdateQualification(id, updates, authOpts);
            if (json.status === 'success' && json.data) {
                setQualifications((prev) =>
                    prev.map((q) => (q.id === id ? json.data! : q))
                );
            } else {
                throw new Error(
                    json.message || 'Failed to update qualification'
                );
            }
        },
        [getAuthOptions, currentQualificationId]
    );

    const deleteQualification = useCallback(
        async (id: string) => {
            const authOpts = await getAuthOptions();
            const json = await apiDeleteQualification(id, authOpts);
            if (json.status === 'success') {
                setQualifications((prev) => prev.filter((q) => q.id !== id));
                if (currentQualificationId === id) {
                    setCurrentQualificationId(null);
                    setCurrentNodeId(null);
                    setNavigation([]);
                }
                return;
            }
            throw new Error(json.message || 'Failed to delete qualification');
        },
        [currentQualificationId, getAuthOptions]
    );

    // CRUD operations for nodes
    const createNode = useCallback(
        async (nodeData: NewNode): Promise<Node | null> => {
            const authOpts = await getAuthOptions();
            const json = await apiCreateNode(nodeData, authOpts);
            if (json.status === 'success' && json.data?.node) {
                const created = json.data.node;
                setNodeHierarchy((prev) => [...prev, created]);
                await refreshNodes();
                return created;
            }
            throw new Error(json.message || 'Failed to create node');
        },
        [getAuthOptions, refreshNodes]
    );

    const updateNode = useCallback(
        async (nodeId: string, updates: Partial<Node>) => {
            const authOpts = await getAuthOptions();
            const json = await apiUpdateNode(nodeId, updates, authOpts);
            if (json.status === 'success' && json.data) {
                setNodeHierarchy((prev) =>
                    prev.map((n) => (n.id === nodeId ? json.data! : n))
                );
            }
        },
        [getAuthOptions]
    );

    const deleteNode = useCallback(
        async (nodeId: string) => {
            const authOpts = await getAuthOptions();
            const json = await apiDeleteNode(nodeId, authOpts);
            if (json.status === 'success') {
                setNodeHierarchy((prev) => prev.filter((n) => n.id !== nodeId));
                if (currentNodeId === nodeId) {
                    navigateBack();
                }
            }
        },
        [currentNodeId, getAuthOptions, navigateBack]
    );

    const updateGrade = useCallback(
        async (input: UpdateGradeInput) => {
            const authOpts = await getAuthOptions();
            const json = await apiUpdateGrade(input, authOpts);
            if (json.status === 'success') {
                // Refresh nodes to get updated aggregates
                await refreshNodes();
                if (currentNodeId) {
                    await fetchNodeSummary(currentNodeId);
                }
            }
        },
        [currentNodeId, getAuthOptions, refreshNodes, fetchNodeSummary]
    );

    const updateWeights = useCallback(
        async (parentId: string, input: WeightUpdateInput) => {
            const authOpts = await getAuthOptions();
            const json = await apiUpdateWeights(parentId, input, authOpts);
            if (json.status === 'success') {
                await refreshNodes();
            }
        },
        [getAuthOptions, refreshNodes]
    );

    const validateNode = useCallback(
        async (nodeId: string): Promise<ValidationResult> => {
            const authOpts = await getAuthOptions();
            const json = await apiValidateNode(nodeId, authOpts);
            if (json.status === 'success' && json.data) {
                return json.data;
            }
            throw new Error(json.message || 'Failed to validate node');
        },
        [getAuthOptions]
    );

    // Load initial data when user is authenticated and cleanup on logout
    useEffect(() => {
        if (auth?.userDetails?.id && !auth.loading) {
            refreshQualifications();
            fetchQualificationLevels();
            fetchQualificationNodeTypes();
        } else if (!auth?.userLoggedIn) {
            // Cleanup when user logs out
            setQualifications([]);
            setCurrentQualificationId(null);
            setQualificationLevels([]);
            setCurrentNodeId(null);
            setNavigation([]);
            setNodeHierarchy([]);
            setCurrentNodeSummary(null);
            setLoading(false);
            setLoadingNodes(false);
        }
    }, [
        auth?.userDetails?.id,
        auth?.loading,
        auth?.userLoggedIn,
        refreshQualifications,
        fetchQualificationLevels,
        fetchQualificationNodeTypes,
    ]);

    const value: QualificationContextType = {
        // State
        qualifications,
        currentQualificationId,
        qualificationLevels,
        qualificationNodeTypes,
        currentNodeId,
        navigation,
        nodeHierarchy,
        currentNodeSummary,
        loading,
        loadingNodes,

        // Actions
        setCurrentQualification,
        setCurrentNode,
        addQualification,
        updateQualification,
        deleteQualification,

        // Node actions
        createNode,
        updateNode,
        deleteNode,
        updateGrade,
        updateWeights,
        validateNode,

        // Navigation
        navigateToNode,
        navigateBack,
        getBreadcrumbPath,

        // Data fetching
        refreshQualifications,
        refreshNodes,
    };

    return (
        <QualificationContext.Provider value={value}>
            {children}
        </QualificationContext.Provider>
    );
}
