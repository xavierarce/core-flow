import type { GraphNodeId, GraphEdgeKind } from "@/types/registry.types";
import type { GraphEdge } from "@/types/registry.types";
import { GRAPH_EDGES } from "@/registry/graph.registry";

export const MAX_DEPTH = 6;

export interface ParentEdge {
  label: string;
  kind: GraphEdgeKind;
}

export interface TreeNode {
  nodeId: GraphNodeId;
  parentEdge: ParentEdge | null;
  children: Array<TreeNode>;
  alreadyShown: boolean;
  truncated: boolean;
}

const buildTree = (
  nodeId: GraphNodeId,
  parentEdge: ParentEdge | null,
  edges: Array<GraphEdge>,
  shown: Set<GraphNodeId>,
  depth: number,
): TreeNode => {
  const alreadyShown = shown.has(nodeId) && depth > 0;
  shown.add(nodeId);

  const truncated = depth >= MAX_DEPTH || alreadyShown;

  const children: Array<TreeNode> = truncated ? [] : edges
    .filter(e => e.from === nodeId)
    .map(e => buildTree(e.to, { label: e.label, kind: e.kind }, edges, shown, depth + 1));

  return { nodeId, parentEdge, children, alreadyShown, truncated };
};

export const buildRouteTree = (routeId: GraphNodeId): TreeNode =>
  buildTree(routeId, null, GRAPH_EDGES, new Set(), 0);
