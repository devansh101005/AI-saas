// Reusable skeleton loader for shimmer/loading effects
// Uses Tailwind's animate-pulse for the shimmer animation

export const CardSkeleton = () => (
  <div className='bg-white rounded-xl border border-gray-200 p-4 animate-pulse'>
    <div className='flex justify-between items-center'>
      <div>
        <div className='h-3 w-20 bg-gray-200 rounded mb-2'></div>
        <div className='h-6 w-12 bg-gray-200 rounded'></div>
      </div>
      <div className='w-10 h-10 bg-gray-200 rounded-lg'></div>
    </div>
  </div>
)

export const CreationSkeleton = () => (
  <div className='bg-white rounded-lg border border-gray-200 p-4 animate-pulse'>
    <div className='flex items-center gap-3 mb-3'>
      <div className='w-8 h-8 bg-gray-200 rounded-full'></div>
      <div className='h-4 w-32 bg-gray-200 rounded'></div>
    </div>
    <div className='space-y-2'>
      <div className='h-3 w-full bg-gray-200 rounded'></div>
      <div className='h-3 w-3/4 bg-gray-200 rounded'></div>
      <div className='h-3 w-1/2 bg-gray-200 rounded'></div>
    </div>
  </div>
)

export const ImageSkeleton = () => (
  <div className='relative inline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w-1/3'>
    <div className='w-full h-64 bg-gray-200 rounded-lg animate-pulse'></div>
  </div>
)
