import { useAuth, useUser } from '@clerk/clerk-react'
import { Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import Pagination from '../components/Pagination'
import { ImageSkeleton } from '../components/Skeleton'

function Community() {
  const [creations, setCreations] = useState([])
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { getToken } = useAuth()

  const fetchCreations = async (pageNum = 1) => {
    try {
      setLoading(true)
      const { data } = await api.get(`/api/user/get-published-creations?page=${pageNum}`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })
      if (data.success) {
        setCreations(data.creations)
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  const imageLikeToggle = async (id) => {
    try {
      const { data } = await api.post('/api/user/toggle-like-creation', { id }, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })
      if (data.success) {
        toast.success(data.message)
        await fetchCreations(page)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCreations(page)
    }
  }, [user, page])

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className='flex-1 h-full flex flex-col gap-4 p-6'>
        <div className='h-5 w-24 bg-gray-200 rounded animate-pulse'></div>
        <div className='bg-white h-full w-full rounded-xl overflow-y-scroll'>
          <div className='flex flex-wrap'>
            {[...Array(6)].map((_, i) => <ImageSkeleton key={i} />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 h-full flex flex-col gap-4 p-6'>
      <p className='font-medium'>Community Creations</p>

      <div className='bg-white h-full w-full rounded-xl overflow-y-scroll'>
        {creations.length === 0 ? (
          <p className='text-sm text-gray-400 text-center py-12'>
            No published creations yet. Be the first to share!
          </p>
        ) : (
          creations.map((creation) => (
            <div key={creation.id} className='relative group inline-block pl-3 pt-3 w-full
              sm:max-w-1/2 lg:max-w-1/3'>
              <img src={creation.content} alt="" className='w-full h-full
                object-cover rounded-lg' />

              <div className='absolute bottom-0 top-0 right-0 left-3 flex gap-2
                items-end justify-end group-hover:justify-between p-3
                group-hover:bg-gradient-to-b from-transparent to-black/80 text-white
                rounded-lg'>
                <p className='text-sm hidden group-hover:block'>{creation.prompt}</p>
                <div className='flex gap-1 items-center'>
                  <p>{creation.likes.length}</p>
                  <Heart
                    onClick={() => imageLikeToggle(creation.id)}
                    className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${
                      creation.likes.includes(user.id)
                        ? 'fill-red-500 text-red-600'
                        : 'text-white'
                    }`}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  )
}

export default Community
