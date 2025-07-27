export type Qualification = {
    id: string;
    userId: string;
    level: string;
    name: string;
    institution: string;
    startDate: Date;
    endDate: Date;
    currentGrade: number;
    targetGrade: number;
    predictedGrade: number;
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
