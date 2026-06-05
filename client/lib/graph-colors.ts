import type { GraphNodeColor, GraphEdgeKind } from "@/types/registry.types";

export const NODE_COLOR: Record<GraphNodeColor | "critical", string> = {
  client:   "#34d399",
  route:    "#60a5fa",
  service:  "#fbbf24",
  db:       "#a78bfa",
  external: "#94a3b8",
  critical: "#f87171",
};

export const EDGE_COLOR: Record<GraphEdgeKind, string> = {
  critical: "#f87171",
  api:      "#60a5fa",
  db:       "#a78bfa",
  mount:    "#6b7280",
  normal:   "#6b7280",
};
