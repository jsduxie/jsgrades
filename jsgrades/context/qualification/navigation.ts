import { buildBreadcrumb } from '@/lib/client/qualifications/selectors';

export { buildBreadcrumb };

export function navigateBack(
    navigation: string[],
    setCurrentNode: (id: string) => void,
    setCurrentNodeId?: (id: string | null) => void,
    setNavigation?: (nav: string[]) => void,
    setCurrentNodeSummary?: (summary: any) => void
): void {
    if (navigation.length > 1) {
        const parentNodeId = navigation[navigation.length - 2];
        setCurrentNode(parentNodeId);
    } else if (navigation.length === 1 && setCurrentNodeId && setNavigation && setCurrentNodeSummary) {
        // At top-level node, navigate back to qualification summary
        setCurrentNodeId(null);
        setNavigation([]);
        setCurrentNodeSummary(null);
    }
}
