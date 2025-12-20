import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const FoodCard = ({ food, onOpenAuth }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();

    const handleAddToCart = () => {
        if (!user) {
            onOpenAuth();
            return;
        }
        addToCart(food);
    };

    return (
        <div className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-red-100">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {food.category}
                </div>
                {food.isVegetarian && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white w-6 h-6 flex items-center justify-center rounded-full text-[10px] shadow-sm" title="Vegetarian">
                        V
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{food.name}</h3>
                    <span className="text-primary font-bold text-lg">₹{food.price}</span>
                </div>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">
                    {food.description}
                </p>

                <button
                    className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl shadow-md shadow-red-100 hover:bg-red-700 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                    onClick={handleAddToCart}
                >
                    <span>+</span> Add to Cart
                </button>
            </div>
        </div>
    );
};

export default FoodCard;
