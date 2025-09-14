import type {
    Qualification,
    QualificationLevel,
    QualificationNodeType,
    NewQualification,
} from '@/types/qualification';
import type {
    NewNode,
    Node,
    NodeSummary,
    UpdateGradeInput,
    ValidationResult,
    WeightUpdateInput,
} from '@/types/qualificationNode';
import {
    fetchQualifications as apiFetchQualifications,
    fetchQualificationLevels as apiFetchQualificationLevels,
    createQualification as apiCreateQualification,
    updateQualification as apiUpdateQualification,
    deleteQualification as apiDeleteQualification,
} from '@/lib/client/qualifications/qualifications.api';
import {
    fetchNodeTypes as apiFetchNodeTypes,
    fetchNodes as apiFetchNodes,
    fetchNodeSummary as apiFetchNodeSummary,
    createNode as apiCreateNode,
    updateNode as apiUpdateNode,
    deleteNode as apiDeleteNode,
    updateGrade as apiUpdateGrade,
    updateWeights as apiUpdateWeights,
    validateNode as apiValidateNode,
} from '@/lib/client/qualifications/nodes.api';

export interface AuthOptions {
    token: string;
    onUnauthorized?: () => void;
}

export interface ActionsDeps {
    getAuthOptions: () => Promise<AuthOptions>;
    getUserId: () => string | undefined;
    getCurrentIds: () => {
        qualificationId: string | null;
        nodeId: string | null;
    };

    setLoading: (v: boolean) => void;
    setLoadingNodes: (v: boolean) => void;

    setQualifications: (
        updater: (prev: Qualification[]) => Qualification[]
    ) => void;
    setQualificationLevels: (levels: QualificationLevel[]) => void;
    setQualificationNodeTypes: (types: QualificationNodeType[]) => void;
    setNodeHierarchy: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
    setCurrentNodeSummary: (summary: NodeSummary | null) => void;
    setCurrentQualificationId: (id: string | null) => void;
    setCurrentNodeId: (id: string | null) => void;
    setNavigation: (ids: string[]) => void;
}

