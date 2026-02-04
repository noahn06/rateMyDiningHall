import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, runTransaction, arrayUnion, increment } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import ReviewModal from '../components/ReviewModal'

/**
 * LocationDetails Page
 * Displays detailed info about a dining location with reviews
 */

// Real UW dining locations (fallback data)
const MOCK_LOCATIONS = {
    'local-point': {
        name: 'Local Point',
        type: 'dining_hall',
        school_name: 'University of Washington',
        campus_area: 'West Campus',
        image_url: null,
        avg_rating: 4.2,
        review_count: 187,
        badges: ['Late Night Friendly', 'Good Value'],
        description: 'All-you-care-to-eat dining hall in Lander Hall with diverse food stations.'
    },
    'center-table': {
        name: 'Center Table',
        type: 'dining_hall',
        school_name: 'University of Washington',
        campus_area: 'North Campus',
        image_url: null,
        avg_rating: 3.9,
        review_count: 145,
        badges: ['Good Value'],
        description: 'Resident dining in Maple Hall featuring comfort food and rotating menus.'
    },
    'mcmahon-hall': {
        name: 'McMahon Hall Dining',
        type: 'dining_hall',
        school_name: 'University of Washington',
        campus_area: 'North Campus',
        image_url: null,
        avg_rating: 3.6,
        review_count: 203,
        badges: ['Late Night Friendly'],
        description: 'North campus dining hall known for late-night hours and variety.'
    },
    'district-market': {
        name: 'District Market',
        type: 'market',
        school_name: 'University of Washington',
        campus_area: 'West Campus',
        image_url: null,
        avg_rating: 4.4,
        review_count: 89,
        badges: ['Fast Lines'],
        description: 'Convenience store in the District with grab-and-go meals and snacks.'
    },
    'the-8': {
        name: 'The 8',
        type: 'dining_hall',
        school_name: 'University of Washington',
        campus_area: 'West Campus',
        image_url: null,
        avg_rating: 4.1,
        review_count: 156,
        badges: ['Good Value', 'Fast Lines'],
        description: 'Modern dining hall on 8th floor of Alder Hall with stunning views.'
    },
    'suzzallo-cafe': {
        name: 'Suzzallo Café',
        type: 'cafe',
        school_name: 'University of Washington',
        campus_area: 'Central Campus',
        image_url: null,
        avg_rating: 4.3,
        review_count: 234,
        badges: ['Fast Lines'],
        description: 'Coffee and quick bites in Suzzallo Library, perfect for study breaks.'
    },
    'by-george': {
        name: 'By George',
        type: 'cafe',
        school_name: 'University of Washington',
        campus_area: 'Central Campus',
        image_url: null,
        avg_rating: 4.0,
        review_count: 178,
        badges: ['Fast Lines'],
        description: 'Popular café in the HUB with sandwiches, salads, and espresso.'
    },
    'hub-underground': {
        name: 'Husky Den (HUB)',
        type: 'market',
        school_name: 'University of Washington',
        campus_area: 'Central Campus',
        image_url: null,
        avg_rating: 3.8,
        review_count: 267,
        badges: ['Late Night Friendly', 'Fast Lines'],
        description: 'Food court in the HUB with multiple vendors including Panda Express and Subway.'
    }
}

