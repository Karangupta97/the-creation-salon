export default function ActivityLoading() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-gray-100">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-24"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
