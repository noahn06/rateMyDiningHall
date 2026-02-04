import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import LocationDetails from './pages/LocationDetails'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'

import Footer from './components/Footer'

const App = () => {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-white flex flex-col">
                <Navbar />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/location/:id" element={<LocationDetails />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/user/:id" element={<UserProfile />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    )
}

export default App
