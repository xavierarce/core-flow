"use client";

import type { ReactNode } from "react";
import { GRAPH_NODES_MAP, GRAPH_BUGS, GRAPH_FIXES } from "@/registry/graph.registry";
import { NODE_COLOR, EDGE_COLOR } from "@/lib/graph-colors";
import { useCallerTree } from "./useCallerTree";
import type { TreeNode } from "./CallerTree.utils";

interface NodeRowProps {
  node: TreeNode;
  depth: number;
  ancestorHasMore: Array<boolean>;
  isLast: boolean;
}

const NodeRow = ({ node, depth, ancestorHasMore, isLast }: NodeRowProps): ReactNode => {
  const graphNode = GRAPH_NODES_MAP[node.nodeId];
  const col = graphNode.critical ? NODE_COLOR.critical : NODE_COLOR[graphNode.color];
  const bugs  = GRAPH_BUGS[node.nodeId];
  const fixes = GRAPH_FIXES[node.nodeId];

  return (
    <div>
      <div className="flex items-center min-h-[30px]">
        {/* Vertical guide lines from ancestors */}
        {ancestorHasMore.map((more, i) => (
          <div key={i} className="w-5 flex-shrink-0 flex justify-center self-stretch">
            {more && <div className="w-px bg-border/40" />}
          </div>
        ))}

        {/* Connector to parent */}
        {depth > 0 && (
          <div className="w-5 flex-shrink-0 self-stretch relative">
            <div className="absolute left-0 top-0 w-px bg-border/40"
              style={{ height: isLast ? "50%" : "100%" }} />
            <div className="absolute left-0 top-1/2 w-4 h-px bg-border/40" />
          </div>
        )}

        {/* Node body */}
        <div className="flex items-center gap-2 py-1 flex-1 min-w-0 pl-1">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: col }} />
          <span className="text-sm font-mono font-semibold leading-tight flex-shrink-0" style={{ color: col }}>
            {graphNode.label.replace("\n", " ")}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:inline">
            {graphNode.sub}
          </span>

          {node.alreadyShown && (
            <span className="text-[10px] text-muted-foreground italic flex-shrink-0">↩ shown above</span>
          )}
          {node.truncated && !node.alreadyShown && (
            <span className="text-[10px] text-muted-foreground italic flex-shrink-0">· · ·</span>
          )}

          {bugs && bugs.length > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-500/15 text-red-400 rounded-full flex-shrink-0">
              {bugs.length}B
            </span>
          )}
          {fixes && fixes.length > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full flex-shrink-0">
              {fixes.length}F
            </span>
          )}

          {node.parentEdge && (
            <span className="text-[10px] ml-auto pr-2 flex-shrink-0 font-mono"
              style={{ color: EDGE_COLOR[node.parentEdge.kind], opacity: 0.7 }}>
              {node.parentEdge.label}
            </span>
          )}
        </div>
      </div>

      {node.children.map((child, i) => {
        const childIsLast = i === node.children.length - 1;
        return (
          <NodeRow
            key={`${child.nodeId}-${depth + 1}-${i}`}
            node={child}
            depth={depth + 1}
            ancestorHasMore={[...ancestorHasMore, !isLast]}
            isLast={childIsLast}
          />
        );
      })}
    </div>
  );
};

export const CallerTree = () => {
  const { selectedRoute, setSelectedRoute, routeIds, tree } = useCallerTree();

  const chipBase = "px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors";

  return (
    <div className="w-full bg-[#0d1117] rounded-xl border border-border overflow-hidden">
      {/* Route picker */}
      <div className="p-3 border-b border-border">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
          Select a route to trace its full dependency chain
        </div>
        <div className="flex flex-wrap gap-1.5">
          {routeIds.map(route => (
            <button
              key={route}
              onClick={() => setSelectedRoute(route)}
              className={`${chipBase} ${
                selectedRoute === route
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-transparent text-muted-foreground border-border hover:border-emerald-500/30 hover:text-foreground"
              }`}
            >
              {route}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-b border-border flex gap-4 text-[10px] text-muted-foreground">
        <span><span className="text-red-400 font-bold">nB</span> = known bugs</span>
        <span><span className="text-emerald-400 font-bold">nF</span> = proposed fixes</span>
        <span><span className="italic">↩ shown above</span> = node already traced earlier in tree</span>
      </div>

      {/* Tree */}
      <div className="p-4 overflow-auto">
        <NodeRow node={tree} depth={0} ancestorHasMore={[]} isLast={true} />
      </div>
    </div>
  );
};
