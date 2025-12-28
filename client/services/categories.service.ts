import { Category } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const CategoriesService = {
  async getAll(): Promise<Category[]> {
    if (!API_URL) return [];

    const res = await fetch(`${API_URL}/categories`, {
      cache: "no-store", // Always fetch fresh categories
    });

    if (!res.ok) {
      console.error("Failed to fetch categories");
      return [];
    }
    return res.json();
  },
};
