import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        mobile: '',
    });
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        promo: true
    });
    const [darkMode, setDarkMode] = useState(false);
    const [language, setLanguage] = useState('English');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                mobile: user.mobile || '+91 98765 43210' // Mock mobile if not in DB
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        // Simulate API call
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

                {showSuccess && (
                    <div className="fixed top-24 right-4 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl shadow-lg z-50 animate-fade-in-up">
                        <strong className="font-bold">Settings Saved! </strong>
                        <span className="block sm:inline">Your profile has been updated.</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left: Navigation/General Info (Visual only) */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center text-4xl mb-4">
                                👤
                            </div>
                            <h2 className="font-bold text-lg text-gray-800">{formData.username || 'User'}</h2>
                            <p className="text-sm text-gray-500">{formData.email}</p>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 bg-gray-50 font-bold text-gray-700 border-b border-gray-100">Account</div>
                            <div className="p-4 hover:bg-red-50 cursor-pointer text-red-600 font-medium transition-colors">Personal Information</div>
                            <div className="p-4 hover:bg-gray-50 cursor-pointer text-gray-600 transition-colors">Privacy & Security</div>
                            <div className="p-4 hover:bg-gray-50 cursor-pointer text-gray-600 transition-colors">Payment Methods</div>
                        </div>
                    </div>

                    {/* Right: Forms */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Profile Settings */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span>✏️</span> Edit Profile
                            </h2>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none"
                                    />
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-primary transition-all shadow-lg hover:shadow-red-200">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* General Preferences */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span>⚙️</span> Preferences
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-800">Email Notifications</p>
                                        <p className="text-xs text-gray-500">Receive order updates via email</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={notifications.email} onChange={() => setNotifications({ ...notifications, email: !notifications.email })} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-800">SMS Notifications</p>
                                        <p className="text-xs text-gray-500">Receive delivery alerts via SMS</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={notifications.sms} onChange={() => setNotifications({ ...notifications, sms: !notifications.sms })} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>
                                <hr className="border-gray-100" />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-800">Dark Mode (Beta)</p>
                                        <p className="text-xs text-gray-500">Switch to dark theme</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-800">Language</p>
                                        <p className="text-xs text-gray-500">Select your preferred language</p>
                                    </div>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                                    >
                                        <option>English</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                        <option>German</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
