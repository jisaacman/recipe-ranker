"use client";

import { useState } from "react";
import { PendingRecipe, CATEGORIES } from "@/types/recipe";

const EMPTY: PendingRecipe = {
  name: "",
  author: "",
  source: "",
  category: "Lunch/Dinner",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PendingRecipe) => void;
}

export default function RecipeForm({ isOpen, onClose, onSubmit }: Props) {
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md">
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-stone-900">Add a recipe</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-stone-300 hover:text-stone-500 text-xl leading-none"
            >
              ×
            </button>
          </div>

          <input
            required
            autoFocus
            placeholder="Recipe name *"
            value={form.name}
            onChange={handleChange("name")}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 placeholder:text-stone-300"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Author / Chef"
              value={form.author}
              onChange={handleChange("author")}
              className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 placeholder:text-stone-300"
            />
            <input
              placeholder="Source or book"
              value={form.source}
              onChange={handleChange("source")}
              className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 placeholder:text-stone-300"
            />
          </div>

          <select
            value={form.category}
            onChange={handleChange("category")}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 bg-white text-stone-700"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full bg-stone-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            Add Recipe
          </button>
        </form>
      </div>
    </div>
  );
}
