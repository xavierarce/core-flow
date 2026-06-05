"use client";

import { useCallerTree } from "./useCallerTree";
import { NodeRow } from "./NodeRow";

export const CallerTree = () => {
  const { selectedRoute, setSelectedRoute, routeIds, tree } = useCallerTree();

  const chipBase = "px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors";

  return (
    <div className="w-full bg-[#0d1117] rounded-xl border border-border overflow-hidden">
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

      <div className="px-4 py-2 border-b border-border flex gap-4 text-[10px] text-muted-foreground">
        <span><span className="text-red-400 font-bold">nB</span> = known bugs</span>
        <span><span className="text-emerald-400 font-bold">nF</span> = proposed fixes</span>
        <span><span className="italic">↩ shown above</span> = node already traced earlier in tree</span>
      </div>

      <div className="p-4 overflow-auto">
        <NodeRow node={tree} depth={0} ancestorHasMore={[]} isLast={true} />
      </div>
    </div>
  );
};
