import type { TreeNode } from "./CallerTree.utils";

export interface NodeRowProps {
  node: TreeNode;
  depth: number;
  ancestorHasMore: Array<boolean>;
  isLast: boolean;
}
