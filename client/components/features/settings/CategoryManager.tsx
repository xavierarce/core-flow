"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { AppCard, AppButton } from "@/components/shared";
import { CategoriesService } from "@/services/categories.service";
import type { Category } from "@/types";

const PRESET_COLORS = [
  "#059669", "#3b82f6", "#8b5cf6", "#f59e0b",
  "#ef4444", "#ec4899", "#14b8a6", "#f97316",
  "#64748b", "#84cc16", "#06b6d4", "#a855f7",
];

interface CategoryManagerProps {
  initialCategories: Array<Category>;
}

interface EditState {
  name: string;
  color: string;
  type: "INCOME" | "EXPENSE";
}

export const CategoryManager = ({ initialCategories }: CategoryManagerProps) => {
  const [categories, setCategories] = useState<Array<Category>>(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ name: "", color: "#64748b", type: "EXPENSE" });
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState<EditState>({ name: "", color: "#059669", type: "EXPENSE" });
  const { getToken } = useAuth();

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditState({ name: cat.name, color: cat.color, type: cat.type as "INCOME" | "EXPENSE" });
  };

  const saveEdit = async (id: string) => {
    const token = await getToken();
    if (!token) return;
    try {
      const updated = await CategoriesService.update(token, id, editState);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
      toast.success("Category updated");
    } catch {
      toast.error("Failed to update category");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category? Transactions will be uncategorized.")) return;
    const token = await getToken();
    if (!token) return;
    try {
      await CategoriesService.delete(token, id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const addCategory = async () => {
    if (!newCat.name.trim()) return;
    const token = await getToken();
    if (!token) return;
    try {
      const created = await CategoriesService.create(token, newCat);
      setCategories((prev) => [...prev, created]);
      setIsAdding(false);
      setNewCat({ name: "", color: "#059669", type: "EXPENSE" });
      toast.success("Category created");
    } catch {
      toast.error("Failed to create category");
    }
  };

  return (
    <AppCard
      title="Categories"
      subtitle={`${categories.length} total`}
      action={
        <AppButton
          variantType="primary"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setIsAdding(true)}
        >
          <Plus size={12} /> Add
        </AppButton>
      }
    >
      <div className="space-y-2">
        {/* Add new row */}
        {isAdding && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border">
            <ColorPicker value={newCat.color} onChange={(c) => setNewCat((s) => ({ ...s, color: c }))} />
            <input
              autoFocus
              value={newCat.name}
              onChange={(e) => setNewCat((s) => ({ ...s, name: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") addCategory(); if (e.key === "Escape") setIsAdding(false); }}
              placeholder="Category name..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <TypeToggle value={newCat.type} onChange={(t) => setNewCat((s) => ({ ...s, type: t }))} />
            <button onClick={addCategory} className="text-emerald-500 hover:text-emerald-400 p-1"><Check size={14} /></button>
            <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground p-1"><X size={14} /></button>
          </div>
        )}

        {categories.map((cat) =>
          editingId === cat.id ? (
            <div key={cat.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border">
              <ColorPicker value={editState.color} onChange={(c) => setEditState((s) => ({ ...s, color: c }))} />
              <input
                autoFocus
                value={editState.name}
                onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") saveEdit(cat.id); if (e.key === "Escape") setEditingId(null); }}
                className="flex-1 bg-transparent text-sm text-foreground outline-none"
              />
              <TypeToggle value={editState.type} onChange={(t) => setEditState((s) => ({ ...s, type: t }))} />
              <button onClick={() => saveEdit(cat.id)} className="text-emerald-500 hover:text-emerald-400 p-1"><Check size={14} /></button>
              <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground p-1"><X size={14} /></button>
            </div>
          ) : (
            <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 group">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: cat.color }}>
                  {cat.name.charAt(0)}
                </div>
                <span className="font-medium text-foreground text-sm">{cat.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{cat.type}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(cat)} className="text-muted-foreground hover:text-foreground p-1 rounded"><Pencil size={13} /></button>
                <button onClick={() => deleteCategory(cat.id)} className="text-muted-foreground hover:text-red-500 p-1 rounded"><Trash2 size={13} /></button>
              </div>
            </div>
          )
        )}

        {categories.length === 0 && !isAdding && (
          <p className="text-center py-6 text-muted-foreground text-sm">No categories yet.</p>
        )}
      </div>
    </AppCard>
  );
};

const ColorPicker = ({ value, onChange }: { value: string; onChange: (c: string) => void }) => {
  return (
    <div className="relative group/picker">
      <div className="w-6 h-6 rounded-full cursor-pointer border-2 border-border shrink-0" style={{ backgroundColor: value }} />
      <div className="absolute left-0 top-8 z-10 hidden group-hover/picker:grid grid-cols-4 gap-1 p-2 bg-popover border border-border rounded-lg shadow-lg">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
            style={{ backgroundColor: c, borderColor: c === value ? "white" : "transparent" }}
          />
        ))}
      </div>
    </div>
  );
};

const TypeToggle = ({ value, onChange }: { value: "INCOME" | "EXPENSE"; onChange: (t: "INCOME" | "EXPENSE") => void }) => (
  <button
    onClick={() => onChange(value === "EXPENSE" ? "INCOME" : "EXPENSE")}
    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors shrink-0 ${
      value === "INCOME"
        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        : "bg-red-500/15 text-red-400 border-red-500/30"
    }`}
  >
    {value}
  </button>
);
