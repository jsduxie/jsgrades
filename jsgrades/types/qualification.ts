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
    onClose: () => void;
    onSave: (q: Partial<Qualification>) => void;
};

export type QualificationLevel = {
    id: string;
    name: string;
    level: number;
};

export type NewQualification = {
    userId: string;
    level: string;
    name: string;
    institution: string;
    startDate?: Date | null;
    endDate?: Date | null;
    currentGrade?: number | null;
    targetGrade?: number | null;
    predictedGrade?: number | null;
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
