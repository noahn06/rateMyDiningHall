import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="bg-black border-t border-gray-800 py-12 mt-auto">
            <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Brand & Copyright */}
                <div className="text-center md:text-left">
                    <h3 className="font-bold text-lg text-white mb-1">RateMyDiningHall</h3>
                    <p className="text-sm text-gray-400">
                        © 2026 RateMyDiningHall. All rights reserved.
                    </p>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                    <Link to="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
                        About Us
                    </Link>
                    <Link to="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                        Contact
                    </Link>
                    <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                        Terms & Conditions
                    </Link>
                    <a
                        href="https://github.com/your-repo/issues"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Bug Report
                    </a>
                </div>
            </div>
        </footer>
    )
}

export default Footer
