import type { Node } from '@/types';

export function findNode(nodes: Node[], id: string): Node | undefined {
    return nodes.find((n) => n.id === id);
}

export function getParent(nodes: Node[], node: Node): Node | undefined {
    const pid = node.parentId ?? undefined;
    if (!pid) return undefined;
    return findNode(nodes, pid);
}

export function getChildren(nodes: Node[], parentId?: string | null): Node[] {
    const pid = parentId ?? null;
    return nodes.filter((n) => (n.parentId ?? null) === pid);
}

export function buildBreadcrumb(nodes: Node[], nodeId: string): Node[] {
    const node = findNode(nodes, nodeId);
    if (!node) return [];

    const chain: Node[] = [];
    const visited = new Set<string>();
    let current: Node | undefined = node;
    while (current) {
        if (visited.has(current.id)) break; // cycle detected
        visited.add(current.id);
        chain.unshift(current);
        const parent = getParent(nodes, current);
        current = parent;
    }
    return chain;
}

export function flattenTree(nodes: Node[], rootId?: string | null): Node[] {
    const visited = new Set<string>();
    const visit = (id: string | null | undefined, acc: Node[]) => {
        const children = getChildren(nodes, id ?? null);
        for (const child of children) {
            if (visited.has(child.id)) continue; // guard against cycles / duplicates
            visited.add(child.id);
            acc.push(child);
            visit(child.id, acc);
        }
    };

    const result: Node[] = [];
    if (rootId) {
        const root = findNode(nodes, rootId);
        if (root) {
            if (!visited.has(root.id)) {
                visited.add(root.id);
                result.push(root);
                visit(root.id, result);
            }
        }
        return result;
    }

    const roots = getChildren(nodes, null);
    for (const r of roots) {
        if (visited.has(r.id)) continue;
        visited.add(r.id);
        result.push(r);
        visit(r.id, result);
    }
    return result;
}
