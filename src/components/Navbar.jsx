import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { collection, query, getDocs, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'

/**
 * Navbar Component
 * Clean navigation bar with logo, search bar, and auth buttons
 */
const Navbar = () => {
    const { user, userProfile, loading, login, logout, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Check if we are on the home page (handle potential trailing slashes)
    const isHomePage = location.pathname === '/' || location.pathname === ''

    // Search state
    const [searchQuery, setSearchQuery] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [diningLocations, setDiningLocations] = useState([]) // Real data
    const [users, setUsers] = useState([])
    const [searching, setSearching] = useState(false)

    // Fetch dining locations for search context
    useEffect(() => {
        const fetchLocations = async () => {
            if (!isHomePage) { // Only fetch if we need the global search
                try {
                    const q = query(collection(db, 'dining_locations'))
                    const querySnapshot = await getDocs(q)
                    const locations = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    setDiningLocations(locations)
                } catch (error) {
                    console.error('Error fetching locations for navbar search:', error)
                }
            }
        }
        fetchLocations()
    }, [isHomePage])

    // Search Users & Filter Locations
    useEffect(() => {
        const performSearch = async () => {
            if (searchQuery.length < 2) {
                setUsers([])
                return
            }

            try {
                setSearching(true)
                // Search Users
                const q = query(collection(db, 'users'), limit(5))
                const querySnapshot = await getDocs(q)
                const usersData = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user =>
                        user.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                setUsers(usersData)
            } catch (error) {
                console.error('Error searching users:', error)
            } finally {
                setSearching(false)
            }
        }

        const debounce = setTimeout(performSearch, 300)
        return () => clearTimeout(debounce)
    }, [searchQuery])

    // Filter locations locally (since we fetched them all)
    const filteredLocations = diningLocations.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5)

    const hasResults = searchQuery.length >= 2 && (filteredLocations.length > 0 || users.length > 0)

    const handleLogin = async () => {
        try {
            await login()
        } catch (error) {
            console.error('Login failed:', error)
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const handleLocationSelect = (location) => {
        navigate(`/location/${location.id}`)
        setSearchQuery('')
        setShowDropdown(false)
    }

    const handleUserSelect = (user) => {
        navigate(`/user/${user.id}`)
        setSearchQuery('')
        setShowDropdown(false)
    }

    return (
        <nav className="sticky top-0 z-50 bg-black">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 gap-4">
                    {/* Logo / Brand */}
                    <div className="flex items-center flex-shrink-0">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-lg font-bold tracking-tight text-white">
                                RateMyDiningHall
                            </span>
                        </Link>
                    </div>

                    {/* Search Bar - Hidden on home page */}
                    {!isHomePage && (
                        <div className="flex-1 max-w-md relative mx-4">
                            <input
                                type="text"
                                placeholder="Search locations or users..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setShowDropdown(true)
                                }}
                                onFocus={() => setShowDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                className="w-full px-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            />
                            <svg
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>

                            {/* Dropdown Results */}
                            {showDropdown && searchQuery.length >= 2 && hasResults && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto">
                                    {/* Locations */}
                                    {filteredLocations.length > 0 && (
                                        <div>
                                            <div className="px-3 py-1.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Dining Locations
                                            </div>
                                            {filteredLocations.map(loc => (
                                                <button
                                                    key={loc.id}
                                                    onClick={() => handleLocationSelect(loc)}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm text-gray-800 flex items-center gap-3 border-b border-gray-100 last:border-0"
                                                >
                                                    <span className="text-gray-400">🍽️</span>
                                                    <span className="font-medium">{loc.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {/* Users */}
                                    {users.length > 0 && (
                                        <div>
                                            <div className="px-3 py-1.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Users
                                            </div>
                                            {users.map(u => (
                                                <button
                                                    key={u.id}
                                                    onClick={() => handleUserSelect(u)}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm text-gray-800 flex items-center gap-3 border-b border-gray-100 last:border-0"
                                                >
                                                    {u.photo_url ? (
                                                        <img src={u.photo_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                                            {u.display_name?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                    <span className="truncate">{u.display_name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {loading ? (
                            <span className="text-white text-sm">Loading...</span>
                        ) : isAuthenticated ? (
                            <>
                                <Link to="/profile" className="flex items-center gap-2">
                                    {user?.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt={userProfile?.display_name || user.displayName}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-medium">
                                            {(userProfile?.display_name || user?.displayName)?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <span className="text-white text-sm hidden sm:inline">
                                        {userProfile?.display_name || user?.displayName || 'Profile'}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="btn-text"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleLogin}
                                    className="btn-text"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={handleLogin}
                                    className="btn-primary-sm"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
