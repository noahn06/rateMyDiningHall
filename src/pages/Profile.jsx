import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'

/**
 * Profile Page
 * Displays user profile with bio, stats, reviews, and settings
 */

const Profile = () => {
    const { user, userProfile, isAuthenticated, loading: authLoading, updateProfile } = useAuth()
    const navigate = useNavigate()
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('reviews') // 'reviews' | 'settings'
    const [isEditing, setIsEditing] = useState(false)
    const [bio, setBio] = useState('')

    // Settings state
    const [universitySearch, setUniversitySearch] = useState('')
    const [universityResults, setUniversityResults] = useState([])
    const [searchingUniversity, setSearchingUniversity] = useState(false)
    const [selectedSchool, setSelectedSchool] = useState(null)
    const [displayName, setDisplayName] = useState('')

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/')
        }
    }, [authLoading, isAuthenticated, navigate])

    // Set bio, school, and display name from userProfile
    useEffect(() => {
        if (userProfile) {
            setBio(userProfile.bio || '')
            setSelectedSchool(userProfile.school || null)
            setDisplayName(userProfile.display_name || user?.displayName || '')
        } else if (user) {
            setDisplayName(user.displayName || '')
        }
    }, [userProfile, user])

    // Fetch user's reviews
    useEffect(() => {
        const fetchUserReviews = async () => {
            if (!user) return

            try {
                setLoading(true)
                const q = query(
                    collection(db, 'reviews'),
                    where('user_id', '==', user.uid)
                )
                const querySnapshot = await getDocs(q)
                const reviewsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate() || new Date()
                }))
                reviewsData.sort((a, b) => b.timestamp - a.timestamp)
                setReviews(reviewsData)
            } catch (error) {
                console.error('Error fetching reviews:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUserReviews()
    }, [user])

    // Search universities using Hipo API
    useEffect(() => {
        const searchUniversities = async () => {
            if (universitySearch.length < 2) {
                setUniversityResults([])
                return
            }

            try {
                setSearchingUniversity(true)
                const response = await fetch(
                    `http://universities.hipolabs.com/search?name=${encodeURIComponent(universitySearch)}`
                )
                const data = await response.json()
                // Limit to 10 results
                setUniversityResults(data.slice(0, 10))
            } catch (error) {
                console.error('Error searching universities:', error)
                setUniversityResults([])
            } finally {
                setSearchingUniversity(false)
            }
        }

        const debounce = setTimeout(searchUniversities, 300)
        return () => clearTimeout(debounce)
    }, [universitySearch])

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

    const handleSaveBio = async () => {
        try {
            await updateProfile({ bio })
            setIsEditing(false)
        } catch (error) {
            console.error('Error saving bio:', error)
        }
    }

    const handleSaveDisplayName = async () => {
        try {
            await updateProfile({ display_name: displayName })
        } catch (error) {
            console.error('Error saving display name:', error)
        }
    }

    const handleSelectSchool = async (university) => {
        const schoolData = {
            name: university.name,
            country: university.country,
            domain: university.domains?.[0] || null
        }
        try {
            await updateProfile({ school: schoolData })
            setSelectedSchool(schoolData)
            setUniversitySearch('')
            setUniversityResults([])
        } catch (error) {
            console.error('Error saving school:', error)
        }
    }

    const handleDeleteReview = async (reviewId) => {
        if (!confirm('Are you sure you want to delete this review?')) return

        try {
            await deleteDoc(doc(db, 'reviews', reviewId))
            setReviews(prev => prev.filter(r => r.id !== reviewId))
        } catch (error) {
            console.error('Error deleting review:', error)
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Profile Header - Card centered, content left-aligned */}
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
                    <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl text-gray-500 font-medium">
                                    {user?.displayName?.charAt(0) || '?'}
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            {/* Name */}
                            <h1 className="text-2xl font-bold text-black mb-1">
                                {user?.displayName || 'Anonymous'}
                            </h1>

                            {/* Stats */}
                            <p className="text-gray-500 text-sm mb-3">
                                {userProfile?.created_at && `Member since ${formatDate(userProfile.created_at?.toDate?.() || userProfile.created_at)}`}
                                {' • '}{reviews.length} review{reviews.length !== 1 && 's'}
                                {' • '}{userProfile?.crumbs || 0} 🍪 crumbs
                            </p>

                            {/* School Badge */}
                            {selectedSchool && (
                                <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 mb-3">
                                    <span className="text-sm text-gray-600">🎓</span>
                                    <span className="text-sm font-medium text-gray-700">{selectedSchool.name}</span>
                                </div>
                            )}

                            {/* Bio */}
                            {isEditing ? (
                                <div className="space-y-3 mt-3">
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value.slice(0, 150))}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
                                        rows={3}
                                        placeholder="Write a short bio..."
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400">{bio.length}/150</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setBio(userProfile?.bio || '')
                                                    setIsEditing(false)
                                                }}
                                                className="px-4 py-2 text-sm text-gray-500 hover:text-black rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveBio}
                                                className="btn-primary-sm"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-2">
                                    <p className="text-gray-600 mb-2">{bio || 'No bio yet.'}</p>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-sm text-gray-500 hover:text-black underline"
                                    >
                                        Edit bio
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'reviews'
                            ? 'bg-black text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Reviews
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'settings'
                            ? 'bg-black text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Settings
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    {activeTab === 'reviews' ? (
                        <>
                            <h2 className="text-lg font-semibold mb-6">Your Reviews</h2>

                            {loading ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p>Loading reviews...</p>
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p>You haven't written any reviews yet.</p>
                                    <Link to="/" className="text-black underline hover:no-underline mt-2 inline-block">
                                        Find a dining hall to review
                                    </Link>
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
                                                <p className="text-gray-700 text-sm mb-3">{review.text}</p>
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
                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="text-sm text-red-500 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <h2 className="text-lg font-semibold mb-6">Settings</h2>

                            {/* Display Name */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Display Name
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
                                        placeholder="Enter your display name..."
                                        className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                    <button
                                        onClick={handleSaveDisplayName}
                                        disabled={displayName === (userProfile?.display_name || user?.displayName || '')}
                                        className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">This name will be displayed publicly on your reviews.</p>
                            </div>

                            {/* University Selection */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your University
                                </label>

                                {selectedSchool ? (
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div>
                                            <p className="font-medium">{selectedSchool.name}</p>
                                            <p className="text-sm text-gray-500">{selectedSchool.country}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedSchool(null)}
                                            className="text-sm text-gray-500 hover:text-black"
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={universitySearch}
                                            onChange={(e) => setUniversitySearch(e.target.value)}
                                            placeholder="Search for your university..."
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                                        />

                                        {/* Search Results */}
                                        {universityResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto z-10">
                                                {universityResults.map((uni, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleSelectSchool(uni)}
                                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-none"
                                                    >
                                                        <p className="font-medium text-sm">{uni.name}</p>
                                                        <p className="text-xs text-gray-500">{uni.country}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {searchingUniversity && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-gray-500 text-sm">
                                                Searching...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Account Info */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account
                                </label>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-600">
                                        Signed in as <span className="font-medium">{user?.email}</span>
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile
