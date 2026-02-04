import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, getDocs, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'
import DiningCard from '../components/DiningCard'
import SuggestLocationModal from '../components/SuggestLocationModal'

/**
 * Home Page
 * Landing page with unified search for schools, restaurants, and users
 */

// Mock schools data with images
const MOCK_SCHOOLS = [
    {
        id: 'uw',
        name: 'University of Washington',
        shortName: 'UW',
        imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=250&fit=crop'
    },
    {
        id: 'wsu',
        name: 'Washington State University',
        shortName: 'WSU',
        imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=250&fit=crop'
    },
    {
        id: 'ucla',
        name: 'UCLA',
        shortName: 'UCLA',
        imageUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=400&h=250&fit=crop'
    },
    {
        id: 'usc',
        name: 'University of Southern California',
        shortName: 'USC',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop'
    },
    {
        id: 'stanford',
        name: 'Stanford University',
        shortName: 'Stanford',
        imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=250&fit=crop'
    },
    {
        id: 'berkeley',
        name: 'UC Berkeley',
        shortName: 'Berkeley',
        imageUrl: 'https://images.unsplash.com/photo-1592066575517-58df903152f2?w=400&h=250&fit=crop'
    },
    {
        id: 'mit',
        name: 'MIT',
        shortName: 'MIT',
        imageUrl: 'https://images.unsplash.com/photo-1559135197-8a45ea74d367?w=400&h=250&fit=crop'
    },
    {
        id: 'harvard',
        name: 'Harvard University',
        shortName: 'Harvard',
        imageUrl: 'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=400&h=250&fit=crop'
    },
]



