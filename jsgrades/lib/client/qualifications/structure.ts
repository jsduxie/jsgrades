import type {
    Qualification,
    QualificationLevel,
    QualificationNodeType,
} from '@/types';

/**
 * Derive allowed child node type names for a given qualification level and parent node type.
 * We keep DB schema as-is (year/module/assessment) and map GCSE/A-level "subject" to module in UI.
 */
export function getAllowedChildTypeNames(
    levelNumber: number,
    parentTypeName?: string | null
): Array<'year' | 'module' | 'assessment'> {
    // Degree (L6) defaults: root -> year -> module -> assessment
    // Masters (L7 or single-year): root -> module -> assessment
    // GCSE/A-level (L2-L3): root -> module -> assessment
    if (!parentTypeName) {
        if (levelNumber >= 7) return ['module'];
        if (levelNumber <= 3) return ['module'];
        return ['year'];
    }

    switch (parentTypeName) {
        case 'year':
            return ['module'];
        case 'module':
            return ['assessment'];
        default:
            return [];
    }
}

/** Provide a UI label for a node type name given qualification level. */
export function getUiLabelForType(
    levelNumber: number,
    typeName: 'year' | 'module' | 'assessment'
): string {
    if (typeName === 'module' && levelNumber <= 3) return 'subject';
    return typeName;
}

/** Filter the available node types from API by allowed names. */
export function filterNodeTypesByNames(
    all: QualificationNodeType[],
    names: string[]
): QualificationNodeType[] {
    const set = new Set(names);
    return all.filter((t) => set.has(t.name));
}

/** Determine the qualification level number for a given qualification. */
export function resolveLevelNumber(
    levels: QualificationLevel[],
    qualification?: Qualification | null
): number | null {
    if (!qualification) return null;
    const lvl = levels.find((l) => l.id === qualification.level);
    return lvl?.level ?? null;
}
