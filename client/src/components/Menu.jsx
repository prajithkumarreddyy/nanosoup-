import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FoodCard from './FoodCard';
import API_URL from '../config';

const Menu = ({ onOpenAuth }) => {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        const fetchFood = (isInitial = false) => {
            fetch(`${API_URL}/api/food`)
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json();
                })
                .then(data => {
                    if (data.length === 0) {
                        console.log("No items from backend, using fallback...");
                        // Keep fallback logic if desired, or simplified
                        setFoods([
                            {
                                _id: '1',
                                name: "Truffle Mushroom Risotto",
                                description: "Creamy arborio rice with premium truffle oil and wild mushrooms.",
                                price: 450,
                                category: "Italian",
                                imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=600&auto=format&fit=crop",
                                isVegetarian: true
                            },
                            {
                                _id: '2',
                                name: "Spicy Miso Ramen",
                                description: "Rich miso broth with chashu pork, soft-boiled egg, and green onions.",
                                price: 380,
                                category: "Japanese",
                                imageUrl: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=600&auto=format&fit=crop",
                                isVegetarian: false
                            },
                        ]);
                    } else {
                        setFoods(data);
                    }
                    if (isInitial) setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch menu:", err);
                    if (isInitial) setLoading(false);
                });
        };

        fetchFood(true); // Initial fetch
        const interval = setInterval(() => fetchFood(false), 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, []);

    const categories = ['All', ...new Set(foods.map(item => item.category))];

    const filteredFoods = foods.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());

        if (searchQuery) return matchesSearch;
        return activeCategory === 'All' || item.category === activeCategory;
    });

    return (
        <section id="menu" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Our <span className="text-gradient">Menu</span></h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Explore our diverse collection of culinary masterpieces. From Italian classics to spicy Asian delights.
                    </p>
                </div>

                {!searchQuery && (
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${activeCategory === category
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                )}

                {searchQuery && (
                    <div className="text-center mb-8">
                        <p className="text-xl text-gray-700">
                            Search results for <span className="font-bold text-red-600">"{searchQuery}"</span>
                        </p>
                        {filteredFoods.length === 0 && (
                            <p className="text-gray-500 mt-2">No items found matching your search.</p>
                        )}
                        <button
                            onClick={() => { setSearchParams({}); setActiveCategory('All'); }}
                            className="mt-4 text-sm text-gray-500 underline hover:text-red-600"
                        >
                            Clear Search
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
                        {filteredFoods.map(food => (
                            <FoodCard key={food._id || food.name} food={food} onOpenAuth={onOpenAuth} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Menu;
