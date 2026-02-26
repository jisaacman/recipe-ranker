import { Recipe } from "@/types/recipe";
import RecipeCard from "@/components/RecipeCard";

interface Props {
  recipes: Recipe[];
  onDelete: (id: string) => void;
}

export default function RecipeList({ recipes, onDelete }: Props) {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-14 text-gray-400">
        <p className="text-sm">No recipes yet — add your first one above.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {recipes.map((recipe, index) => (
        <li key={recipe.id}>
          <RecipeCard
            recipe={recipe}
            rank={index + 1}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
}
