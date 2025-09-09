'use client';

import React, {
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import type {
    APIResponse,
    NewNode,
    Node,
    NodeSummary,
    Qualification,
    QualificationLevel,
    UpdateGradeInput,
    ValidationResult,
    WeightUpdateInput,
} from '@/types';

interface QualificationContextType {
    // Qualifications
    qualifications: Qualification[];
    currentQualificationId: string | null;
    qualificationLevels: QualificationLevel[];

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
        id: string,
        updates: Partial<Qualification>
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

    // Fetch qualifications
    const refreshQualifications = useCallback(async () => {
        if (!auth?.userDetails?.id) return;

        setLoading(true);
        try {
            const token = await getAuthToken();
            const res = await fetch(
                `/api/qualifications?userId=${auth.userDetails.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const json: APIResponse<Qualification[]> = await res.json();

            if (json.status === 'success' && json.data) {
                setQualifications(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch qualifications:', error);
        } finally {
            setLoading(false);
        }
    }, [auth?.userDetails?.id, getAuthToken]);

    // Fetch qualification levels
    const fetchQualificationLevels = useCallback(async () => {
        try {
            const token = await getAuthToken();
            const res = await fetch('/api/qualification-levels', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json: APIResponse<QualificationLevel[]> = await res.json();

            if (json.status === 'success' && json.data) {
                setQualificationLevels(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch qualification levels:', error);
        }
    }, [getAuthToken]);

    // Fetch nodes for a qualification
    const refreshNodes = useCallback(
        async (qualificationId?: string) => {
            const targetQualificationId =
                qualificationId || currentQualificationId;
            if (!targetQualificationId) return;

            setLoadingNodes(true);
            try {
                const token = await getAuthToken();
                const res = await fetch(
                    `/api/nodes?qualificationId=${targetQualificationId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const json: APIResponse<Node[]> = await res.json();

                if (json.status === 'success' && json.data) {
                    setNodeHierarchy(json.data);
                }
            } catch (error) {
                console.error('Failed to fetch nodes:', error);
            } finally {
                setLoadingNodes(false);
            }
        },
        [currentQualificationId, getAuthToken]
    );

    // Fetch current node summary
    const fetchNodeSummary = useCallback(
        async (nodeId: string) => {
            try {
                const token = await getAuthToken();
                const res = await fetch(`/api/nodes/${nodeId}/summary`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json: APIResponse<NodeSummary> = await res.json();

                if (json.status === 'success' && json.data) {
                    setCurrentNodeSummary(json.data);
                }
            } catch (error) {
                console.error('Failed to fetch node summary:', error);
            }
        },
        [getAuthToken]
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
                const path = [];
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
            try {
                const token = await getAuthToken();
                const res = await fetch('/api/qualifications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        ...qualification,
                        userId: auth?.userDetails?.id,
                    }),
                });
                const json: APIResponse<Qualification> = await res.json();

                if (json.status === 'success' && json.data) {
                    setQualifications((prev) => [...prev, json.data!]);
                }
            } catch (error) {
                console.error('Failed to add qualification:', error);
                throw error;
            }
        },
        [auth?.userDetails?.id, getAuthToken]
    );

    const updateQualification = useCallback(
        async (id: string, updates: Partial<Qualification>) => {
            try {
                const token = await getAuthToken();
                const res = await fetch(`/api/qualifications/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(updates),
                });
                const json: APIResponse<Qualification> = await res.json();

                if (json.status === 'success' && json.data) {
                    setQualifications((prev) =>
                        prev.map((q) => (q.id === id ? json.data! : q))
                    );
                }
            } catch (error) {
                console.error('Failed to update qualification:', error);
                throw error;
            }
        },
        [getAuthToken]
    );

    const deleteQualification = useCallback(
        async (id: string) => {
            try {
                const token = await getAuthToken();
                const res = await fetch(`/api/qualifications/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    setQualifications((prev) =>
                        prev.filter((q) => q.id !== id)
                    );
                    if (currentQualificationId === id) {
                        setCurrentQualificationId(null);
                        setCurrentNodeId(null);
                        setNavigation([]);
                    }
                }
            } catch (error) {
                console.error('Failed to delete qualification:', error);
                throw error;
            }
        },
        [currentQualificationId, getAuthToken]
    );

    // CRUD operations for nodes
    const createNode = useCallback(
        async (nodeData: NewNode): Promise<Node | null> => {
            try {
                const token = await getAuthToken();
                const res = await fetch('/api/nodes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(nodeData),
                });
                const json: APIResponse<Node> = await res.json();

                if (json.status === 'success' && json.data) {
                    setNodeHierarchy((prev) => [...prev, json.data!]);
                    return json.data;
                }
                return null;
            } catch (error) {
                console.error('Failed to create node:', error);
                throw error;
            }
        },
        [getAuthToken]
    );

    const updateNode = useCallback(
        async (nodeId: string, updates: Partial<Node>) => {
            try {
                const token = await getAuthToken();
                const res = await fetch(`/api/nodes/${nodeId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(updates),
                });
                const json: APIResponse<Node> = await res.json();

                if (json.status === 'success' && json.data) {
                    setNodeHierarchy((prev) =>
                        prev.map((n) => (n.id === nodeId ? json.data! : n))
                    );
                }
            } catch (error) {
                console.error('Failed to update node:', error);
                throw error;
            }
        },
        [getAuthToken]
    );

    const deleteNode = useCallback(
        async (nodeId: string) => {
            try {
                const token = await getAuthToken();
                const res = await fetch(`/api/nodes/${nodeId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    setNodeHierarchy((prev) =>
                        prev.filter((n) => n.id !== nodeId)
                    );
                    if (currentNodeId === nodeId) {
                        navigateBack();
                    }
                }
            } catch (error) {
                console.error('Failed to delete node:', error);
                throw error;
            }
        },
        [currentNodeId, getAuthToken, navigateBack]
    );

    const updateGrade = useCallback(
        async (input: UpdateGradeInput) => {
            try {
                const token = await getAuthToken();
                const res = await fetch(`/api/nodes/${input.nodeId}/grade`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(input),
                });

                if (res.ok) {
                    // Refresh nodes to get updated aggregates
                    await refreshNodes();
                    if (currentNodeId) {
                        await fetchNodeSummary(currentNodeId);
                    }
                }
            } catch (error) {
                console.error('Failed to update grade:', error);
                throw error;
            }
        },
        [currentNodeId, getAuthToken, refreshNodes, fetchNodeSummary]
    );

    const updateWeights = useCallback(
        async (parentId: string, input: WeightUpdateInput) => {
            try {
                const token = await getAuthToken();
                const res = await fetch(`/api/nodes/${parentId}/weights`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(input),
                });

                if (res.ok) {
                    await refreshNodes();
                }
            } catch (error) {
                console.error('Failed to update weights:', error);
                throw error;
            }
        },
        [getAuthToken, refreshNodes]
    );

    const validateNode = useCallback(
        async (nodeId: string): Promise<ValidationResult> => {
            try {
                const token = await getAuthToken();
                const res = await fetch(`/api/nodes/${nodeId}/validate`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json: APIResponse<ValidationResult> = await res.json();

                if (json.status === 'success' && json.data) {
                    return json.data;
                }
                throw new Error('Failed to validate node');
            } catch (error) {
                console.error('Failed to validate node:', error);
                throw error;
            }
        },
        [getAuthToken]
    );

    // Load initial data when user is authenticated
    useEffect(() => {
        if (auth?.userDetails?.id) {
            refreshQualifications();
            fetchQualificationLevels();
        }
    }, [
        auth?.userDetails?.id,
        refreshQualifications,
        fetchQualificationLevels,
    ]);

    const value: QualificationContextType = {
        // State
        qualifications,
        currentQualificationId,
        qualificationLevels,
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
