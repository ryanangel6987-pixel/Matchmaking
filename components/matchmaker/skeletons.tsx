import { Skeleton } from "@/components/ui/skeleton";

export function KpiStripSkeleton() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl bg-surface-container-high" />
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-2xl bg-surface-container-high" />
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="bg-surface-container-low rounded-2xl p-8 space-y-6">
      <Skeleton className="h-6 w-48 bg-surface-container-high" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20 bg-surface-container-high" />
            <Skeleton className="h-10 rounded-xl bg-surface-container-high" />
          </div>
        ))}
      </div>
      <Skeleton className="h-12 rounded-full bg-surface-container-high" />
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-14 rounded-xl bg-surface-container-high" />
      ))}
    </div>
  );
}

export function PhotoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[4/5] rounded-2xl bg-surface-container-high" />
          <Skeleton className="h-8 rounded-xl bg-surface-container-high" />
        </div>
      ))}
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-surface-container-high" />
        <Skeleton className="h-8 w-64 bg-surface-container-high" />
      </div>
      <Skeleton className="h-10 rounded-xl bg-surface-container-high" />
      <KpiStripSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Skeleton className="h-64 rounded-2xl bg-surface-container-high" />
          <Skeleton className="h-48 rounded-2xl bg-surface-container-high" />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-48 rounded-2xl bg-surface-container-high" />
          <Skeleton className="h-48 rounded-2xl bg-surface-container-high" />
        </div>
      </div>
    </div>
  );
}
