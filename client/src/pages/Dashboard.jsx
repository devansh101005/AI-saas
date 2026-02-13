import { useEffect, useState } from 'react';
import { Gem, Sparkles } from 'lucide-react';
import { Protect, useAuth } from '@clerk/clerk-react';
import CreationItem from '../components/CreationItem';
import Pagination from '../components/Pagination';
import { CardSkeleton, CreationSkeleton } from '../components/Skeleton';
import api from '../lib/api';
import toast from 'react-hot-toast';

function Dashboard() {
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const { getToken } = useAuth()

  const getDashboardData = async (pageNum = 1) => {
    try {
      setLoading(true)
      const { data } = await api.get(`/api/user/get-user-creations?page=${pageNum}`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })
      if (data.success) {
        setCreations(data.creations || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalCount(data.pagination?.total || 0)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    getDashboardData(page)
  }, [page])

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className='h-full overflow-y-scroll p-6'>
      {/* Stats cards */}
      <div className='flex justify-start gap-4 flex-wrap'>
        {loading ? (
          <>
            <div className='w-72'><CardSkeleton /></div>
            <div className='w-72'><CardSkeleton /></div>
          </>
        ) : (
          <>
            {/* Total creation card */}
            <div className='flex justify-between items-center w-72 p-4 px-6 bg-white
              rounded-xl border border-gray-200'>
              <div className='text-slate-600'>
                <p className='text-sm'>Total Creations</p>
                <h2 className='text-xl font-semibold'>{totalCount}</h2>
              </div>
              <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2]
                to-[#0BB0D7] text-white flex justify-center items-center'>
                <Sparkles className='w-5 text-white' />
              </div>
            </div>

            {/* Active plan card */}
            <div className='flex justify-between items-center w-72 p-4 px-6 bg-white
              rounded-xl border border-gray-200'>
              <div className='text-slate-600'>
                <p className='text-sm'>Active Plan</p>
                <h2 className='text-xl font-semibold'>
                  <Protect plan='premium' fallback="Free">Premium</Protect>
                </h2>
              </div>
              <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5]
                to-[#9E53EE] text-white flex justify-center items-center'>
                <Gem className='w-5 text-white' />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Creations list */}
      {loading ? (
        <div className='space-y-3 mt-6'>
          <div className='h-4 w-32 bg-gray-200 rounded animate-pulse mb-4'></div>
          {[...Array(4)].map((_, i) => <CreationSkeleton key={i} />)}
        </div>
      ) : (
        <div className='space-y-3'>
          <p className='mt-6 mb-4'>Recent Creations</p>
          {creations.length === 0 ? (
            <p className='text-sm text-gray-400 text-center py-12'>
              No creations yet. Start generating content!
            </p>
          ) : (
            creations.map((item) => <CreationItem key={item.id} item={item} />)
          )}
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  )
}

export default Dashboard
