import React from 'react';
import { useAuth } from '../context/AuthContext';

const Hero = () => {
    const { user } = useAuth();

    return (
        <div className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">

                    <div className="flex-1 text-center md:text-left">
                        {user && (
                            <div className="mb-4 animate-fade-in-up">
                                <span className="text-xl md:text-2xl font-bold text-gray-800 font-serif italic">
                                    Delighted to serve, <span className="text-red-600 not-italic">{user.username}</span>!
                                </span>
                            </div>
                        )}
                        <span className="inline-block py-1 px-3 rounded-full bg-red-50 text-primary text-sm font-semibold mb-6 tracking-wide uppercase border border-red-100">
                            Faster than light delivery 🚀
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-[1.1] mb-6">
                            Experience the <br />
                            <span className="text-gradient">Future of Taste</span>
                        </h1>
                        <p className="text-lg text-gray-500 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
                            Premium dishes from top-tier chefs delivered directly to your doorstep.
                            Taste the difference with NANOSOUP's curated multi-cuisine menu.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <a href="#menu" className="px-8 py-4 bg-red-600 text-white rounded-full font-semibold shadow-xl shadow-red-200 hover:shadow-2xl hover:bg-red-700 transition-all transform hover:-translate-y-1">
                                Order Now
                            </a>
                            <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-semibold hover:bg-gray-50 transition-all flex items-center gap-2 justify-center">
                                <span>▶</span> Watch Video
                            </button>
                        </div>

                        <div className="mt-12 flex items-center justify-center md:justify-start gap-8 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Trust badges/logos placeholder */}
                            <div className="text-sm font-bold text-gray-400">TRUSTED BY 10,000+ FOODIES</div>
                        </div>
                    </div>

                    <div className="flex-1 relative">
                        <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                            <img
                                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
                                alt="Delicious Food"
                                className="relative w-full h-full object-cover rounded-[2rem] shadow-2xl rotate-3 hover:rotate-0 transition-all duration-700 border-4 border-white"
                            />

                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce hover:pause">
                                <div className="bg-green-100 p-2 rounded-full text-green-600">
                                    ★
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">4.9/5 Rating</div>
                                    <div className="text-xs text-gray-500">From 5k+ reviews</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Hero;
