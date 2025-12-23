import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
    LayoutDashboard,
    Package,
    MapPin,
    Settings,
    HelpCircle,
    Users,
    Bike,
    Utensils,
    Ticket,
    Calendar,
    LogOut,
    X,
    Menu,
    Search,
    ShoppingBag,
    User
} from 'lucide-react';

const Navbar = ({ onOpenAuth, isProfileOpen, setIsProfileOpen }) => {
    const { user, logout } = useAuth();
    const { count, toggleCart } = useCart();
    // const [isProfileOpen, setIsProfileOpen] = useState(false); // Removed local state
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const navigate = useNavigate();
    const location = useLocation();
    const timeoutRef = React.useRef(null);
    const profileRef = React.useRef(null);

    // Check if user is admin or employee
    const isAdmin = user?.role === 'admin';
    const isRider = user?.email?.includes('@rider.nanosoup.com');
    const isChef = user?.email?.includes('@chef.nanosoup.com');
    const isEmployee = isRider || isChef || ['rider', 'chef', 'employee'].includes(user?.role);
    const isRegularUser = user && !isAdmin && !isEmployee;

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
        <>
            {user && (
                <>
                    {/* Backdrop */}
                    <div
                        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] transition-opacity duration-300 ${isProfileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        onClick={() => setIsProfileOpen(false)}
                    />

                    {/* Sliding Sidebar Panel */}
                    <div
                        className={`fixed top-0 left-0 bottom-0 z-[100] transform ease-out duration-300 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col border-r border-gray-100 ${isProfileOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    >
                        {/* Header */}
                        <div className="relative p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
                            {/* Decorative Circles */}
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-red-500/10 rounded-full blur-2xl"></div>

                            {/* Close Button */}
                            <button
                                onClick={() => setIsProfileOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all backdrop-blur-sm"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-orange-500 p-[2px] shadow-lg mb-4">
                                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-3xl font-bold text-white border-4 border-gray-900">
                                        {user.username ? user.username[0].toUpperCase() : 'U'}
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">{user.username}</h2>
                                <p className="text-gray-400 text-sm mt-1 bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                            {isRegularUser && (
                                <>
                                    <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Menu</div>
                                    <Link to="/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-4 px-4 py-4 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group">
                                        <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Package className="w-6 h-6" />
                                        </div>
                                        <span className="font-medium group-hover:translate-x-1 transition-transform">My Orders</span>
                                    </Link>
                                    <Link to="/addresses" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-4 px-4 py-4 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium group-hover:translate-x-1 transition-transform">Saved Addresses</span>
                                    </Link>
                                    <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-4 px-4 py-4 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                                            <Settings className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium group-hover:translate-x-1 transition-transform">Settings</span>
                                    </Link>
                                    <Link to="/help" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-4 px-4 py-4 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                                            <HelpCircle className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium group-hover:translate-x-1 transition-transform">Help & Support</span>
                                    </Link>
                                </>
                            )}
                            {isAdmin && (
                                <>
                                    <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Admin Controls</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex flex-col items-center justify-center gap-2 p-4 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-center">
                                            <LayoutDashboard className="w-8 h-8 stroke-1" />
                                            <span className="text-xs font-bold">Dashboard</span>
                                        </Link>
                                        <Link to="/admin/users" onClick={() => setIsProfileOpen(false)} className="flex flex-col items-center justify-center gap-2 p-4 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-center">
                                            <Users className="w-8 h-8 stroke-1" />
                                            <span className="text-xs font-bold">Users</span>
                                        </Link>
                                        <Link to="/admin/riders" onClick={() => setIsProfileOpen(false)} className="flex flex-col items-center justify-center gap-2 p-4 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-center">
                                            <Bike className="w-8 h-8 stroke-1" />
                                            <span className="text-xs font-bold">Riders</span>
                                        </Link>
                                        <Link to="/admin/chefs" onClick={() => setIsProfileOpen(false)} className="flex flex-col items-center justify-center gap-2 p-4 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-center">
                                            <Utensils className="w-8 h-8 stroke-1" />
                                            <span className="text-xs font-bold">Chefs</span>
                                        </Link>
                                    </div>
                                    <Link to="/admin/food" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-4 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all mt-2">
                                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center border border-gray-100">
                                            <Utensils className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium text-sm">Food & Settings</span>
                                    </Link>
                                    <Link to="/admin/tickets" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-4 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center border border-gray-100">
                                            <Ticket className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium text-sm">Tickets</span>
                                    </Link>
                                    <Link to="/admin/leaves" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-4 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center border border-gray-100">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium text-sm">Leaves</span>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => { logout(); setIsProfileOpen(false); }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 hover:border-red-300 transition-all shadow-sm group"
                            >
                                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span>Sign Out</span>
                            </button>
                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                                <span>Nanosoup v1.0</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>Made with ❤️</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <nav className={`fixed w-full z-50 glass-nav transition-transform duration-300 ease-in-out ${isProfileOpen ? 'translate-x-[20rem]' : 'translate-x-0'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-4">
                            {/* Hamburger Menu (Left Side) */}
                            {user && (
                                <div className="">
                                    <button
                                        onClick={handleProfileClick}
                                        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
                                    >
                                        <Menu className="h-7 w-7 text-gray-700" />
                                    </button>
                                </div>
                            )}

                            {/* Logo */}
                            <div className="flex-shrink-0 flex items-center cursor-pointer group">
                                {isAdmin || isEmployee ? (
                                    <div className="text-3xl font-black tracking-widest uppercase flex items-center select-none font-sans">
                                        <div className="bg-gray-900 text-white px-3 py-1 rounded-2xl shadow-sm border border-gray-800 flex items-center">
                                            <span>{isAdmin ? 'ADMIN' : (isChef ? 'CHEF' : 'RIDER')}</span>
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
                        </div>

                        {isRegularUser && (
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-8">
                                    <Link to="/" className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
                                    <a href="/#menu" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Menu</a>
                                    <Link to="/founder" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Founder</Link>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            {/* Search Bar - Hide for Admin/Employee */}
                            {isRegularUser && (
                                <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-red-200 focus-within:bg-white focus-within:shadow-sm transition-all">
                                    <Search className="h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search food..."
                                        className="bg-transparent border-none outline-none text-sm ml-2 w-32 focus:w-48 transition-all text-gray-700 placeholder-gray-400"
                                        value={searchTerm}
                                        onChange={handleSearch}
                                    />
                                </div>
                            )}

                            {/* Cart Button - Hide for Admin/Employee */}
                            {isRegularUser && (
                                <button onClick={toggleCart} className="p-2 rounded-full hover:bg-gray-100 transition-colors relative group">
                                    <ShoppingBag className="h-6 w-6 text-gray-600 group-hover:text-primary transition-colors" />
                                    {count > 0 && (
                                        <div className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full animate-bounce">
                                            {count}
                                        </div>
                                    )}
                                </button>
                            )}

                            {/* Profile Button (Unified for Guest/User) */}
                            <button
                                onClick={user ? handleProfileClick : onOpenAuth}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm border
                                    ${user
                                        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white border-transparent hover:shadow-md transform hover:scale-105'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                    }
                                `}
                                title={user ? 'My Profile' : 'Sign In'}
                            >
                                {user ? (
                                    <span className="font-bold text-lg">
                                        {user.username ? user.username[0].toUpperCase() : 'U'}
                                    </span>
                                ) : (
                                    <User className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
