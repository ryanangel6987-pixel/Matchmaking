import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-56 bg-surface-container-high" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl bg-surface-container-high" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-2xl bg-surface-container-high" />
    </div>
  );
}
