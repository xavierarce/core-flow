import { useState, useMemo } from "react";
import type { AppRoutePath } from "@/types/registry.types";
import { ROUTE_TO_GRAPH_NODE } from "@/registry/graph.registry";
import { buildRouteTree } from "./CallerTree.utils";

const ROUTE_IDS = Object.keys(ROUTE_TO_GRAPH_NODE) as Array<AppRoutePath>;

export const useCallerTree = () => {
  const [selectedRoute, setSelectedRoute] = useState<AppRoutePath>("/transactions");

  const rootNodeId = ROUTE_TO_GRAPH_NODE[selectedRoute];

  const tree = useMemo(() => buildRouteTree(rootNodeId), [rootNodeId]);

  return { selectedRoute, setSelectedRoute, routeIds: ROUTE_IDS, tree };
};
