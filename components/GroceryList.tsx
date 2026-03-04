"use client";

import { useState } from "react";

interface RecipeInput {
  name: string;
  category: string;
  author?: string;
  ingredients?: string[];
}

interface GrocerySection {
  category: string;
  items: string[];
}

type OverrideMap = Record<string, { text: string; skip: boolean }>;

interface Props {
  recipes: RecipeInput[];
  onClose: () => void;
}

export default function GroceryList({ recipes, onClose }: Props) {
  const [phase, setPhase] = useState<"setup" | "generating" | "done">("setup");
  const [sections, setSections] = useState<GrocerySection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [overrides, setOverrides] = useState<OverrideMap>(
    Object.fromEntries(recipes.map((r) => [r.name, { text: "", skip: false }]))
  );

  const withIngredients = recipes.filter((r) => r.ingredients && r.ingredients.length > 0);
  const missing = recipes.filter((r) => !r.ingredients || r.ingredients.length === 0);

  const generate = async () => {
    const recipesToSend = recipes
      .filter((r) => {
        if (r.ingredients && r.ingredients.length > 0) return true;
        const ov = overrides[r.name];
        return !ov?.skip && ov?.text.trim().length > 0;
      })
      .map((r) => {
        if (r.ingredients && r.ingredients.length > 0) return r;
        const lines = overrides[r.name]?.text.split("\n").map((s) => s.trim()).filter(Boolean);
        return { ...r, ingredients: lines ?? [] };
      });

    if (recipesToSend.length === 0) {
      setError("Add ingredients to at least one recipe to generate a list.");
      return;
    }

    setPhase("generating");
    setError(null);
    setChecked(new Set());

    try {
      const res = await fetch("/api/grocery-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipes: recipesToSend }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSections(data.sections ?? []);
      setPhase("done");
    } catch {
      setError("Couldn't generate the list. Try again.");
      setPhase("setup");
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
                {phase === "done"
                  ? `${checkedCount}/${totalCount} checked`
                  : `${recipes.length} recipe${recipes.length !== 1 ? "s" : ""} this week`}
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
        <div className="overflow-y-auto flex-1 px-5 py-4">

          {phase === "setup" && (
            <div className="space-y-5">
              {error && <p className="text-xs text-rose-400">{error}</p>}

              {withIngredients.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Ready</p>
                  {withIngredients.map((r) => (
                    <div key={r.name} className="flex items-center gap-3 py-2.5 border-b border-stone-50 last:border-0">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4l1.5 1.5 3.5-3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-sm text-stone-700 flex-1">{r.name}</span>
                      <span className="text-xs text-stone-300">{r.ingredients!.length} ingredients</span>
                    </div>
                  ))}
                </div>
              )}

              {missing.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">Missing ingredients</p>
                  <p className="text-xs text-stone-400 mb-3">
                    Type them below, or skip. To fetch from a URL or photo, open the recipe on the Rankings page first.
                  </p>
                  {missing.map((r) => {
                    const ov = overrides[r.name];
                    return (
                      <div key={r.name} className="py-3 border-b border-stone-50 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-stone-700">{r.name}</span>
                          <button
                            onClick={() =>
                              setOverrides((prev) => ({
                                ...prev,
                                [r.name]: { text: "", skip: !prev[r.name].skip },
                              }))
                            }
                            className={`text-xs transition-colors ${
                              ov.skip ? "text-blue-400 hover:text-blue-500" : "text-stone-300 hover:text-rose-400"
                            }`}
                          >
                            {ov.skip ? "Undo" : "Ignore"}
                          </button>
                        </div>
                        {ov.skip ? (
                          <p className="text-xs text-stone-300">Ignored — won&apos;t appear in list.</p>
                        ) : (
                          <textarea
                            value={ov.text}
                            onChange={(e) =>
                              setOverrides((prev) => ({
                                ...prev,
                                [r.name]: { ...prev[r.name], text: e.target.value },
                              }))
                            }
                            placeholder={"1 cup flour\n2 eggs\n1 tsp vanilla\n(one per line)"}
                            rows={3}
                            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 resize-none placeholder:text-stone-300"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {phase === "generating" && (
            <div className="text-center py-12">
              <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-stone-400">Generating your grocery list...</p>
            </div>
          )}

          {phase === "done" && (
            sections.length === 0 ? (
              <p className="text-center text-sm text-stone-400 py-12">No items generated.</p>
            ) : (
              <div className="space-y-5">
                {sections.map((section) => (
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
                            <button onClick={() => toggleItem(key)} className="flex items-center gap-3 w-full text-left group">
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isChecked ? "bg-emerald-500 border-emerald-500" : "border-stone-200 group-hover:border-stone-400"}`}>
                                {isChecked && (
                                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                    <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </div>
                              <span className={`text-sm transition-colors ${isChecked ? "line-through text-stone-300" : "text-stone-700"}`}>
                                {item}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        {phase === "setup" && (
          <div className="p-4 border-t border-stone-50 shrink-0">
            <button
              onClick={generate}
              className="w-full bg-stone-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              Generate grocery list
            </button>
          </div>
        )}

        {phase === "done" && (
          <div className="p-4 border-t border-stone-50 shrink-0">
            <button
              onClick={() => { setPhase("setup"); setError(null); }}
              className="w-full text-xs text-stone-400 hover:text-stone-600 transition-colors py-1"
            >
              Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
