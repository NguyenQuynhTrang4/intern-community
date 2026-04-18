import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/module-card";
import { SearchForm } from "@/components/search-form";
import { CategoryFilter } from "@/components/category-filter";
import { LoadMoreModules } from "@/components/load-more-modules";
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const session = await auth();

  const modules = await db.miniApp.findMany({
    where: {
      status: "APPROVED",
      ...(category ? { category: { slug: category } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    // DO NOT remove include — avoids N+1 on category/author fields.
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { voteCount: "desc" },
    take: 13,
  });

  const hasMore = modules.length > 12;
  const initialModules = hasMore ? modules.slice(0, 12) : modules;
  const initialNextCursor = hasMore ? initialModules[initialModules.length - 1].id : null;

  // Fetch which modules the current user has voted on
  let votedIds = new Set<string>();
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: initialModules.map((m: any) => m.id) },
      },
      select: { moduleId: true },
    });
    votedIds = new Set(votes.map((v: any) => v.moduleId));
  }

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Modules</h1>
          <p className="text-sm text-gray-500">
            Discover mini-apps built by the Intern developer community.
          </p>
        </div>

        <SearchForm initialQuery={q} />
      </div>

      {/* Category filter with URL query params, no full page reload */}
      <CategoryFilter categories={categories} defaultCategory={category} />

      {initialModules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No modules found.</p>
          {q && (
            <a href="/" className="mt-2 block text-sm text-blue-600 hover:underline">
              Clear search
            </a>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialModules.map((module: any) => (
            <ModuleCard
              key={module.id}
              module={module}
              hasVoted={votedIds.has(module.id)}
            />
          ))}
          <LoadMoreModules
            initialNextCursor={initialNextCursor}
            q={q}
            category={category}
          />
        </div>
      )}
    </div>
  );
}
