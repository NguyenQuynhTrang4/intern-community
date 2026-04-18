"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteSubmissionButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this submission?")) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/modules/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 border-red-200 hover:bg-red-100 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
