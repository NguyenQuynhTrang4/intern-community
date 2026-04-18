"use client";

import { useState } from "react";
import { ModuleCard } from "./module-card";

export function LoadMoreModules({
  initialNextCursor,
  q,
  category,
}: {
  initialNextCursor: string | null;
  q?: string;
  category?: string;
}) {
  const [modules, setModules] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(initialNextCursor);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (q) qs.set("q", q);
      if (category) qs.set("category", category);
      qs.set("cursor", cursor);

      const res = await fetch(`/api/modules?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setModules((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!cursor && modules.length === 0) return null;

  return (
    <>
      {modules.map((module: any) => (
        <ModuleCard
          key={module.id}
          module={module}
          hasVoted={module.hasVoted}
        />
      ))}
      {cursor && (
        <div className="col-span-full pt-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-full bg-blue-50 px-6 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}
