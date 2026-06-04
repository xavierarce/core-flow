"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { AppCard } from "@/components/shared";
import { RulesService } from "@/services/rules.service";
import type { Rule } from "@/types";
import { ArrowRight, Trash2 } from "lucide-react";

interface RulesListProps {
  initialRules: Array<Rule>;
}

export const RulesList = ({ initialRules }: RulesListProps) => {
  const [rules, setRules] = useState<Array<Rule>>(initialRules);
  const { getToken } = useAuth();

  const handleDelete = async (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    const token = await getToken();
    await RulesService.delete(token, id);
  };

  return (
    <AppCard
      title="Learned Rules"
      subtitle="Auto-categorization logic"
      extraHeader={
        <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-1 rounded-full">
          {rules.length} Rules
        </span>
      }
    >
      {rules.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">
          No rules learned yet. <br />
          Fix a transaction category to teach the AI!
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3 bg-muted/40 border border-border rounded-lg group"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                  &quot;{rule.keyword}&quot;
                </span>
                <ArrowRight size={14} className="text-muted-foreground" />
                <span
                  className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: `${rule.category.color}20`,
                    color: rule.category.color,
                  }}
                >
                  {rule.category.name}
                </span>
              </div>
              <button
                onClick={() => handleDelete(rule.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                title="Delete rule"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </AppCard>
  );
};