// Popular Schools Carousel Component - Manual swipe with visible scrollbar
const PopularSchoolsCarousel = ({ schools, onSchoolSelect }) => {
    const scrollRef = useRef(null)

    return (
        <div className="flex justify-center w-full">
            {/* Wide container centered on page */}
            <div className="w-11/12 relative">
                {/* Gradient fade edges */}
                <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none rounded-l-xl" />
                <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none rounded-r-xl" />

                {/* Scrollable container with visible scrollbar */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto py-2 px-2 scrollbar-visible"
                    style={{
                        scrollBehavior: 'smooth',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#9CA3AF #E5E7EB'
                    }}
                >
                    {schools.map((school) => (
                        <button
                            key={school.id}
                            onClick={() => onSchoolSelect(school)}
                            className="flex-shrink-0 relative w-[180px] h-[120px] rounded-xl overflow-hidden group cursor-pointer transition-transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                            {/* Background Image */}
                            <img
                                src={school.imageUrl}
                                alt={school.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                            {/* Name Banner */}
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-white font-semibold text-sm truncate">{school.shortName}</p>
                                <p className="text-white/80 text-xs truncate">{school.name}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Swipe hint text */}
                <p className="text-xs text-gray-400 text-center mt-2">← Swipe to explore →</p>
            </div>
        </div>
    )
}

const Home = () => {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [showSuggestModal, setShowSuggestModal] = useState(false)
    const [selectedSchool, setSelectedSchool] = useState(null)
    const [showDropdown, setShowDropdown] = useState(false)
    const [sortBy, setSortBy] = useState('rating')
    const [filterArea, setFilterArea] = useState('all')
    const [filterType, setFilterType] = useState('all')

    // Data state
    const [diningLocations, setDiningLocations] = useState([])
    const [loadingLocations, setLoadingLocations] = useState(true)

    // User search state
    const [users, setUsers] = useState([])
    const [searchingUsers, setSearchingUsers] = useState(false)

    // Fetch Dining Locations
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const q = query(collection(db, 'dining_locations'))
                const querySnapshot = await getDocs(q)
                const locations = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).filter(loc => loc.status === 'approved') // Only show approved locations
                setDiningLocations(locations)
            } catch (error) {
                console.error('Error fetching dining locations:', error)
            } finally {
                setLoadingLocations(false)
            }
        }

        fetchLocations()
    }, [])

    // Seed Data Handler (Dev only)
    const handleSeedData = async () => {
        const { seedDiningLocations } = await import('../utils/seedData')
        const success = await seedDiningLocations()
        if (success) {
            alert('Data seeded successfully! Refreshing...')
            window.location.reload()
        } else {
            alert('Failed to seed data.')
        }
    }

    // Fetch users when searching
    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.length < 2) {
                setUsers([])
                return
            }

            try {
                setSearchingUsers(true)
                const q = query(collection(db, 'users'), limit(20))
                const querySnapshot = await getDocs(q)
                const usersData = querySnapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    .filter(user =>
                        user.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 5)
                setUsers(usersData)
            } catch (error) {
                console.error('Error searching users:', error)
                setUsers([])
            } finally {
                setSearchingUsers(false)
            }
        }

        const debounce = setTimeout(searchUsers, 300)
        return () => clearTimeout(debounce)
    }, [searchQuery])

    // Filter schools based on search
    const filteredSchools = MOCK_SCHOOLS.filter(school =>
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.shortName.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5)

    // Filter restaurants based on search
    const filteredRestaurants = diningLocations.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5)

    // Filter and sort locations for selected school
    const filteredLocations = diningLocations
        .filter(loc => !selectedSchool || loc.schoolId === selectedSchool.id)
        .filter(loc => filterArea === 'all' || loc.campusArea === filterArea)
        .filter(loc => filterType === 'all' || loc.type === filterType)
        .sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return b.avgRating - a.avgRating
                case 'reviews':
                    return b.reviewCount - a.reviewCount
                default:
                    return 0
            }
        })

    const handleSchoolSelect = (school) => {
        setSelectedSchool(school)
        setSearchQuery('')
        setShowDropdown(false)
    }

    const handleRestaurantSelect = (restaurant) => {
        navigate(`/location/${restaurant.id}`)
        setSearchQuery('')
        setShowDropdown(false)
    }

    const handleUserSelect = (user) => {
        navigate(`/user/${user.id}`)
        setSearchQuery('')
        setShowDropdown(false)
    }

    const handleSearchFocus = () => {
        setShowDropdown(true)
    }

    const handleSearchBlur = () => {
        setTimeout(() => setShowDropdown(false), 200)
    }

    const clearSelection = () => {
        setSelectedSchool(null)
        setSearchQuery('')
    }

    // Check if there are any results
    const hasResults = searchQuery.length >= 2 && (
        filteredSchools.length > 0 ||
        filteredRestaurants.length > 0 ||
        users.length > 0
    )

    // Landing view (no school selected)
    if (!selectedSchool) {
        return (
            <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-2xl text-center">
                    {/* TEMP: Force Seed Button Visible */}
                    <div className="mb-8">
                        <button
                            onClick={handleSeedData}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors font-bold"
                        >
                            ⚡ FORCE SEED DATA
                        </button>
                    </div>

                    {/* Tagline */}
                    <h1 className="text-4xl md:text-5xl font-medium text-black mb-12">
                        Search for <span className="font-bold">your</span> next meal
                    </h1>

                    {/* Large Centered Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search for a university, location, or user"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                setShowDropdown(true)
                            }}
                            onFocus={handleSearchFocus}
                            onBlur={handleSearchBlur}
                            className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors text-center"
                        />
                        <svg
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>

                        {/* Unified Dropdown Results */}
                        {showDropdown && searchQuery.length >= 2 && hasResults && (
                            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10 max-h-80 overflow-y-auto">
                                {/* Schools Section */}
                                {filteredSchools.length > 0 && (
                                    <div>
                                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Universities
                                        </div>
                                        {filteredSchools.map(school => (
                                            <button
                                                key={school.id}
                                                onClick={() => handleSchoolSelect(school)}
                                                className="w-full px-5 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center gap-3"
                                            >
                                                <span className="text-gray-400">🎓</span>
                                                <div>
                                                    <span className="font-medium">{school.name}</span>
                                                    <span className="text-gray-500 ml-2">({school.shortName})</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Locations Section */}
                                {filteredRestaurants.length > 0 && (
                                    <div>
                                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Dining Locations
                                        </div>
                                        {filteredRestaurants.map(restaurant => (
                                            <button
                                                key={restaurant.id}
                                                onClick={() => handleRestaurantSelect(restaurant)}
                                                className="w-full px-5 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center gap-3"
                                            >
                                                <span className="text-gray-400">🍽️</span>
                                                <div>
                                                    <span className="font-medium">{restaurant.name}</span>
                                                    <span className="text-gray-500 ml-2 text-sm">• {restaurant.type.replace('_', ' ')}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Users Section */}
                                {users.length > 0 && (
                                    <div>
                                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Users
                                        </div>
                                        {users.map(user => (
                                            <button
                                                key={user.id}
                                                onClick={() => handleUserSelect(user)}
                                                className="w-full px-5 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center gap-4"
                                            >
                                                {/* Avatar - Larger to match profile card */}
                                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {user.photo_url ? (
                                                        <img src={user.photo_url} alt={user.display_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-500 text-lg font-medium">
                                                            {user.display_name?.charAt(0) || '?'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* User Info - Organized like profile card */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-black truncate">{user.display_name}</p>
                                                    {user.school?.name && (
                                                        <div className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-2.5 py-0.5 mt-1">
                                                            <span className="text-xs text-gray-600">🎓</span>
                                                            <span className="text-xs font-medium text-gray-700 truncate">{user.school.name}</span>
                                                        </div>
                                                    )}
                                                    {user.bio && (
                                                        <p className="text-gray-500 text-sm mt-1 truncate">{user.bio}</p>
                                                    )}
                                                </div>

                                                {/* Arrow indicator */}
                                                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Loading state */}
                        {showDropdown && searchQuery.length >= 2 && searchingUsers && !hasResults && (
                            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-gray-500 text-sm">
                                Searching...
                            </div>
                        )}

                        {/* No results */}
                        {showDropdown && searchQuery.length >= 2 && !searchingUsers && !hasResults && (
                            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-gray-500 text-sm">
                                No results found
                            </div>
                        )}
                    </div>

                    {/* Popular Schools Carousel */}
                    <div className="mt-12 w-full">
                        <p className="text-sm text-gray-500 mb-6 text-center">Popular schools</p>
                        <PopularSchoolsCarousel schools={MOCK_SCHOOLS} onSchoolSelect={handleSchoolSelect} />
                    </div>

                    {/* Developer Tools: Seed Button */}
                    {diningLocations.length === 0 && !loadingLocations && (
                        <div className="mt-12">
                            <button
                                onClick={handleSeedData}
                                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-black transition-colors"
                            >
                                ⚡ [DEV] Seed Database with Dining Locations
                            </button>
                        </div>
                    )}
                </div>

                <SuggestLocationModal
                    isOpen={showSuggestModal}
                    onClose={() => setShowSuggestModal(false)}
                />
            </div>
        )
    }

    // School selected view
    return (
        <div className="min-h-screen">
            {/* School Header */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-end">
                    <div>
                        <button
                            onClick={clearSelection}
                            className="text-gray-500 hover:text-black text-sm mb-2 inline-flex items-center gap-1"
                        >
                            ← Back to search
                        </button>
                        <h1 className="text-3xl font-bold text-black">{selectedSchool.name}</h1>
                        <p className="text-gray-600 mt-1">
                            {filteredLocations.length} dining location{filteredLocations.length !== 1 && 's'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowSuggestModal(true)}
                        className="hidden sm:block btn-primary-sm"
                    >
                        Suggest Missing Location
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Filters & Sorting */}
                <div className="flex flex-wrap justify-center gap-4 mb-8 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Sort by:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="rating">Highest Rated</option>
                            <option value="reviews">Most Reviewed</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Area:</label>
                        <select
                            value={filterArea}
                            onChange={(e) => setFilterArea(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="all">All Areas</option>
                            <option value="north">North Campus</option>
                            <option value="west">West Campus</option>
                            <option value="central">Central Campus</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Type:</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="all">All Types</option>
                            <option value="dining_hall">Dining Halls</option>
                            <option value="market">Markets</option>
                            <option value="cafe">Cafés</option>
                        </select>
                    </div>
                </div>

                {/* Dining Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loadingLocations ? (
                        // Loading Skeletons
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-64 w-full" />
                        ))
                    ) : (
                        filteredLocations.map((location) => (
                            <DiningCard
                                key={location.id}
                                id={location.id}
                                name={location.name}
                                imageUrl={location.imageUrl}
                                avgRating={location.avgRating}
                                reviewCount={location.reviewCount}
                                badges={location.badges}
                                type={location.type}
                            />
                        ))
                    )}
                </div>

                {/* Empty State */}
                {!loadingLocations && filteredLocations.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            No dining locations match your filters.
                        </p>
                        <button
                            onClick={() => {
                                setFilterArea('all')
                                setFilterType('all')
                            }}
                            className="mt-4 text-black underline hover:no-underline"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            <SuggestLocationModal
                isOpen={showSuggestModal}
                onClose={() => setShowSuggestModal(false)}
            />
        </div>
    )
}

export default Home
