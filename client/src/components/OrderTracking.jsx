import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OrderTracking = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // In a real app, we'd fetch order status based on ID. 
    // Here we simulate the state.

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 bg-gray-50">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Status Card */}
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                        🍳
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Preparing your Order</h1>
                    <p className="text-gray-500 text-lg">Your food is being prepared with love.</p>

                    <div className="mt-8 p-4 bg-green-50 rounded-2xl border border-green-100 inline-block">
                        <p className="text-green-700 font-bold flex items-center gap-2">
                            <span>🕒</span> Expected to deliver on time
                        </p>
                    </div>
                </div>

                {/* Delivery Partner Card */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 animate-slide-up">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Partner</h2>
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
                            <img src="/kethan.jpg" alt="Kethan Reddy" className="w-full h-full object-cover" />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-800">Kethan Reddy</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-yellow-400 text-lg">★</span>
                                <span className="font-bold text-gray-700">4.8</span>
                                <span className="text-gray-400 text-sm">(500+ deliveries)</span>
                            </div>
                            <p className="text-gray-500 text-sm mt-1">Driving a Honda Activa • KA-05-AB-1234</p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <a href="tel:+1234567890" className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors">
                                📞
                            </a>
                        </div>
                    </div>

                    {/* Dummy Contact Pill */}
                    <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Contact Kethan Reddy</span>
                        <span className="font-bold text-gray-800">+91 98765 43210</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="py-4 bg-white text-gray-800 font-bold rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all"
                    >
                        Back to Home
                    </button>
                    <button className="py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all">
                        Track on Map
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
