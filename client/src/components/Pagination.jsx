import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  return (
    <div className='flex items-center justify-center gap-3 mt-6'>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className='p-2 rounded-lg border border-gray-300 disabled:opacity-30
        disabled:cursor-not-allowed hover:bg-gray-50 transition cursor-pointer'
      >
        <ChevronLeft className='w-4 h-4' />
      </button>

      <span className='text-sm text-gray-600'>
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className='p-2 rounded-lg border border-gray-300 disabled:opacity-30
        disabled:cursor-not-allowed hover:bg-gray-50 transition cursor-pointer'
      >
        <ChevronRight className='w-4 h-4' />
      </button>
    </div>
  )
}

export default Pagination
