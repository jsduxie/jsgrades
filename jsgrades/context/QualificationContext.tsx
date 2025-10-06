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
import { buildBreadcrumb } from '@/lib/client/qualifications/selectors';
import { createQualificationActions } from '@/context/qualification/actions';
import { navigateBack as navBack } from '@/context/qualification/navigation';

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

    // Build actions with dependencies
    const actions = React.useMemo(
        () =>
            createQualificationActions({
                getAuthOptions,
                getUserId: () => auth?.userDetails?.id,
                getCurrentIds: () => ({
                    qualificationId: currentQualificationId,
                    nodeId: currentNodeId,
                }),
                setLoading,
                setLoadingNodes,
                setQualifications: (updater) => setQualifications(updater),
                setQualificationLevels,
                setQualificationNodeTypes,
                setNodeHierarchy: (nodesOrUpdater) =>
                    setNodeHierarchy(
                        typeof nodesOrUpdater === 'function'
                            ? nodesOrUpdater
                            : nodesOrUpdater
                    ),
                setCurrentNodeSummary,
                setCurrentQualificationId,
                setCurrentNodeId,
                setNavigation,
            }),
        [
            auth?.userDetails?.id,
            currentQualificationId,
            currentNodeId,
            getAuthOptions,
        ]
    );

    const refreshQualifications = useCallback(async () => {
        if (!auth?.userDetails?.id) return;
        await actions.refreshQualifications();
    }, [auth?.userDetails?.id, actions]);

    const fetchQualificationLevels = useCallback(async () => {
        await actions.fetchQualificationLevels();
    }, [actions]);

    const fetchQualificationNodeTypes = useCallback(async () => {
        await actions.fetchQualificationNodeTypes();
    }, [actions]);

    const refreshNodes = useCallback(
        async (qualificationId?: string) => {
            await actions.refreshNodes(qualificationId);
        },
        [actions]
    );

    const fetchNodeSummary = useCallback(
        async (nodeId: string) => {
            await actions.fetchNodeSummary(nodeId);
        },
        [actions]
    );

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

    const setCurrentNode = useCallback(
        (nodeId: string) => {
            setCurrentNodeId(nodeId);
            fetchNodeSummary(nodeId);

            const pathNodes = buildBreadcrumb(nodeHierarchy, nodeId);
            if (pathNodes.length > 0) {
                setNavigation(pathNodes.map((n) => n.id));
            } else {
                setNavigation([]);
            }
        },
        [nodeHierarchy, fetchNodeSummary]
    );

    const navigateToNode = useCallback(
        (nodeId: string) => {
            setCurrentNode(nodeId);
        },
        [setCurrentNode]
    );

    const navigateBack = useCallback(() => {
        navBack(navigation, setCurrentNode, setCurrentNodeId, setNavigation, setCurrentNodeSummary);
    }, [navigation, setCurrentNode]);

    const getBreadcrumbPath = useCallback((): Node[] => {
        if (!currentNodeId) return [];
        return buildBreadcrumb(nodeHierarchy, currentNodeId);
    }, [currentNodeId, nodeHierarchy]);

    const addQualification = useCallback(
        async (qualification: Partial<Qualification>) => {
            await actions.addQualification(qualification);
        },
        [actions]
    );

    const updateQualification = useCallback(
        async (updates: Partial<Qualification>, qualificationId?: string) => {
            await actions.updateQualification(updates, qualificationId);
        },
        [actions]
    );

    const deleteQualification = useCallback(
        async (id: string) => {
            await actions.deleteQualification(id);
        },
        [actions]
    );

    const createNode = useCallback(
        async (nodeData: NewNode): Promise<Node | null> => {
            const created = await actions.createNode(nodeData);
            // refresh to sync aggregates and hierarchy
            await refreshNodes();
            return created;
        },
        [actions, refreshNodes]
    );

    const updateNode = useCallback(
        async (nodeId: string, updates: Partial<Node>) => {
            await actions.updateNode(nodeId, updates);
        },
        [actions]
    );

    const deleteNode = useCallback(
        async (nodeId: string) => {
            await actions.deleteNode(nodeId);
            if (currentNodeId === nodeId) {
                navigateBack();
            }
        },
        [actions, currentNodeId, navigateBack]
    );

    const updateGrade = useCallback(
        async (input: UpdateGradeInput) => {
            await actions.updateGrade(input);
            // Refresh nodes to get updated aggregates
            await refreshNodes();
            if (currentNodeId) {
                await fetchNodeSummary(currentNodeId);
            }
        },
        [actions, currentNodeId, refreshNodes, fetchNodeSummary]
    );

    const updateWeights = useCallback(
        async (parentId: string, input: WeightUpdateInput) => {
            await actions.updateWeights(parentId, input);
            await refreshNodes();
        },
        [actions, refreshNodes]
    );

    const validateNode = useCallback(
        async (nodeId: string): Promise<ValidationResult> => {
            return actions.validateNode(nodeId);
        },
        [actions]
    );

    useEffect(() => {
        if (auth?.userDetails?.id && !auth.loading) {
            refreshQualifications();
            fetchQualificationLevels();
            fetchQualificationNodeTypes();
        } else if (!auth?.userLoggedIn) {
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
