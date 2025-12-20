import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [deliveryTime, setDeliveryTime] = useState(30); // Default 30 mins

    useEffect(() => {
        // Load cart from local storage
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
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

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const count = cart.reduce((acc, item) => acc + item.qty, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQty,
            clearCart,
            isOpen,
            toggleCart: () => setIsOpen(!isOpen),
            total,
            count,
            deliveryTime
        }}>
            {children}
        </CartContext.Provider>
    );
};