export function createQualificationActions(deps: ActionsDeps) {
    async function refreshQualifications(): Promise<void> {
        const { getAuthOptions, setLoading, setQualifications } = deps;
        setLoading(true);
        try {
            const auth = await getAuthOptions();
            const res = await apiFetchQualifications(
                deps.getUserId() ?? '',
                auth
            );
            if (res.status === 'success' && res.data) {
                const data = res.data;
                setQualifications(() => data);
            }
        } finally {
            setLoading(false);
        }
    }

    async function fetchQualificationLevels(): Promise<void> {
        const auth = await deps.getAuthOptions();
        const res = await apiFetchQualificationLevels(auth);
        if (res.status === 'success' && res.data) {
            deps.setQualificationLevels(res.data);
        }
    }

    async function fetchQualificationNodeTypes(): Promise<void> {
        const auth = await deps.getAuthOptions();
        const res = await apiFetchNodeTypes(auth);
        if (res.status === 'success' && res.data) {
            deps.setQualificationNodeTypes(res.data);
        }
    }

    async function refreshNodes(qualificationId?: string): Promise<void> {
        const { getCurrentIds, setLoadingNodes, setNodeHierarchy } = deps;
        const qid = qualificationId ?? getCurrentIds().qualificationId;
        if (!qid) return;
        setLoadingNodes(true);
        try {
            const auth = await deps.getAuthOptions();
            const res = await apiFetchNodes(qid, auth);
            if (res.status === 'success' && res.data) {
                setNodeHierarchy(res.data);
            }
        } finally {
            setLoadingNodes(false);
        }
    }

    async function fetchNodeSummary(nodeId: string): Promise<void> {
        const auth = await deps.getAuthOptions();
        const res = await apiFetchNodeSummary(nodeId, auth);
        if (res.status === 'success' && res.data) {
            deps.setCurrentNodeSummary(res.data);
        }
    }

    async function addQualification(
        qualification: Partial<Qualification>
    ): Promise<void> {
        const userId = deps.getUserId() ?? '';
        const auth = await deps.getAuthOptions();
        const input: NewQualification = {
            userId,
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
        const res = await apiCreateQualification(input, auth);
        if (res.status === 'success' && res.data) {
            const created = res.data;
            deps.setQualifications((prev) => [...prev, created]);
        } else {
            throw new Error(res.message || 'Failed to add qualification');
        }
    }

    async function updateQualification(
        updates: Partial<Qualification>,
        qualificationId?: string
    ): Promise<void> {
        const id = qualificationId ?? deps.getCurrentIds().qualificationId;
        if (!id) throw new Error('No qualification ID provided');
        const auth = await deps.getAuthOptions();
        const res = await apiUpdateQualification(id, updates, auth);
        if (res.status === 'success' && res.data) {
            const updated = res.data;
            deps.setQualifications((prev) =>
                prev.map((q) => (q.id === id ? updated : q))
            );
        } else {
            throw new Error(res.message || 'Failed to update qualification');
        }
    }

    async function deleteQualification(id: string): Promise<void> {
        const auth = await deps.getAuthOptions();
        const res = await apiDeleteQualification(id, auth);
        if (res.status === 'success') {
            deps.setQualifications((prev) => prev.filter((q) => q.id !== id));
            if (deps.getCurrentIds().qualificationId === id) {
                deps.setCurrentQualificationId(null);
                deps.setCurrentNodeId(null);
                deps.setNavigation([]);
            }
        } else {
            throw new Error(res.message || 'Failed to delete qualification');
        }
    }

    async function createNode(nodeData: NewNode): Promise<Node | null> {
        const auth = await deps.getAuthOptions();
        const res = await apiCreateNode(nodeData, auth);
        if (res.status === 'success' && res.data?.node) {
            const created = res.data.node;
            deps.setNodeHierarchy((prev) => [...prev, created]);
            return created;
        }
        throw new Error(res.message || 'Failed to create node');
    }

    async function updateNode(
        nodeId: string,
        updates: Partial<Node>
    ): Promise<void> {
        const auth = await deps.getAuthOptions();
        const res = await apiUpdateNode(nodeId, updates, auth);
        if (res.status === 'success' && res.data) {
            const updated = res.data;
            deps.setNodeHierarchy((prev) =>
                prev.map((n) => (n.id === nodeId ? updated : n))
            );
        }
    }

    async function deleteNode(nodeId: string): Promise<void> {
        const auth = await deps.getAuthOptions();
        const res = await apiDeleteNode(nodeId, auth);
        if (res.status === 'success') {
            deps.setNodeHierarchy((prev) =>
                prev.filter((n) => n.id !== nodeId)
            );
        }
    }

    async function updateGrade(input: UpdateGradeInput): Promise<void> {
        const auth = await deps.getAuthOptions();
        await apiUpdateGrade(input, auth);
    }

    async function updateWeights(
        parentId: string,
        input: WeightUpdateInput
    ): Promise<void> {
        const auth = await deps.getAuthOptions();
        await apiUpdateWeights(parentId, input, auth);
    }

    async function validateNode(nodeId: string): Promise<ValidationResult> {
        const auth = await deps.getAuthOptions();
        const res = await apiValidateNode(nodeId, auth);
        if (res.status === 'success' && res.data) return res.data;
        throw new Error(res.message || 'Failed to validate node');
    }

    return {
        refreshQualifications,
        fetchQualificationLevels,
        fetchQualificationNodeTypes,
        refreshNodes,
        fetchNodeSummary,
        addQualification,
        updateQualification,
        deleteQualification,
        createNode,
        updateNode,
        deleteNode,
        updateGrade,
        updateWeights,
        validateNode,
    };
}
