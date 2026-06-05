import { useTheme } from "next-themes";

export const useArchitectureGraph = () => {
  const { resolvedTheme } = useTheme();

  // resolvedTheme is undefined before client hydration — use as the mount signal
  const mounted = resolvedTheme !== undefined;

  return { mounted, isDark: resolvedTheme === "dark" };
};
