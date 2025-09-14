import { request } from '@/lib/client/http/request';
import type { APIResponse } from '@/types/api';
import type {
    NewNode,
    Node,
    NodeSummary,
    QualificationNodeType,
    UpdateGradeInput,
    ValidationResult,
    WeightUpdateInput,
} from '@/types';

export interface WithAuth {
    token: string;
    onUnauthorized?: () => void;
}

export async function fetchNodeTypes(
    auth: WithAuth
): Promise<APIResponse<QualificationNodeType[]>> {
    const { token, onUnauthorized } = auth;
    return request<QualificationNodeType[]>(`/api/node-types`, {
        token,
        onUnauthorized,
    });
}

export async function fetchNodes(
    qualificationId: string,
    auth: WithAuth
): Promise<APIResponse<Node[]>> {
    const { token, onUnauthorized } = auth;
    return request<Node[]>(
        `/api/nodes?qualificationId=${encodeURIComponent(qualificationId)}`,
        {
            token,
            onUnauthorized,
        }
    );
}

export async function fetchNodeSummary(
    nodeId: string,
    auth: WithAuth
): Promise<APIResponse<NodeSummary>> {
    const { token, onUnauthorized } = auth;
    return request<NodeSummary>(
        `/api/nodes/${encodeURIComponent(nodeId)}/summary`,
        {
            token,
            onUnauthorized,
        }
    );
}

export async function createNode(
    input: NewNode,
    auth: WithAuth
): Promise<APIResponse<{ node: Node; aggregate: unknown }>> {
    const { token, onUnauthorized } = auth;
    return request<{ node: Node; aggregate: unknown }>(`/api/nodes`, {
        method: 'POST',
        token,
        body: input,
        onUnauthorized,
    });
}

export async function updateNode(
    nodeId: string,
    updates: Partial<Node>,
    auth: WithAuth
): Promise<APIResponse<Node>> {
    const { token, onUnauthorized } = auth;
    return request<Node>(`/api/nodes/${encodeURIComponent(nodeId)}`, {
        method: 'PUT',
        token,
        body: updates,
        onUnauthorized,
    });
}

export async function deleteNode(
    nodeId: string,
    auth: WithAuth
): Promise<APIResponse<null>> {
    const { token, onUnauthorized } = auth;
    return request<null>(`/api/nodes/${encodeURIComponent(nodeId)}`, {
        method: 'DELETE',
        token,
        onUnauthorized,
    });
}

export async function updateGrade(
    input: UpdateGradeInput,
    auth: WithAuth
): Promise<APIResponse<null>> {
    const { token, onUnauthorized } = auth;
    return request<null>(
        `/api/nodes/${encodeURIComponent(input.nodeId)}/grade`,
        {
            method: 'PUT',
            token,
            body: input,
            onUnauthorized,
        }
    );
}

export async function updateWeights(
    parentId: string,
    input: WeightUpdateInput,
    auth: WithAuth
): Promise<APIResponse<null>> {
    const { token, onUnauthorized } = auth;
    return request<null>(`/api/nodes/${encodeURIComponent(parentId)}/weights`, {
        method: 'PUT',
        token,
        body: input,
        onUnauthorized,
    });
}

export async function validateNode(
    nodeId: string,
    auth: WithAuth
): Promise<APIResponse<ValidationResult>> {
    const { token, onUnauthorized } = auth;
    return request<ValidationResult>(
        `/api/nodes/${encodeURIComponent(nodeId)}/validate`,
        {
            token,
            onUnauthorized,
        }
    );
}
