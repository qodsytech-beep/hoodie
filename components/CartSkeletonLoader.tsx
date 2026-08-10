'use client'

export default function CartSkeletonLoader() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse font-cairo">
      {/* Title */}
      <div className="w-48 h-8 bg-neutral-200 rounded-lg mb-8"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Image */}
                <div className="w-full sm:w-32 h-32 bg-neutral-200 rounded-lg"></div>
                
                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div className="w-3/4 h-6 bg-neutral-200 rounded"></div>
                  <div className="w-1/2 h-4 bg-neutral-200 rounded"></div>
                  <div className="w-1/4 h-6 bg-neutral-200 rounded"></div>
                  
                  {/* Controls */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 border border-neutral-300 rounded-lg p-2">
                      <div className="w-6 h-6 bg-neutral-200 rounded"></div>
                      <div className="w-8 h-6 bg-neutral-200 rounded"></div>
                      <div className="w-6 h-6 bg-neutral-200 rounded"></div>
                    </div>
                    <div className="w-8 h-8 bg-neutral-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <div className="w-32 h-6 bg-neutral-200 rounded mb-6"></div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <div className="w-24 h-4 bg-neutral-200 rounded"></div>
                <div className="w-16 h-4 bg-neutral-200 rounded"></div>
              </div>
              <div className="flex justify-between">
                <div className="w-32 h-4 bg-neutral-200 rounded"></div>
                <div className="w-20 h-4 bg-neutral-200 rounded"></div>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <div className="flex justify-between mb-4">
                <div className="w-24 h-6 bg-neutral-200 rounded"></div>
                <div className="w-28 h-6 bg-neutral-200 rounded"></div>
              </div>
            </div>

            <div className="w-full h-12 bg-neutral-200 rounded-lg mb-4"></div>
            <div className="w-full h-10 bg-neutral-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

