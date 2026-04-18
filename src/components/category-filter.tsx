"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  defaultCategory?: string;
}

/**
 * CategoryFilter — Client component for filtering modules by category
 * - Uses useRouter + useSearchParams for SPA-style URL updates (no full page reload)
 * - Preserves search query while changing category
 * - Accessible with ARIA labels and attributes
 */
export function CategoryFilter({ categories, defaultCategory }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleCategoryChange = (slug: string | null) => {
    startTransition(() => {
      // Create new URLSearchParams by copying current params
      const params = new URLSearchParams(searchParams.toString());

      if (slug === null) {
        // "All" was clicked — remove category param
        params.delete("category");
      } else {
        // Set new category
        params.set("category", slug);
      }

      // Update URL without full page reload
      // Preserve search query if it exists
      router.push(`/?${params.toString()}`);
    });
  };

  const currentCategory = searchParams.get("category");
  const isAllSelected = !currentCategory;

  return (
    <div 
      className={`flex flex-wrap gap-2 ${isPending ? "opacity-60" : ""}`}
      role="group"
      aria-label="Filter modules by category"
    >
      {/* "All" button */}
      <button
        onClick={() => handleCategoryChange(null)}
        disabled={isPending}
        aria-pressed={isAllSelected}
        aria-label="Show all modules"
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          isAllSelected
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        } ${isPending ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        All
      </button>

      {/* Category buttons */}
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => handleCategoryChange(c.slug)}
          disabled={isPending}
          aria-pressed={currentCategory === c.slug}
          aria-label={`Filter by ${c.name}`}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            currentCategory === c.slug
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          } ${isPending ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
