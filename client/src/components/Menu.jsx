import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FoodCard from './FoodCard';

const Menu = ({ onOpenAuth }) => {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        setLoading(true);
        import API_URL from '../config';

        useEffect(() => {
            setLoading(true);
            fetch(`${API_URL}/api/food`)
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json();
                })
                .then(data => {
                    // If backend returns empty, we might use fallback, but now we have seeded backend.
                    if (data.length === 0) {
                        console.log("No items from backend, using fallback...");
                        // Fallback/Demo data just in case
                        setFoods([
                            {
                                _id: '1',
                                name: "Truffle Mushroom Risotto",
                                description: "Creamy arborio rice with premium truffle oil and wild mushrooms.",
                                price: 450,
                                category: "Italian",
                                imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=2070&auto=format&fit=crop",
                                isVegetarian: true
                            },
                            {
                                _id: '2',
                                name: "Spicy Miso Ramen",
                                description: "Rich miso broth with chashu pork, soft-boiled egg, and green onions.",
                                price: 380,
                                category: "Japanese",
                                imageUrl: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=2031&auto=format&fit=crop",
                                isVegetarian: false
                            },
                            {
                                _id: '3',
                                name: "Margherita Pizza",
                                description: "Classic tomato sauce, fresh mozzarella, and basil on sourdough crust.",
                                price: 350,
                                category: "Italian",
                                imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=2069&auto=format&fit=crop",
                                isVegetarian: true
                            }
                        ]);
                    } else {
                        setFoods(data);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch menu:", err);
                    // Fallback data
                    setFoods([
                        {
                            _id: '1',
                            name: "Truffle Mushroom Risotto",
                            description: "Creamy arborio rice with premium truffle oil and wild mushrooms.",
                            price: 450,
                            category: "Italian",
                            imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=2070&auto=format&fit=crop",
                            isVegetarian: true
                        },
                        {
                            _id: 'rice-test',
                            name: "Rice Test",
                            description: "Delicious steamed rice test item.",
                            price: 1,
                            category: "Indian",
                            imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=2072&auto=format&fit=crop",
                            isVegetarian: true
                        }
                    ]);
                    setLoading(false);
                });
        }, []);

        const categories = ['All', ...new Set(foods.map(item => item.category))];

        const filteredFoods = foods.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());

            // If searching, show matches regardless of category tab (Global Search)
            if (searchQuery) return matchesSearch;

            // If not searching, filter by category
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

                    {/* Categories - Only show if not searching */}
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

                    {/* Search Results Title */}
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

                    {/* Grid */}
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
