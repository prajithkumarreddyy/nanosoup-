import React from 'react';

const LiveTrackingMap = () => {
    return (
        <div className="w-full h-80 bg-blue-50 rounded-3xl overflow-hidden relative shadow-inner border border-blue-100 group">
            {/* Background Map Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-linear group-hover:scale-110"
                style={{ backgroundImage: "url('/delivery_map_bg.png')" }}
            ></div>

            {/* Overlay Gradient for better visibility of elements if needed */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20 pointer-events-none"></div>

            {/* Path visualization (Simplified CSS Animation) */}
            {/* We simulate a path by animating a rider icon across the screen */}

            {/* Start Point (Restaurant) */}
            <div className="absolute top-10 left-10 flex flex-col items-center z-10 animate-bounce-slow">
                <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl border-2 border-orange-500">
                    🧑‍🍳
                </div>
                <div className="bg-white px-2 py-1 rounded-md shadow-sm mt-1 text-xs font-bold text-gray-700">
                    Restaurant
                </div>
            </div>

            {/* End Point (User Home) */}
            <div className="absolute bottom-10 right-10 flex flex-col items-center z-10 animate-bounce-slow" style={{ animationDelay: '1s' }}>
                <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl border-2 border-green-500">
                    🏠
                </div>
                <div className="bg-white px-2 py-1 rounded-md shadow-sm mt-1 text-xs font-bold text-gray-700">
                    Your Home
                </div>
            </div>

            {/* Animated Path Line (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60" style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }}>
                {/* A curved path from top-left to bottom-right */}
                <path
                    d="M 80 80 Q 250 80 250 200 T 500 280"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeDasharray="10,10"
                    strokeLinecap="round"
                    className="w-full h-full"
                />
            </svg>

            {/* Moving Rider */}
            <div className="absolute z-20 animate-move-rider">
                <div className="relative">
                    <div className="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center text-3xl border-4 border-white z-20 relative">
                        🛵
                    </div>
                    {/* Pulse Effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-primary/30 rounded-full animate-ping z-10"></div>
                </div>

                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-sm whitespace-nowrap">
                    Kethan is on the way!
                </div>
            </div>

            <style>{`
                @keyframes move-rider {
                    0% { top: 15%; left: 15%; transform: rotate(0deg); }
                    30% { top: 15%; left: 40%; transform: rotate(10deg); }
                    60% { top: 50%; left: 45%; transform: rotate(-5deg); }
                    100% { top: 75%; left: 80%; transform: rotate(0deg); }
                }
                .animate-move-rider {
                    animation: move-rider 10s linear infinite alternate;
                }
                .animate-bounce-slow {
                    animation: bounce 3s infinite;
                }
            `}</style>
        </div>
    );
};

export default LiveTrackingMap;
