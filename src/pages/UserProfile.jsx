import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

/**
 * UserProfile Page
 * Public view of another user's profile and reviews
 */

const UserProfile = () => {
    const { id } = useParams()
    const [user, setUser] = useState(null)
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true)

                // Fetch user profile
                const userRef = doc(db, 'users', id)
                const userSnap = await getDoc(userRef)

                if (userSnap.exists()) {
                    setUser({ id: userSnap.id, ...userSnap.data() })
                }

                // Fetch user's reviews
                const reviewsQuery = query(
                    collection(db, 'reviews'),
                    where('user_id', '==', id)
                )
                const reviewsSnap = await getDocs(reviewsQuery)
                const reviewsData = reviewsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate() || new Date()
                }))
                reviewsData.sort((a, b) => b.timestamp - a.timestamp)
                setReviews(reviewsData)
            } catch (error) {
                console.error('Error fetching user data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUserData()
    }, [id])

    // Render stars
    const renderStars = (rating) => {
        return (
            <span className="text-yellow-400">
                {'★'.repeat(rating)}
                <span className="text-gray-300">{'★'.repeat(5 - rating)}</span>
            </span>
        )
    }

    // Format date
    const formatDate = (date) => {
        if (!date) return ''
        const d = date instanceof Date ? date : new Date(date)
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">User not found</p>
                    <Link to="/" className="text-black underline hover:no-underline">
                        Back to home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Back Link */}
                <Link to="/" className="text-gray-500 hover:text-black text-sm mb-6 inline-block">
                    ← Back to search
                </Link>

                {/* Profile Header - Centered */}
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
                    <div className="flex flex-col items-center text-center">
                        {/* Avatar */}
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-4">
                            {user.photo_url ? (
                                <img src={user.photo_url} alt={user.display_name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl text-gray-500 font-medium">
                                    {user.display_name?.charAt(0) || '?'}
                                </span>
                            )}
                        </div>

                        {/* Name */}
                        <h1 className="text-2xl font-bold text-black mb-1">
                            {user.display_name || 'Anonymous'}
                        </h1>

                        {/* School Badge */}
                        {user.school && (
                            <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 mb-3">
                                <span className="text-sm text-gray-600">🎓</span>
                                <span className="text-sm font-medium text-gray-700">{user.school.name}</span>
                            </div>
                        )}

                        {/* Stats */}
                        <p className="text-gray-500 text-sm mb-4">
                            {user.created_at && `Member since ${formatDate(user.created_at?.toDate?.() || user.created_at)}`}
                            {' • '}{reviews.length} review{reviews.length !== 1 && 's'}
                            {' • '}{user.crumbs || 0} 🍪 crumbs
                        </p>

                        {/* Bio */}
                        {user.bio && (
                            <p className="text-gray-600 max-w-md">{user.bio}</p>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-6">Reviews</h2>

                    {reviews.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>This user hasn't written any reviews yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map(review => (
                                <div key={review.id} className="border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <Link
                                                to={`/location/${review.location_id}`}
                                                className="font-medium text-black hover:underline"
                                            >
                                                {review.location_name || 'Unknown Location'}
                                            </Link>
                                            <p className="text-sm text-gray-500">{review.school_name || ''}</p>
                                        </div>
                                        <span className="text-sm text-gray-500">{formatDate(review.timestamp)}</span>
                                    </div>
                                    <div className="text-sm mb-2">{renderStars(review.overall_rating)}</div>
                                    {review.text && (
                                        <p className="text-gray-700 text-sm">{review.text}</p>
                                    )}
                                    {review.tags && review.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {review.tags.map((tag, i) => (
                                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserProfile
