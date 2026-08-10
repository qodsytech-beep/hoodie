'use client'

export default function SkeletonLoader() {
  return (
    <div className="animate-pulse font-cairo">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div className="w-32 h-16 bg-neutral-200 rounded-lg"></div>
      </div>

      {/* Header */}
      <div className="bg-neutral-100 h-16 mb-6 rounded-lg flex items-center justify-between px-4">
        <div className="w-20 h-8 bg-neutral-200 rounded"></div>
        <div className="w-20 h-8 bg-neutral-200 rounded"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 space-y-6">
        {/* Title */}
        <div className="w-64 h-8 bg-neutral-200 rounded mx-auto"></div>

        {/* Wide Input */}
        <div className="w-full h-12 bg-neutral-200 rounded-lg"></div>

        {/* Two Inputs Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="w-full h-12 bg-neutral-200 rounded-lg"></div>
          <div className="w-full h-12 bg-neutral-200 rounded-lg"></div>
        </div>

        {/* Wide Input */}
        <div className="w-full h-24 bg-neutral-200 rounded-lg"></div>

        {/* Three Inputs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="w-full h-12 bg-neutral-200 rounded-lg"></div>
          <div className="w-full h-12 bg-neutral-200 rounded-lg"></div>
          <div className="w-full h-12 bg-neutral-200 rounded-lg"></div>
        </div>

        {/* Two Stacked Inputs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <div className="w-full h-12 bg-neutral-200 rounded-lg"></div>
            <div className="w-full h-12 bg-neutral-200 rounded-lg"></div>
          </div>
          <div className="w-full h-12 bg-neutral-200 rounded-lg"></div>
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-neutral-200 my-6"></div>

        {/* Bottom Section */}
        <div className="w-full h-32 bg-neutral-200 rounded-lg"></div>

        {/* Button */}
        <div className="flex justify-end">
          <div className="w-32 h-12 bg-neutral-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}

