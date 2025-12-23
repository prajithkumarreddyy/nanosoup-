import React, { createContext, useState, useContext, useEffect } from 'react';
import API_URL from '../config';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const storedCart = localStorage.getItem('cart');
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (e) {
            console.error("Failed to parse cart", e);
            return [];
        }
    });
    const [isOpen, setIsOpen] = useState(false);
    const [deliveryTime, setDeliveryTime] = useState(30); // Default 30 mins
    const [settings, setSettings] = useState({ deliveryFee: 40, taxRate: 5 });

    // Removed misplaced import

    useEffect(() => {
        // Load cart from local storage - REMOVED (Handled in initialization)

        // Fetch Settings with Polling
        const fetchSettingsAndValidateCart = async () => {
            try {
                // 1. Fetch Settings
                const settingsRes = await fetch(`${API_URL}/api/settings`);
                const settingsData = await settingsRes.json();
                setSettings(settingsData);

                // 2. Fetch Latest Food Prices to Validate Cart
                const foodRes = await fetch(`${API_URL}/api/food`);
                const foodData = await foodRes.json();

                setCart(prevCart => {
                    let hasChanges = false;
                    const newCart = prevCart.map(cartItem => {
                        const latestItem = foodData.find(f => f._id === cartItem._id);
                        if (latestItem && latestItem.price !== cartItem.price) {
                            hasChanges = true;
                            return { ...cartItem, price: latestItem.price, name: latestItem.name, imageUrl: latestItem.imageUrl };
                        }
                        return cartItem;
                    });
                    return hasChanges ? newCart : prevCart;
                });

            } catch (err) {
                console.error("Failed to sync data", err);
            }
        };

        fetchSettingsAndValidateCart(); // Initial
        const interval = setInterval(fetchSettingsAndValidateCart, 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Save cart to local storage
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
        setIsOpen(true);

        // Simulate updating delivery time based on load
        const randomTime = Math.floor(Math.random() * (45 - 25 + 1)) + 25;
        setDeliveryTime(randomTime);
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(i => i._id !== itemId));
    };

    const updateQty = (itemId, delta) => {
        setCart(prev => prev.map(i => {
            if (i._id === itemId) {
                const newQty = Math.max(0, i.qty + delta);
                return { ...i, qty: newQty };
            }
            return i;
        }).filter(i => i.qty > 0));
    };

    const clearCart = () => {
        setCart([]);
        setIsOpen(false);
    };

    // Calculations
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const count = cart.reduce((acc, item) => acc + item.qty, 0);

    // Derived costs
    const deliveryFee = count > 0 ? settings.deliveryFee : 0;
    const taxAmount = count > 0 ? (subtotal * settings.taxRate / 100) : 0;
    const total = subtotal + deliveryFee + taxAmount;

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQty,
            clearCart,
            isOpen,
            toggleCart: () => setIsOpen(!isOpen),
            subtotal,
            taxAmount,
            deliveryFee,
            total,
            count,
            deliveryTime,
            settings
        }}>
            {children}
        </CartContext.Provider>
    );
};
