import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = ({ onOpenAuth }) => {
    const { user, logout } = useAuth();
    const { count, toggleCart } = useCart();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const navigate = useNavigate();
    const location = useLocation();
    const timeoutRef = React.useRef(null);
    const profileRef = React.useRef(null);

    // Check if user is admin
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        setSearchTerm(searchParams.get('search') || '');
    }, [searchParams]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim()) {
            setSearchParams({ search: value });
            // If not on home page, go to home to see results
            if (location.pathname !== '/') {
                navigate(`/?search=${value}`);
            }
        } else {
            setSearchParams({});
        }
    };

    // ... profile handlers ...
    const handleProfileClick = () => {
        if (isProfileOpen) {
            setIsProfileOpen(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            return;
        }

        setIsProfileOpen(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Auto-close after 10 seconds
        timeoutRef.current = setTimeout(() => {
            setIsProfileOpen(false);
        }, 10000);
    };

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <nav className="fixed w-full z-50 glass-nav transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0 flex items-center cursor-pointer group">
                        {isAdmin ? (
                            <div className="text-3xl font-black tracking-widest uppercase flex items-center select-none font-sans">
                                <div className="bg-gray-900 text-white px-3 py-1 rounded-2xl shadow-sm border border-gray-800 flex items-center">
                                    <span>ADMIN</span>
                                </div>
                            </div>
                        ) : (
                            <Link to="/" className="text-3xl font-black tracking-widest uppercase flex items-center select-none font-sans transition-transform duration-300 group-hover:scale-105">
                                <div className="bg-white px-3 py-1 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                                    <span className="text-red-600 drop-shadow-sm">NANO</span>
                                    <span className="text-gray-900 drop-shadow-sm">SOUP</span>
                                    <span className="text-red-600 text-4xl leading-none animate-pulse">.</span>
                                </div>
                            </Link>
                        )}
                    </div>

                    {!isAdmin && (
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <Link to="/" className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
                                <a href="/#menu" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Menu</a>
                                <Link to="/founder" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Founder</Link>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        {/* Search Bar - Hide for Admin */}
                        {!isAdmin && (
                            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-red-200 focus-within:bg-white focus-within:shadow-sm transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search food..."
                                    className="bg-transparent border-none outline-none text-sm ml-2 w-32 focus:w-48 transition-all text-gray-700 placeholder-gray-400"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                        )}

                        {/* Cart Button - Hide for Admin */}
                        {!isAdmin && (
                            <button onClick={toggleCart} className="p-2 rounded-full hover:bg-gray-100 transition-colors relative group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {count > 0 && (
                                    <div className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full animate-bounce">
                                        {count}
                                    </div>
                                )}
                            </button>
                        )}

                        {/* Auth Button/Profile */}
                        {user ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={handleProfileClick}
                                    className="flex items-center gap-3 cursor-pointer py-2 focus:outline-none"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md uppercase text-white
                                        ${isAdmin ? 'bg-gray-800' : 'bg-gradient-to-r from-primary to-pink-500'}`}>
                                        {user.username ? user.username[0] : 'U'}
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up z-50">
                                        <div className="py-2">
                                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                                <p className="text-sm font-bold text-gray-800">{user.username}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            {!isAdmin && (
                                                <>
                                                    <Link to="/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-primary transition-colors">
                                                        <span>📦</span> Orders
                                                    </Link>
                                                    <Link to="/addresses" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-primary transition-colors">
                                                        <span>📍</span> Saved Addresses
                                                    </Link>
                                                    <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-primary transition-colors">
                                                        <span>⚙️</span> Settings
                                                    </Link>
                                                    <Link to="/help" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-primary transition-colors">
                                                        <span>❓</span> Help
                                                    </Link>
                                                </>
                                            )}
                                            {isAdmin && (
                                                <>
                                                    <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors">
                                                        <span>📊</span> Dashboard
                                                    </Link>
                                                    <Link to="/admin/users" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors">
                                                        <span>👥</span> Users Data
                                                    </Link>
                                                </>
                                            )}
                                            <div className="border-t border-gray-50 mt-1 pt-1">
                                                <button onClick={() => { logout(); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium">
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={onOpenAuth}
                                className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-transform transform hover:scale-105 shadow-lg"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
