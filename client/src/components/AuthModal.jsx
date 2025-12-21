import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose }) => {
    const [error, setError] = useState('');
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const navigate = useNavigate();

    // ... hooks ...
    const { login, register } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        let result;
        if (isLogin) {
            result = await login(email, password);
        } else {
            result = await register(username, email, password);
        }

        if (result.success) {
            if (isAdminLogin) {
                if (result.user.role === 'admin') {
                    onClose();
                    navigate('/admin');
                } else {
                    setError('Unauthorized: You do not have admin access.');
                }
            } else {
                onClose();
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>

                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                    ✕
                </button>

                <h2 className="text-3xl font-bold mb-2">
                    {isLogin ? (isAdminLogin ? 'Admin Login' : 'Welcome Back') : 'Join Nanosoup'}
                </h2>
                <p className="text-gray-500 mb-8">
                    {isLogin
                        ? (isAdminLogin ? 'Enter admin credentials' : 'Sign in to access your account')
                        : 'Start your delicious journey today'}
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="Unique username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder={isAdminLogin ? "prajith@nanosoup.com" : "hello@example.com"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 ${isAdminLogin
                            ? 'bg-gray-800 shadow-gray-200 hover:bg-gray-900'
                            : 'bg-red-600 shadow-red-200 hover:bg-red-700'
                            }`}
                    >
                        {isLogin ? (isAdminLogin ? 'Login as Admin' : 'Sign In') : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-2 text-sm text-gray-500">
                    <div>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setError(''); setIsAdminLogin(false); }}
                            className="text-primary font-bold hover:underline"
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                    {isLogin && (
                        <button
                            type="button"
                            onClick={() => { setIsAdminLogin(!isAdminLogin); setError(''); }}
                            className="text-gray-400 hover:text-gray-600 font-medium text-xs transition-colors"
                        >
                            {isAdminLogin ? '← Back to User Login' : 'Admin Login'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
