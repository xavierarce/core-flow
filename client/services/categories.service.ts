import { Category } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const CategoriesService = {
  async getAll(token: string | null): Promise<Array<Category>> {
    if (!API_URL || !token) return [];
    const res = await fetch(`${API_URL}/categories`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return res.json();
  },

  async create(token: string, data: { name: string; type: string; color: string }): Promise<Category> {
    const res = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create category");
    return res.json();
  },

  async update(token: string, id: string, data: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update category");
    return res.json();
  },

  async delete(token: string, id: string): Promise<void> {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete category");
  },
};
