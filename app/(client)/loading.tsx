import { Skeleton } from "@/components/ui/skeleton";

export default function ClientLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64 bg-surface-container-high" />
      <Skeleton className="h-4 w-32 bg-surface-container-high" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl bg-surface-container-high" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-2xl bg-surface-container-high" />
      <Skeleton className="h-32 rounded-2xl bg-surface-container-high" />
    </div>
  );
}
