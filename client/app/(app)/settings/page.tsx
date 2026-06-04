import { auth } from "@clerk/nextjs/server";

import { CategoriesService } from "@/services/categories.service";
import { RulesService } from "@/services/rules.service";

import { PageHeader } from "@/components/layout/PageHeader";
import { CategoryManager } from "@/components/features/settings/CategoryManager";
import { RulesList } from "@/components/features/settings/RulesList";

export default async function SettingsPage() {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return null;

  const [categories, rules] = await Promise.all([
    CategoriesService.getAll(token),
    RulesService.getAll(token),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your categories and automation rules."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <CategoryManager initialCategories={categories} />
        <RulesList initialRules={rules} />
      </div>
    </div>
  );
}
