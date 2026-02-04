import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../lib/firebase'

/**
 * Auth Context
 * Provides authentication state and methods throughout the app
 */

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [userProfile, setUserProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser)
                // Fetch or create user profile in Firestore
                await fetchOrCreateUserProfile(firebaseUser)
            } else {
                setUser(null)
                setUserProfile(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const fetchOrCreateUserProfile = async (firebaseUser) => {
        try {
            const userRef = doc(db, 'users', firebaseUser.uid)
            const userSnap = await getDoc(userRef)

            if (userSnap.exists()) {
                setUserProfile(userSnap.data())
            } else {
                // Create new user profile
                const newProfile = {
                    id: firebaseUser.uid,
                    display_name: firebaseUser.displayName || 'Anonymous',
                    photo_url: firebaseUser.photoURL || null,
                    bio: '',
                    created_at: serverTimestamp()
                }
                await setDoc(userRef, newProfile)
                setUserProfile(newProfile)
            }
        } catch (error) {
            console.error('Error fetching user profile:', error)
        }
    }

    const login = async () => {
        try {
            setLoading(true)
            await signInWithPopup(auth, googleProvider)
        } catch (error) {
            console.error('Login error:', error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        try {
            await signOut(auth)
        } catch (error) {
            console.error('Logout error:', error)
            throw error
        }
    }

    const updateProfile = async (updates) => {
        if (!user) return

        try {
            const userRef = doc(db, 'users', user.uid)
            await setDoc(userRef, updates, { merge: true })
            setUserProfile(prev => ({ ...prev, ...updates }))
        } catch (error) {
            console.error('Error updating profile:', error)
            throw error
        }
    }

    const value = {
        user,
        userProfile,
        loading,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
