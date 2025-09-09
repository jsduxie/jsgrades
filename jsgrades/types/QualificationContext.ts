import { Qualification, QualificationLevel } from '@/types/qualification';
import {
    NewNode,
    Node,
    NodeSummary,
    UpdateGradeInput,
    ValidationResult,
    WeightUpdateInput,
} from '@/types/qualificationNode';

export type QualificationContext = {
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
};
