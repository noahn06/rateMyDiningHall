import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'

/**
 * useLocations Hook
 * Fetches dining locations from Firestore, optionally filtered by school
 */

export const useLocations = (schoolId = null) => {
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                setLoading(true)
                let q

                if (schoolId) {
                    q = query(
                        collection(db, 'dining_locations'),
                        where('school_id', '==', schoolId)
                    )
                } else {
                    q = query(collection(db, 'dining_locations'))
                }

                const querySnapshot = await getDocs(q)
                const locationsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))

                setLocations(locationsData)
            } catch (err) {
                console.error('Error fetching locations:', err)
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchLocations()
    }, [schoolId])

    return { locations, loading, error }
}

/**
 * useSchools Hook
 * Fetches all schools from Firestore
 */
export const useSchools = () => {
    const [schools, setSchools] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                setLoading(true)
                const q = query(collection(db, 'schools'))
                const querySnapshot = await getDocs(q)
                const schoolsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                setSchools(schoolsData)
            } catch (err) {
                console.error('Error fetching schools:', err)
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchSchools()
    }, [])

    return { schools, loading, error }
}

export default useLocations
