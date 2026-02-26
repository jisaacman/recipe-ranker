"use client";

import { useState } from "react";
import { PendingRecipe, CATEGORIES } from "@/types/recipe";

const EMPTY: PendingRecipe = {
  name: "",
  author: "",
  source: "",
  category: "Dinner",
};

interface Props {
  onSubmit: (data: PendingRecipe) => void;
}

export default function RecipeForm({ onSubmit }: Props) {
  const [form, setForm] = useState<PendingRecipe>(EMPTY);

  const handleChange =
    (key: keyof PendingRecipe) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({ ...form, name: form.name.trim() });
    setForm(EMPTY);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
    >
      <h2 className="text-lg font-semibold text-gray-900">Add a Recipe</h2>

      <input
        required
        placeholder="Recipe name *"
        value={form.name}
        onChange={handleChange("name")}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="Author / Chef"
          value={form.author}
          onChange={handleChange("author")}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
        />
        <input
          placeholder="Source (URL or book)"
          value={form.source}
          onChange={handleChange("source")}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      <select
        value={form.category}
        onChange={handleChange("category")}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="w-full bg-gray-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors"
      >
        Add Recipe
      </button>
    </form>
  );
}
