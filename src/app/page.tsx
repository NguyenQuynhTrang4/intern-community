import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/module-card";
import { SearchForm } from "@/components/search-form";
import { CategoryFilter } from "@/components/category-filter";
import { PaginatedModules } from "@/components/paginated-modules";
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const session = await auth();

  const whereCondition: any = {
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
  };

  const totalCount = await db.miniApp.count({ where: whereCondition });

  const initialModules = await db.miniApp.findMany({
    where: whereCondition,
    // DO NOT remove include — avoids N+1 on category/author fields.
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { voteCount: "desc" },
    take: 3,
  });

  const initialTotalPages = Math.ceil(totalCount / 3);

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
        <PaginatedModules
          initialItems={initialModules}
          initialTotalPages={initialTotalPages}
          q={q}
          category={category}
        />
      )}
    </div>
  );
}
