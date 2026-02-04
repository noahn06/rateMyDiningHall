import { useState } from 'react'

/**
 * ReviewModal Component
 * Modal for creating/editing reviews with star rating, category ratings, and text
 * 
 * Props:
 *   isOpen: boolean - Whether modal is visible
 *   onClose: function - Callback to close modal
 *   onSubmit: function - Callback with review data
 *   locationName: string - Name of location being reviewed
 *   existingReview: object - Existing review data for editing (optional)
 */

const CATEGORIES = [
    { id: 'food_quality', label: 'Food Quality' },
    { id: 'value', label: 'Price/Value' },
    { id: 'portion_size', label: 'Portion Size' },
    { id: 'dietary', label: 'Dietary Options' },
    { id: 'wait_time', label: 'Wait Time' },
    { id: 'late_night', label: 'Late Night' }
]

const QUICK_TAGS = [
    'Good after 9pm',
    'Crowded',
    'Huge portions',
    'Not worth the price',
    'Great vegan options'
]

const ReviewModal = ({ isOpen, onClose, onSubmit, locationName, existingReview = null }) => {
    const [overallRating, setOverallRating] = useState(existingReview?.overallRating || 0)
    const [selectedCategories, setSelectedCategories] = useState(existingReview?.categories || [])
    const [categoryRatings, setCategoryRatings] = useState(existingReview?.categoryRatings || {})
    const [text, setText] = useState(existingReview?.text || '')
    const [selectedTags, setSelectedTags] = useState(existingReview?.tags || [])
    const [hoveredStar, setHoveredStar] = useState(0)

    if (!isOpen) return null

    const handleCategoryToggle = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(prev => prev.filter(c => c !== categoryId))
            setCategoryRatings(prev => {
                const updated = { ...prev }
                delete updated[categoryId]
                return updated
            })
        } else if (selectedCategories.length < 3) {
            setSelectedCategories(prev => [...prev, categoryId])
        }
    }

    const handleCategoryRating = (categoryId, rating) => {
        setCategoryRatings(prev => ({ ...prev, [categoryId]: rating }))
    }

    const handleTagToggle = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(prev => prev.filter(t => t !== tag))
        } else {
            setSelectedTags(prev => [...prev, tag])
        }
    }

    const handleSubmit = () => {
        if (overallRating === 0) return

        onSubmit({
            overallRating,
            categoryRatings,
            text,
            tags: selectedTags
        })
        onClose()
    }

    const renderStarSelector = (value, onChange, size = 'large') => {
        const sizeClasses = size === 'large' ? 'text-4xl' : 'text-xl'
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        onMouseEnter={() => size === 'large' && setHoveredStar(star)}
                        onMouseLeave={() => size === 'large' && setHoveredStar(0)}
                        className={`${sizeClasses} transition-colors ${star <= (size === 'large' ? (hoveredStar || value) : value)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            } hover:scale-110`}
                    >
                        ★
                    </button>
                ))}
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                        {existingReview ? 'Edit Review' : 'Write a Review'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="px-6 py-6 space-y-6">
                    {/* Location Name */}
                    <p className="text-gray-600">
                        Reviewing <span className="font-medium text-black">{locationName}</span>
                    </p>

                    {/* Overall Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Overall Rating <span className="text-red-500">*</span>
                        </label>
                        {renderStarSelector(overallRating, setOverallRating)}
                    </div>

                    {/* Category Ratings */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            What stood out? <span className="text-gray-400">(Pick up to 3)</span>
                        </label>
                        <div className="space-y-3">
                            {CATEGORIES.map(category => (
                                <div key={category.id} className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleCategoryToggle(category.id)}
                                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${selectedCategories.includes(category.id)
                                                ? 'bg-black text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            } ${!selectedCategories.includes(category.id) && selectedCategories.length >= 3
                                                ? 'opacity-50 cursor-not-allowed'
                                                : ''
                                            }`}
                                        disabled={!selectedCategories.includes(category.id) && selectedCategories.length >= 3}
                                    >
                                        {category.label}
                                    </button>
                                    {selectedCategories.includes(category.id) && (
                                        <div className="flex-1">
                                            {renderStarSelector(
                                                categoryRatings[category.id] || 0,
                                                (rating) => handleCategoryRating(category.id, rating),
                                                'small'
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Text Review */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Review <span className="text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value.slice(0, 350))}
                            placeholder="Share your experience..."
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                        />
                        <p className="text-xs text-gray-400 text-right mt-1">
                            {text.length}/350
                        </p>
                    </div>

                    {/* Quick Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quick Tags <span className="text-gray-400">(Optional)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagToggle(tag)}
                                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${selectedTags.includes(tag)
                                            ? 'bg-black text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={overallRating === 0}
                        className={`btn-primary ${overallRating === 0 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {existingReview ? 'Update Review' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReviewModal
