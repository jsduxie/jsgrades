export type Qualification = {
    id: string;
    userId: string;
    level: string;
    name: string;
    institution: string;
    startDate?: Date;
    endDate?: Date;
    currentGrade?: number | null;
    targetGrade?: number | null;
    predictedGrade?: number | null;
    inProgress: boolean;
    created: Date;
    updated: Date;
};

export type AddQualificationProps = {
    open: boolean;
    onCloseAction: () => void;
    onSaveAction: (q: Partial<Qualification>) => void;
};

export type QualificationLevel = {
    id: string;
    name: string;
    level: number;
};

export type QualificationNodeType = {
    id: string;
    name: string;
    allowChildren: boolean;
};

export type NewQualification = {
    userId: string;
    level: string;
    name: string;
    institution: string;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    currentGrade?: number | undefined;
    targetGrade?: number | undefined;
    predictedGrade?: number | undefined;
    inProgress?: boolean;
};

export interface QualificationFormData {
    name: string;
    institution: string;
    level: string;
    startDate: string;
    endDate: string;
    currentGrade: string;
    targetGrade: string;
    predictedGrade: string;
    inProgress: boolean;
}

export interface QualificationNodeFormData {
    qualificationId: string;
    userId: string;
    parentId: string;
    name: string;
    type: QualificationNodeType | undefined;
    weight: number;
    credits: number;
    startDate: string;
    endDate: string;
    targetGrade: string;
    currentGrade: string;
    predictedGrade: string;
    inProgress: boolean;
}

export type AddQualificationNodeProps = {
    open: boolean;
    onCloseAction: () => void;
    onSaveAction: (data: QualificationNodeFormData) => void | Promise<void>;
};
