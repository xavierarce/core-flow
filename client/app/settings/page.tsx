"use client";

import { useEffect, useState } from "react";
import { AppCard } from "@/components/shared";
import { CategoriesService } from "@/services/categories.service";
import { RulesService } from "@/services/rules.service";
import { Category } from "@/types";
import { Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data on Load
  useEffect(() => {
    const loadData = async () => {
      const [catsData, rulesData] = await Promise.all([
        CategoriesService.getAll(),
        RulesService.getAll(),
      ]);
      setCategories(catsData);
      setRules(rulesData);
      setLoading(false);
    };
    loadData();
  }, []);

  // Handle Delete Rule
  const handleDeleteRule = async (id: string) => {
    // Optimistic Update (Remove from UI immediately)
    setRules(rules.filter((r) => r.id !== id));
    // Tell Backend
    await RulesService.delete(id);
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <main className="min-h-screen bg-slate-50/50 p-8">
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm">Manage your automation rules</p>
        </div>
        <Link href="/">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
        {/* LEFT COL: Categories */}
        <AppCard title="My Categories" subtitle="Fixed list">
          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.name.charAt(0)}
                  </div>
                  <span className="font-medium text-slate-700">{cat.name}</span>
                </div>
                {/* Visual Flair: Usage count could go here later */}
              </div>
            ))}
          </div>
        </AppCard>

        {/* RIGHT COL: Automation Rules */}
        <AppCard
          title="Learned Rules"
          subtitle="Auto-categorization logic"
          extraHeader={
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
              {rules.length} Rules
            </span>
          }
        >
          {rules.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No rules learned yet. <br />
              Fix a transaction category to teach the AI!
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-3 bg-white border border-slate-100 shadow-sm rounded-lg group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      "{rule.keyword}"
                    </span>
                    <ArrowRight size={14} className="text-slate-300" />
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
                    onClick={() => handleDeleteRule(rule.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    title="Delete Rule"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </AppCard>
      </div>
    </main>
  );
}
