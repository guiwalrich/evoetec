// src/app/(dashboard)/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="space-y-6 page-fade-in animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-zinc-200/80 rounded-xl" />
          <div className="h-4 w-96 bg-zinc-200/50 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-zinc-200/80 rounded-full" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-white border border-zinc-200/60 rounded-3xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-zinc-200/70 rounded" />
              <div className="h-8 w-8 bg-zinc-200/70 rounded-full" />
            </div>
            <div className="h-7 w-32 bg-zinc-300/80 rounded-lg" />
            <div className="h-3 w-20 bg-zinc-200/50 rounded" />
          </div>
        ))}
      </div>

      {/* Main Table / Detail Card Skeleton */}
      <div className="bg-white border border-zinc-200/60 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="h-5 w-48 bg-zinc-200/80 rounded-lg" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 w-full bg-zinc-100/70 rounded-xl flex items-center justify-between px-4">
              <div className="h-4 w-40 bg-zinc-200/80 rounded" />
              <div className="h-4 w-24 bg-zinc-200/60 rounded" />
              <div className="h-6 w-20 bg-zinc-200/80 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
