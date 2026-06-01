"use client";

import { Check } from "lucide-react";
import { CHOIR_GOALS } from "@/lib/goals";
import { cn } from "@/lib/utils";
import type { ChoirGoalId } from "@/lib/types";

export function GoalPicker({
  selected,
  onToggle,
}: {
  selected: ChoirGoalId[];
  onToggle: (id: ChoirGoalId) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {CHOIR_GOALS.map((goal) => {
        const isSelected = selected.includes(goal.id);
        const Icon = goal.icon;
        return (
          <button
            key={goal.id}
            type="button"
            onClick={() => onToggle(goal.id)}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 text-left transition",
              isSelected
                ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                : "border-brand-200 bg-white hover:border-brand-300",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                isSelected ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-600",
              )}
            >
              {isSelected ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </span>
            <span>
              <span className="block font-semibold text-brand-900">{goal.label}</span>
              <span className="mt-0.5 block text-sm text-brand-500">{goal.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
