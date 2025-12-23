import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminFood = () => {
    const { token } = useAuth();
    const [foods, setFoods] = useState([]);
    const [settings, setSettings] = useState({ deliveryFee: 40, taxRate: 5 });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');



    // Inline Edit State
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});

    // Inline Add State
    const [isAdding, setIsAdding] = useState(false);
    const [newData, setNewData] = useState({
        name: '', description: '', price: '', category: '', imageUrl: '', isVegetarian: false, inStock: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [foodRes, ensureSettingsRes] = await Promise.all([
                fetch('http://localhost:5000/api/food'),
                fetch('http://localhost:5000/api/settings') // Ensures settings exist
            ]);

            const foodData = await foodRes.json();
            const settingsData = await ensureSettingsRes.json();

            setFoods(foodData);
            setSettings(settingsData);
        } catch (error) {
            console.error("Error fetching data:", error);
            setMessage("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const handleSettingsUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(settings)
            });
            if (res.ok) setMessage("Settings updated successfully!");
            else setMessage("Failed to update settings.");
        } catch (error) {
            console.error(error);
            setMessage("Error updating settings.");
        }
    };

    const handleDeleteFood = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/food/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                setMessage("Item deleted.");
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleStock = async (food) => {
        try {
            const res = await fetch(`http://localhost:5000/api/food/${food._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ inStock: !food.inStock })
            });
            if (res.ok) fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditClick = (food) => {
        setEditId(food._id);
        setEditData({ ...food });
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditSave = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/food/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(editData)
            });

            if (res.ok) {
                setMessage("Item updated successfully!");
                setEditId(null);
                fetchData();
            } else {
                setMessage("Failed to update item.");
            }
        } catch (error) {
            console.error(error);
            setMessage("Error updating item.");
        }
    };

    const handleAddClick = () => {
        setIsAdding(true);
        setNewData({
            name: '', description: '', price: '', category: '', imageUrl: '', isVegetarian: false, inStock: true
        });
    };

    const handleAddChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddSave = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(newData)
            });

            if (res.ok) {
                setMessage("Item added successfully!");
                setIsAdding(false);
                fetchData();
            } else {
                setMessage("Failed to add item.");
            }
        } catch (error) {
            console.error(error);
            setMessage("Error adding item.");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Admin Panel...</div>;

    return (
        <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
            <Link to="/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black mb-8 text-gray-800">Admin Management</h1>

            {message && (
                <div className="bg-blue-100 text-blue-800 p-4 rounded-xl mb-6 flex justify-between items-center">
                    <span>{message}</span>
                    <button onClick={() => setMessage('')} className="font-bold">✕</button>
                </div>
            )}

            {/* Global Settings Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">⚙️ Global Settings</h2>
                <form onSubmit={handleSettingsUpdate} className="flex flex-wrap gap-6 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Delivery Fee (₹)</label>
                        <input
                            type="number"
                            className="w-40 border border-gray-300 rounded-lg px-3 py-2"
                            value={settings.deliveryFee}
                            onChange={e => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Tax Rate (%)</label>
                        <input
                            type="number"
                            className="w-40 border border-gray-300 rounded-lg px-3 py-2"
                            value={settings.taxRate}
                            onChange={e => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                        />
                    </div>
                    <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors">
                        Save Settings
                    </button>
                </form>
            </div>

            {/* Food Management Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">🍔 Food Menu Items</h2>
                    {!isAdding && (
                        <button onClick={handleAddClick} className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-red-200 shadow-lg">
                            + Add New Item
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isAdding && (
                                <tr className="bg-red-50 border-l-4 border-red-500 animate-fade-in-up">
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            name="imageUrl"
                                            value={newData.imageUrl}
                                            onChange={handleAddChange}
                                            placeholder="Image URL"
                                            className="w-full text-xs border rounded p-1"
                                        />
                                        {newData.imageUrl && <img src={newData.imageUrl} alt="Preview" className="h-10 w-10 mt-2 rounded object-cover" />}
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            name="name"
                                            value={newData.name}
                                            onChange={handleAddChange}
                                            className="w-full text-sm font-bold border rounded p-1 mb-1"
                                            placeholder="Item Name"
                                        />
                                        <textarea
                                            name="description"
                                            value={newData.description}
                                            onChange={handleAddChange}
                                            rows="2"
                                            className="w-full text-xs border rounded p-1"
                                            placeholder="Description"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            list="categories"
                                            name="category"
                                            value={newData.category}
                                            onChange={handleAddChange}
                                            className="w-full text-sm border rounded p-1"
                                            placeholder="Category"
                                        />
                                        <datalist id="categories">
                                            <option value="Italian" />
                                            <option value="Indian" />
                                            <option value="Chinese" />
                                            <option value="Mexican" />
                                        </datalist>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            name="price"
                                            value={newData.price}
                                            onChange={handleAddChange}
                                            className="w-20 text-sm border rounded p-1"
                                            placeholder="Price"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <label className="flex items-center gap-2 cursor-pointer bg-white px-2 py-1 rounded border">
                                            <input
                                                type="checkbox"
                                                name="inStock"
                                                checked={newData.inStock}
                                                onChange={handleAddChange}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-xs font-medium">In Stock</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-white px-2 py-1 rounded border mt-2">
                                            <input
                                                type="checkbox"
                                                name="isVegetarian"
                                                checked={newData.isVegetarian}
                                                onChange={handleAddChange}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-xs font-medium">Veg?</span>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={handleAddSave} className="bg-red-600 text-white px-3 py-1 rounded shadow text-xs font-bold hover:bg-red-700">Add Item</button>
                                        <button onClick={() => setIsAdding(false)} className="bg-gray-300 text-gray-800 px-3 py-1 rounded shadow text-xs font-bold hover:bg-gray-400">Cancel</button>
                                    </td>
                                </tr>
                            )}
                            {foods.map(food => (
                                <React.Fragment key={food._id}>
                                    {editId === food._id ? (
                                        <tr className="bg-yellow-50 border-l-4 border-yellow-400">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    name="imageUrl"
                                                    value={editData.imageUrl}
                                                    onChange={handleEditChange}
                                                    placeholder="Image URL"
                                                    className="w-full text-xs border rounded p-1"
                                                />
                                                <img src={editData.imageUrl} alt="Preview" className="h-10 w-10 mt-2 rounded object-cover" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editData.name}
                                                    onChange={handleEditChange}
                                                    className="w-full text-sm font-bold border rounded p-1 mb-1"
                                                    placeholder="Name"
                                                />
                                                <textarea
                                                    name="description"
                                                    value={editData.description}
                                                    onChange={handleEditChange}
                                                    rows="2"
                                                    className="w-full text-xs border rounded p-1"
                                                    placeholder="Description"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    list="categories"
                                                    name="category"
                                                    value={editData.category}
                                                    onChange={handleEditChange}
                                                    className="w-full text-sm border rounded p-1"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={editData.price}
                                                    onChange={handleEditChange}
                                                    className="w-20 text-sm border rounded p-1"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <label className="flex items-center gap-2 cursor-pointer bg-white px-2 py-1 rounded border">
                                                    <input
                                                        type="checkbox"
                                                        name="inStock"
                                                        checked={editData.inStock}
                                                        onChange={handleEditChange}
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="text-xs font-medium">In Stock</span>
                                                </label>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button onClick={handleEditSave} className="bg-green-600 text-white px-3 py-1 rounded shadow text-xs font-bold hover:bg-green-700">Save</button>
                                                <button onClick={() => setEditId(null)} className="bg-gray-300 text-gray-800 px-3 py-1 rounded shadow text-xs font-bold hover:bg-gray-400">Cancel</button>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <img src={food.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{food.name}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">{food.description}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {food.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">₹{food.price}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleStock(food)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${(food.inStock ?? true)
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        }`}
                                                >
                                                    {(food.inStock ?? true) ? 'In Stock' : 'Sold Out'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                                                <button onClick={() => handleEditClick(food)} className="text-indigo-600 hover:text-indigo-900 font-bold bg-indigo-50 px-3 py-1 rounded-md">Edit</button>
                                                <button onClick={() => handleDeleteFood(food._id)} className="text-red-400 hover:text-red-900">Delete</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    );
};

export default AdminFood;
