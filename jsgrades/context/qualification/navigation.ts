import { buildBreadcrumb } from '@/lib/client/qualifications/selectors';

export { buildBreadcrumb };

export function navigateBack(
    navigation: string[],
    setCurrentNode: (id: string) => void
): void {
    if (navigation.length > 1) {
        const parentNodeId = navigation[navigation.length - 2];
        setCurrentNode(parentNodeId);
    }
}
