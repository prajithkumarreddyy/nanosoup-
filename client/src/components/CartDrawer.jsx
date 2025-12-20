import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartDrawer = () => {
    const { cart, isOpen, toggleCart, updateQty, total, deliveryTime } = useCart();
    const navigate = useNavigate();

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300"
                    onClick={toggleCart}
                />
            )}

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-white z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">

                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Your Order</h2>
                            {cart.length > 0 && <p className="text-sm text-green-600 font-medium">⚡ Estimated Delivery: {deliveryTime} mins</p>}
                        </div>
                        <button onClick={toggleCart} className="p-2 hover:bg-gray-200 rounded-full transition-colors">✕</button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                <div className="text-6xl mb-4">🍽️</div>
                                <p className="text-xl font-medium text-gray-400">Your cart is empty</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item._id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm animate-fade-in-up">
                                    <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                                            <p className="text-primary font-bold">₹{item.price}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => updateQty(item._id, -1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">-</button>
                                            <span className="font-medium">{item.qty}</span>
                                            <button onClick={() => updateQty(item._id, 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">+</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {cart.length > 0 && (
                        <div className="p-6 border-t border-gray-100 bg-white">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-2xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={() => {
                                    toggleCart();
                                    navigate('/checkout');
                                }}
                                className="w-full py-4 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all transform hover:-translate-y-1"
                            >
                                Checkout Now ➔
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartDrawer;
