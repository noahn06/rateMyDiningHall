import { Link } from 'react-router-dom'

/**
 * DiningCard Component
 * Displays a dining location card with name, image, rating, review count, and badges
 * 
 * Props:
 *   id: string - Location ID for routing
 *   name: string - Name of the dining location
 *   imageUrl: string - URL to the location's image
 *   avgRating: number - Average rating (1.0-5.0)
 *   reviewCount: number - Total number of reviews
 *   badges: string[] - Array of badge names
 *   type: string - Type of location (dining_hall, market, cafe)
 */
const DiningCard = ({ id, name, imageUrl, avgRating, reviewCount, badges = [], type }) => {
    // Generate star display
    const renderStars = (rating) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.5

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i} className="star">★</span>)
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<span key={i} className="star">★</span>)
            } else {
                stars.push(<span key={i} className="star-empty">★</span>)
            }
        }
        return stars
    }

    // Get badge style class
    const getBadgeClass = (badge) => {
        const badgeLower = badge.toLowerCase()
        if (badgeLower.includes('fast')) return 'badge badge-fast'
        if (badgeLower.includes('value')) return 'badge badge-value'
        if (badgeLower.includes('late') || badgeLower.includes('night')) return 'badge badge-latenight'
        return 'badge'
    }

    // Format type for display
    const formatType = (type) => {
        const typeMap = {
            'dining_hall': 'Dining Hall',
            'market': 'Market',
            'cafe': 'Café'
        }
        return typeMap[type] || type
    }

    return (
        <Link to={`/location/${id}`} className="card cursor-pointer block">
            {/* Image */}
            <div className="relative h-48 bg-gray-200 overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                {/* Type Badge */}
                <span className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatType(type)}
                </span>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Name */}
                <h3 className="text-lg font-semibold text-black mb-2 truncate">
                    {name}
                </h3>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-lg">
                        {renderStars(avgRating)}
                    </div>
                    <span className={`font-medium ${avgRating >= 4.0 ? 'text-[#10b981]' : 'text-black'}`}>
                        {avgRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500 text-sm">
                        ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {badges.map((badge, index) => (
                            <span key={index} className={getBadgeClass(badge)}>
                                {badge}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    )
}

export default DiningCard