const LocationDetails = () => {
    const { id } = useParams()
    const { user, isAuthenticated } = useAuth()
    const [location, setLocation] = useState(null)
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState('newest')
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [userHasReview, setUserHasReview] = useState(false)

    // Fetch location and reviews
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Fetch location from Firestore
                const locationRef = doc(db, 'dining_locations', id)
                const locationSnap = await getDoc(locationRef)

                if (locationSnap.exists()) {
                    setLocation({ id: locationSnap.id, ...locationSnap.data() })
                } else if (MOCK_LOCATIONS[id]) {
                    // Use mock data if location exists in our mock data
                    setLocation({ id, ...MOCK_LOCATIONS[id] })
                } else {
                    // Fallback for unknown locations
                    setLocation({
                        id,
                        name: 'Dining Location',
                        type: 'dining_hall',
                        school_name: 'University',
                        campus_area: 'Campus',
                        image_url: null,
                        avg_rating: 4.0,
                        review_count: 0,
                        badges: [],
                        description: 'A campus dining location.'
                    })
                }

                // Fetch reviews
                const reviewsQuery = query(
                    collection(db, 'reviews'),
                    where('location_id', '==', id)
                )
                const reviewsSnap = await getDocs(reviewsQuery)
                const reviewsData = reviewsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate() || new Date()
                }))
                // Sort by timestamp descending in JS
                reviewsData.sort((a, b) => b.timestamp - a.timestamp)
                setReviews(reviewsData)

                // Check if current user has already reviewed
                if (user) {
                    const hasReview = reviewsData.some(r => r.user_id === user.uid)
                    setUserHasReview(hasReview)
                }

            } catch (error) {
                console.error('Error fetching location data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id, user])

    // Render star rating
    const renderStars = (rating) => {
        const stars = []
        const roundedRating = Math.round(rating)
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={i <= roundedRating ? 'text-yellow-400' : 'text-gray-300'}>
                    ★
                </span>
            )
        }
        return stars
    }

    // Category rating bar
    const RatingBar = ({ label, value, max = 5, isTime = false }) => {
        if (value === undefined || value === null) return null
        const percentage = isTime ? Math.min((value / 20) * 100, 100) : (value / max) * 100
        const displayValue = isTime ? `${value} min` : value.toFixed(1)

        return (
            <div className="flex items-center gap-3 mb-3">
                <span className="text-sm text-gray-600 w-32">{label}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-black rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className="text-sm font-medium w-12 text-right">{displayValue}</span>
            </div>
        )
    }

    // Format date
    const formatDate = (date) => {
        if (!date) return ''
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    // Sort reviews
    const sortedReviews = [...reviews].sort((a, b) => {
        if (sortBy === 'newest') return b.timestamp - a.timestamp
        if (sortBy === 'highest') return b.overall_rating - a.overall_rating
        if (sortBy === 'lowest') return a.overall_rating - b.overall_rating
        return 0
    })

    // Handle review submission
    const handleReviewSubmit = async (reviewData) => {
        if (!user || !location) return

        try {
            // Mock Moderation (OpenAI Placeholder)
            const isSafe = true // Assume safe for now
            // In a real app, we'd await checkModeration(reviewData.text)

            if (!isSafe) {
                alert("Review contains inappropriate content.")
                return
            }

            const newReview = {
                location_id: location.id,
                location_name: location.name,
                school_name: location.school_name || '',
                user_id: user.uid,
                user_name: user.displayName || 'Anonymous',
                user_photo: user.photoURL || null,
                overall_rating: reviewData.overallRating,
                category_ratings: reviewData.categoryRatings,
                text: reviewData.text,
                tags: reviewData.tags,
                timestamp: serverTimestamp(),
                upvote_count: 0,
                upvoted_by: [],
                moderation_verified: true
            }

            const docRef = await addDoc(collection(db, 'reviews'), newReview)

            // Add to local state
            setReviews(prev => [{
                id: docRef.id,
                ...newReview,
                timestamp: new Date()
            }, ...prev])

            setUserHasReview(true)
            setShowReviewModal(false)
        } catch (error) {
            console.error('Error submitting review:', error)
        }
    }

    const handleWriteReview = () => {
        if (!isAuthenticated) {
            alert('Please sign in to write a review')
            return
        }
        if (userHasReview) {
            alert('You have already reviewed this location')
            return
        }
        setShowReviewModal(true)
    }

    const handleVote = async (reviewId, authorId) => {
        if (!isAuthenticated) {
            alert("Please sign in to vote")
            return
        }

        try {
            const reviewRef = doc(db, 'reviews', reviewId)
            const authorRef = doc(db, 'users', authorId)

            await runTransaction(db, async (transaction) => {
                const reviewDoc = await transaction.get(reviewRef)
                if (!reviewDoc.exists()) throw "Review does not exist!"

                const data = reviewDoc.data()
                const upvotedBy = data.upvoted_by || []

                if (upvotedBy.includes(user.uid)) {
                    // Already upvoted
                    throw "You have already upvoted this review."
                }

                // 1. Add user to upvoted_by
                transaction.update(reviewRef, {
                    upvoted_by: arrayUnion(user.uid),
                    upvote_count: increment(1)
                })

                // 2. Increment author's crumbs
                if (authorId && authorId !== user.uid) {
                    transaction.update(authorRef, {
                        crumbs: increment(1)
                    })
                }
            })

            // Update local state optimistically
            setReviews(prev => prev.map(r => {
                if (r.id === reviewId) {
                    return {
                        ...r,
                        upvote_count: (r.upvote_count || 0) + 1,
                        upvoted_by: [...(r.upvoted_by || []), user.uid]
                    }
                }
                return r
            }))

        } catch (error) {
            if (typeof error === 'string' && error !== "You have already upvoted this review.") {
                // Ignore "Already upvoted" alerts to be less annoying, or show toast. 
                // Using alert for errors only.
                // But honestly, I'll allow the alert for now as feedback.
                if (error === "You have already upvoted this review.") {
                    // Do nothing or toast
                } else {
                    console.error("Voting failed: ", error)
                    alert("Voting failed. Please try again.")
                }
            } else {
                console.error("Voting failed: ", error)
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        )
    }

    if (!location) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Location not found</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header Section */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <Link to="/" className="text-gray-500 hover:text-black text-sm mb-4 inline-block">
                        ← Back to search
                    </Link>

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Image */}
                        <div className="w-full md:w-64 h-48 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                            {location.image_url ? (
                                <img src={location.image_url} alt={location.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <span>{location.school_name || 'University'}</span>
                                <span>•</span>
                                <span>{location.campus_area || 'Campus'}</span>
                            </div>
                            <h1 className="text-3xl font-bold text-black mb-2">{location.name}</h1>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex text-xl">{renderStars(location.avg_rating || 0)}</div>
                                <span className="text-xl font-semibold">{(location.avg_rating || 0).toFixed(1)}</span>
                                <span className="text-gray-500">({reviews.length} reviews)</span>
                            </div>
                            {location.description && (
                                <p className="text-gray-600 mb-4">{location.description}</p>
                            )}
                            {/* Badges */}
                            {location.badges && location.badges.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {location.badges.map((badge, i) => (
                                        <span key={i} className="badge">{badge}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Rating Breakdown */}
                    <div className="md:col-span-1">
                        <h2 className="text-lg font-semibold mb-4">Rating Breakdown</h2>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <RatingBar label="Food Quality" value={location.food_quality_avg} />
                            <RatingBar label="Value" value={location.value_avg} />
                            <RatingBar label="Portion Size" value={location.portion_size_avg} />
                            <RatingBar label="Dietary Options" value={location.dietary_avg} />
                            <RatingBar label="Wait Time" value={location.wait_time_avg} isTime={true} />
                            <RatingBar label="Late Night" value={location.late_night_avg} />
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Reviews ({reviews.length})</h2>
                            <div className="flex items-center gap-4">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="highest">Highest Rated</option>
                                    <option value="lowest">Lowest Rated</option>
                                </select>
                                <button
                                    onClick={handleWriteReview}
                                    className="btn-primary-sm"
                                    disabled={userHasReview}
                                >
                                    {userHasReview ? 'Already Reviewed' : 'Write a Review'}
                                </button>
                            </div>
                        </div>

                        {/* Reviews List */}
                        {sortedReviews.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p>No reviews yet. Be the first to review!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {sortedReviews.map(review => (
                                    <div key={review.id} className="border-b border-gray-200 pb-6">
                                        <div className="flex items-start gap-4">
                                            {/* Avatar - Link to User Profile */}
                                            <Link
                                                to={`/user/${review.user_id}`}
                                                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
                                            >
                                                {review.user_photo ? (
                                                    <img src={review.user_photo} alt={review.user_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-gray-500 font-medium">
                                                        {review.user_name?.charAt(0) || '?'}
                                                    </span>
                                                )}
                                            </Link>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Link
                                                            to={`/user/${review.user_id}`}
                                                            className="font-medium hover:underline hover:text-emerald-600 transition-colors"
                                                        >
                                                            {review.user_name}
                                                        </Link>
                                                        {/* Optional: User Crumbs/Badge here? */}
                                                    </div>
                                                    <span className="text-sm text-gray-500">{formatDate(review.timestamp)}</span>
                                                </div>
                                                <div className="flex text-sm mt-1 mb-2">
                                                    {renderStars(review.overall_rating)}
                                                </div>
                                                {review.text && (
                                                    <p className="text-gray-700 mb-3">{review.text}</p>
                                                )}
                                                {review.tags && review.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {review.tags.map((tag, i) => (
                                                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Voting UI */}
                                                <div className="flex items-center gap-4 mt-2">
                                                    <button
                                                        onClick={() => handleVote(review.id, review.user_id)}
                                                        disabled={review.upvoted_by?.includes(user?.uid) || !user}
                                                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${review.upvoted_by?.includes(user?.uid)
                                                                ? 'text-emerald-600'
                                                                : 'text-gray-500 hover:text-emerald-600'
                                                            } ${(!user) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <svg className="w-5 h-5" fill={review.upvoted_by?.includes(user?.uid) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                        </svg>
                                                        <span>{review.upvote_count || 0}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                onSubmit={handleReviewSubmit}
                locationName={location.name}
            />
        </div>
    )
}

export default LocationDetails
