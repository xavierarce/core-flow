import { Rule } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const RulesService = {
  async getAll(token: string | null): Promise<Array<Rule>> {
    if (!API_URL || !token) return [];

    const res = await fetch(`${API_URL}/category-rules`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return [];
    return res.json();
  },

  async delete(token: string | null, id: string) {
    await fetch(`${API_URL}/category-rules/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};
