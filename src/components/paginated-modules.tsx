"use client";

import { useState } from "react";
import { ModuleCard } from "./module-card";

export function PaginatedModules({
  initialItems,
  initialTotalPages,
  q,
  category,
}: {
  initialItems: any[];
  initialTotalPages: number;
  q?: string;
  category?: string;
}) {
  const [items, setItems] = useState<any[]>(initialItems);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);

  // Animation states
  const [slideStatus, setSlideStatus] = useState<"idle" | "sliding-out" | "sliding-in" | "warp">("idle");
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");

  const goToPage = async (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages || loading) return;
    setLoading(true);

    const dir = page > currentPage ? "left" : "right";
    setSlideDirection(dir);

    try {
      const qs = new URLSearchParams();
      if (q) qs.set("q", q);
      if (category) qs.set("category", category);
      qs.set("page", page.toString());
      qs.set("limit", "3");

      const res = await fetch(`/api/modules?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      // Start slide out
      setSlideStatus("sliding-out");

      setTimeout(() => {
        // Warp to opposite side immediately
        setItems(data.items);
        setCurrentPage(page);
        setTotalPages(data.totalPages);
        setSlideStatus("warp");

        // Force browser layout reflow before sliding in
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setSlideStatus("sliding-in");
            // End animation
            setTimeout(() => {
              setSlideStatus("idle");
              setLoading(false);
            }, 300);
          });
        });
      }, 300); // Wait for sliding-out to complete
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  // Determine classes for smooth slider animation
  let transformClass = "translate-x-0 opacity-100 transition-all duration-300";
  if (slideStatus === "sliding-out") {
    transformClass = slideDirection === "left" ? "-translate-x-[120%] opacity-0 transition-all duration-300" : "translate-x-[120%] opacity-0 transition-all duration-300";
  } else if (slideStatus === "warp") {
    transformClass = slideDirection === "left" ? "translate-x-[120%] opacity-0" : "-translate-x-[120%] opacity-0";
  } else if (slideStatus === "sliding-in") {
    transformClass = "translate-x-0 opacity-100 transition-all duration-300";
  }

  return (
    <div className="col-span-full">
      <div className="overflow-hidden p-2">
        <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${transformClass}`}>
          {items.map((module) => (
            <ModuleCard key={module.id} module={module} hasVoted={module.hasVoted} />
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {/* First Button */}
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1 || loading}
            className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            &laquo; First
          </button>
          
          {/* Prev Button */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            &lsaquo; Prev
          </button>

          <span className="mx-2 text-sm text-gray-600 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          {/* Next Button */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Next &rsaquo;
          </button>
          
          {/* Last Button */}
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages || loading}
            className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Last &raquo;
          </button>
        </div>
      )}
    </div>
  );
}
