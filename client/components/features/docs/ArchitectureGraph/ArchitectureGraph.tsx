"use client";

import { useArchitectureGraph } from "./useArchitectureGraph";
import { Arrow } from "./Arrow";
import { LAYERS } from "./ArchitectureGraph.utils";

export const ArchitectureGraph = () => {
  const { mounted, isDark } = useArchitectureGraph();

  if (!mounted) return <div className="h-64 bg-muted/20 rounded-lg animate-pulse" />;

  return (
    <div className="space-y-0">
      {LAYERS.map((layer, i) => (
        <div key={layer.id}>
          <div className={`rounded-xl border p-4 ${layer.bgClass} ${layer.borderClass}`}>
            <div className="flex items-baseline gap-3 mb-3">
              <span className={`text-sm font-bold ${layer.textColor}`}>{layer.title}</span>
              <span className="text-xs text-muted-foreground">{layer.subtitle}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {layer.nodes.map((node) => (
                <div
                  key={node.label}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs"
                  style={{
                    backgroundColor: isDark ? `${layer.color}18` : `${layer.color}12`,
                    borderColor: `${layer.color}35`,
                  }}
                >
                  <span className="font-medium text-foreground">{node.label}</span>
                  {node.detail && (
                    <span className="text-muted-foreground hidden sm:inline">— {node.detail}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {i < LAYERS.length - 1 && <Arrow color={LAYERS[i + 1].color} />}
        </div>
      ))}
    </div>
  );
};
