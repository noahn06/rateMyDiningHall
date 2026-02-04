import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'

const SuggestLocationModal = ({ isOpen, onClose }) => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        school_name: '',
        type: 'dining_hall',
        campus_area: '',
        image_url: ''
    })

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            await addDoc(collection(db, 'dining_locations'), {
                ...formData,
                status: 'pending',
                avgRating: 0,
                reviewCount: 0,
                submittedBy: user?.uid || 'anonymous',
                submittedAt: serverTimestamp()
            })
            setSuccess(true)
            setTimeout(() => {
                onClose()
                setSuccess(false)
                setFormData({
                    name: '',
                    school_name: '',
                    type: 'dining_hall',
                    campus_area: '',
                    image_url: ''
                })
            }, 2000)
        } catch (error) {
            console.error('Error submitting suggestion:', error)
            alert('Failed to submit suggestion. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative bg-white rounded-2xl w-full max-w-md p-6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl"
                >
                    ×
                </button>

                <h2 className="text-xl font-bold mb-1">Suggest a Location</h2>
                <p className="text-gray-500 text-sm mb-6">Found a spot we're missing? Let us know!</p>

                {success ? (
                    <div className="bg-green-50 text-green-800 p-4 rounded-xl text-center">
                        <p className="font-medium">Thanks for your suggestion!</p>
                        <p className="text-sm mt-1 opacity-80">It will appear once approved by an admin.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location Name
                            </label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g. The HUB"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                University
                            </label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g. University of Washington"
                                value={formData.school_name}
                                onChange={e => setFormData({ ...formData, school_name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type
                                </label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="dining_hall">Dining Hall</option>
                                    <option value="cafe">Café</option>
                                    <option value="market">Market</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Campus Area
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="e.g. West Campus"
                                    value={formData.campus_area}
                                    onChange={e => setFormData({ ...formData, campus_area: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image URL <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="url"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="https://..."
                                value={formData.image_url}
                                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-2.5 mt-2"
                        >
                            {loading ? 'Submitting...' : 'Submit Suggestion'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default SuggestLocationModal
