import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

/**
 * useReviews Hook
 * Fetches reviews for a specific location or user
 */

export const useReviews = (locationId = null, userId = null) => {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true)
                let q

                if (locationId) {
                    q = query(
                        collection(db, 'reviews'),
                        where('location_id', '==', locationId)
                    )
                } else if (userId) {
                    q = query(
                        collection(db, 'reviews'),
                        where('user_id', '==', userId)
                    )
                } else {
                    setReviews([])
                    setLoading(false)
                    return
                }

                const querySnapshot = await getDocs(q)
                const reviewsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate() || new Date()
                }))

                // Sort by timestamp descending in JS (avoids composite index requirement)
                reviewsData.sort((a, b) => b.timestamp - a.timestamp)
                setReviews(reviewsData)
            } catch (err) {
                console.error('Error fetching reviews:', err)
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchReviews()
    }, [locationId, userId])

    return { reviews, loading, error }
}

export default useReviews
