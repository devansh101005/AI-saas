const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
      <div className='bg-red-50 border border-red-200 rounded-xl p-8 max-w-md'>
        <h2 className='text-xl font-semibold text-red-700 mb-2'>Something went wrong</h2>
        <p className='text-sm text-red-600 mb-4'>
          {error?.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className='px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition cursor-pointer'
        >
          Try again
        </button>
      </div>
    </div>
  )
}

export default ErrorFallback
