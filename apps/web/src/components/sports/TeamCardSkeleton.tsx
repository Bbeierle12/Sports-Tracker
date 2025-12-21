export function TeamCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-gray-700 p-5 animate-pulse">
      {/* Team header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-surface-light rounded-lg" />
        <div className="flex-1">
          <div className="h-5 bg-surface-light rounded w-3/4 mb-2" />
          <div className="h-4 bg-surface-light rounded w-1/4" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-surface-light rounded w-16" />
          <div className="h-4 bg-surface-light rounded w-24" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-surface-light rounded w-16" />
          <div className="h-4 bg-surface-light rounded w-32" />
        </div>
      </div>
    </div>
  );
}

export function LeaderboardCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-gray-700 p-5 animate-pulse">
      {/* Header */}
      <div className="mb-4">
        <div className="h-6 bg-surface-light rounded w-2/3 mb-2" />
        <div className="h-4 bg-surface-light rounded w-1/2 mb-1" />
        <div className="h-3 bg-surface-light rounded w-1/3" />
      </div>

      {/* Leaderboard rows */}
      <div className="border-t border-gray-700 pt-4 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4 py-2">
            <div className="w-6 h-4 bg-surface-light rounded" />
            <div className="flex-1 h-4 bg-surface-light rounded" />
            <div className="w-12 h-4 bg-surface-light rounded" />
            <div className="w-12 h-4 bg-surface-light rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeamCardSkeleton;
