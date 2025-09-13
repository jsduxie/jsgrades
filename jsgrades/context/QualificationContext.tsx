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
    QualificationNodeType,
    UpdateGradeInput,
    ValidationResult,
    WeightUpdateInput,
} from '@/types';

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

    const fetchQualificationNodeTypes = useCallback(async () => {
        try {
            const token = await getAuthToken();
            const res = await fetch('/api/node-types', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json: APIResponse<QualificationNodeType[]> = await res.json();

            if (json.status === 'success' && json.data) {
                setQualificationNodeTypes(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch qualification node types:', error);
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

            if (res.ok && json.status === 'success' && json.data) {
                setQualifications((prev) => [...prev, json.data!]);
                return;
            }
            throw new Error(json.message || 'Failed to add qualification');
        },
        [auth?.userDetails?.id, getAuthToken]
    );

    const updateQualification = useCallback(
        async (updates: Partial<Qualification>, qualificationId?: string) => {
            const token = await getAuthToken();
            const id = qualificationId || currentQualificationId;

            if (!id) {
                throw new Error('No qualification ID provided');
            }

            const res = await fetch(`/api/qualifications/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const json: APIResponse<Qualification> = await res.json();

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
        [getAuthToken, currentQualificationId]
    );

    const deleteQualification = useCallback(
        async (id: string) => {
            const token = await getAuthToken();
            const res = await fetch(`/api/qualifications/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setQualifications((prev) => prev.filter((q) => q.id !== id));
                if (currentQualificationId === id) {
                    setCurrentQualificationId(null);
                    setCurrentNodeId(null);
                    setNavigation([]);
                }
                return;
            }

            let message = 'Failed to delete qualification';
            try {
                const json: APIResponse<null> = await res.json();
                if (json?.message) message = json.message;
            } catch {}
            throw new Error(message);
        },
        [currentQualificationId, getAuthToken]
    );

    // CRUD operations for nodes
    const createNode = useCallback(
        async (nodeData: NewNode): Promise<Node | null> => {
            const token = await getAuthToken();
            const res = await fetch('/api/nodes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(nodeData),
            });
            const json: APIResponse<{ node: Node; aggregate: unknown }> =
                await res.json();

            if (res.ok && json.status === 'success' && json.data?.node) {
                const created = json.data.node;
                setNodeHierarchy((prev) => [...prev, created]);
                await refreshNodes();
                return created;
            }
            throw new Error(json.message || 'Failed to create node');
        },
        [getAuthToken, refreshNodes]
    );

    const updateNode = useCallback(
        async (nodeId: string, updates: Partial<Node>) => {
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
        },
        [getAuthToken]
    );

    const deleteNode = useCallback(
        async (nodeId: string) => {
            const token = await getAuthToken();
            const res = await fetch(`/api/nodes/${nodeId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setNodeHierarchy((prev) => prev.filter((n) => n.id !== nodeId));
                if (currentNodeId === nodeId) {
                    navigateBack();
                }
            }
        },
        [currentNodeId, getAuthToken, navigateBack]
    );

    const updateGrade = useCallback(
        async (input: UpdateGradeInput) => {
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
        },
        [currentNodeId, getAuthToken, refreshNodes, fetchNodeSummary]
    );

    const updateWeights = useCallback(
        async (parentId: string, input: WeightUpdateInput) => {
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
        },
        [getAuthToken, refreshNodes]
    );

    const validateNode = useCallback(
        async (nodeId: string): Promise<ValidationResult> => {
            const token = await getAuthToken();
            const res = await fetch(`/api/nodes/${nodeId}/validate`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json: APIResponse<ValidationResult> = await res.json();

            if (json.status === 'success' && json.data) {
                return json.data;
            }
            throw new Error('Failed to validate node');
        },
        [getAuthToken]
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
