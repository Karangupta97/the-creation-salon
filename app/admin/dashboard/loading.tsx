export default function DashboardLoading() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Message Skeleton */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg animate-pulse">
        <div className="h-6 sm:h-8 bg-purple-500/50 rounded w-1/3 mb-2"></div>
        <div className="h-3 sm:h-4 bg-purple-500/50 rounded w-1/2"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex-1">
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Schedule Skeleton */}
        <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 animate-pulse">
          <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/4 mb-4 sm:mb-6"></div>
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-gray-100"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0 w-full">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                  <div className="text-left sm:text-right">
                    <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-20 flex-shrink-0"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Skeleton */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 animate-pulse">
          <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/2 mb-4 sm:mb-6"></div>
          <div className="space-y-2 sm:space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 rounded flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded-full w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 animate-pulse">
        <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/4 mb-4 sm:mb-6"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-gray-50"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
