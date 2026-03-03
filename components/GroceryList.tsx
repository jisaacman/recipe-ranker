"use client";

import { useState, useEffect } from "react";

interface RecipeInput {
  name: string;
  category: string;
  author?: string;
}

interface GrocerySection {
  category: string;
  items: string[];
}

interface Props {
  recipes: RecipeInput[];
  onClose: () => void;
}

export default function GroceryList({ recipes, onClose }: Props) {
  const [sections, setSections] = useState<GrocerySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setChecked(new Set());
    try {
      const res = await fetch("/api/grocery-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipes }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSections(data.sections ?? []);
    } catch {
      setError("Couldn't generate the list. Check your API key or try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (key: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const checkedCount = checked.size;
  const totalCount = sections.reduce((s, sec) => s + sec.items.length, 0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="p-5 pb-3 border-b border-stone-100 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-stone-900">Grocery List</h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} this week
                {!loading && totalCount > 0 && ` · ${checkedCount}/${totalCount} checked`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-stone-300 hover:text-stone-500 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-stone-400">Generating your grocery list...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm text-stone-400">{error}</p>
              <button
                onClick={generate}
                className="text-sm text-stone-600 border border-stone-200 rounded-xl px-4 py-2 hover:bg-stone-50 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : sections.length === 0 ? (
            <p className="text-center text-sm text-stone-400 py-12">
              No items generated.
            </p>
          ) : (
            sections.map((section) => (
              <div key={section.category}>
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2.5">
                  {section.category}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item, i) => {
                    const key = `${section.category}||${i}`;
                    const isChecked = checked.has(key);
                    return (
                      <li key={key}>
                        <button
                          onClick={() => toggleItem(key)}
                          className="flex items-center gap-3 w-full text-left group"
                        >
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                              isChecked
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-stone-200 group-hover:border-stone-400"
                            }`}
                          >
                            {isChecked && (
                              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                <path
                                  d="M2 5.5l2.5 2.5 4.5-4.5"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <span
                            className={`text-sm transition-colors ${
                              isChecked
                                ? "line-through text-stone-300"
                                : "text-stone-700"
                            }`}
                          >
                            {item}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {!loading && !error && sections.length > 0 && (
          <div className="p-4 border-t border-stone-50 shrink-0">
            <button
              onClick={generate}
              className="w-full text-xs text-stone-400 hover:text-stone-600 transition-colors py-1"
            >
              Regenerate list
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
