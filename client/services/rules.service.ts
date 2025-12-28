const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const RulesService = {
  async getAll() {
    const res = await fetch(`${API_URL}/category-rules`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  },

  async delete(id: string) {
    await fetch(`${API_URL}/category-rules/${id}`, { method: "DELETE" });
  },
};
