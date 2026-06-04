import { AppCard } from "@/components/shared";
import type { Category } from "@/types";

interface CategoriesListProps {
  categories: Array<Category>;
}

export const CategoriesList = ({ categories }: CategoriesListProps) => {
  return (
    <AppCard title="My Categories" subtitle="Fixed list">
      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between p-2 bg-muted/50 rounded-lg border border-border"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: cat.color }}
              >
                {cat.name.charAt(0)}
              </div>
              <span className="font-medium text-foreground">{cat.name}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground">
              {cat.type}
            </span>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-center py-6 text-muted-foreground text-sm">
            No categories found.
          </p>
        )}
      </div>
    </AppCard>
  );
};
