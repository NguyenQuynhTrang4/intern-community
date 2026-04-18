"use client";

import { useEffect, useState } from "react";

interface SearchFormProps {
  initialQuery?: string;
}

export function SearchForm({ initialQuery = "" }: SearchFormProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <form className="flex gap-2">
        <div className="h-10 w-48 rounded-lg border border-gray-300 bg-gray-100" />
        <div className="h-10 w-20 rounded-lg bg-blue-600" />
      </form>
    );
  }

  return (
    <form className="flex gap-2">
      <input
        name="q"
        defaultValue={initialQuery}
        placeholder="Search modules…"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
}
