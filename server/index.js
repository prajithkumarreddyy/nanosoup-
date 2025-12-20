const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const FoodItem = require('./models/FoodItem');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/user', require('./routes/user'));
app.use('/api/payment', require('./routes/payment'));


// MongoDB Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Seed data (check performed inside seedData, or just run it to refresh)
        // For development moving to production with new items, we can force seed once or check count.
        // Let's rely on checking if we have enough items?
        // Or simpler: Just run seedData() and let it handle cleanup (which we added: deleteMany).
        await seedData();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Seed Data Function
const seedData = async () => {
    // Clear existing data to avoid duplicates/stale data
    await FoodItem.deleteMany({});

    const items = [
        // Italian
        {
            name: "Truffle Mushroom Risotto",
            description: "Creamy arborio rice with premium truffle oil and wild mushrooms.",
            price: 450,
            category: "Italian",
            imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=2070&auto=format&fit=crop",
            isVegetarian: true
        },
        {
            name: "Margherita Pizza",
            description: "Classic tomato sauce, fresh mozzarella, and basil on sourdough crust.",
            price: 350,
            category: "Italian",
            imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=2069&auto=format&fit=crop",
            isVegetarian: true
        },
        {
            name: "Pesto Pasta",
            description: "Fusilli pasta tossed in fresh basil pesto with cherry tomatoes and pine nuts.",
            price: 380,
            category: "Italian",
            imageUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=2070&auto=format&fit=crop",
            isVegetarian: true
        },
        {
            name: "Lasagna",
            description: "Layered pasta with rich meat sauce, bechamel, and melted cheese.",
            price: 480,
            category: "Italian",
            imageUrl: "https://images.unsplash.com/photo-1574868233977-455b9d71440d?q=80&w=2070&auto=format&fit=crop",
            isVegetarian: false
        },

        // Japanese
        {
            name: "Spicy Miso Ramen",
            description: "Rich miso broth with chashu pork, soft-boiled egg, and green onions.",
            price: 380,
            category: "Japanese",
            imageUrl: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=2031&auto=format&fit=crop",
            isVegetarian: false
        },
        {
            name: "Sushi Platter",
            description: "Assorted fresh nigiri and maki rolls served with wasabi and ginger.",
            price: 750,
            category: "Japanese",
            imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070&auto=format&fit=crop",
            isVegetarian: false
        },
        {
            name: "Vegetable Tempura",
            description: "Crispy battered seasonal vegetables served with tentsuyu dipping sauce.",
            price: 320,
            category: "Japanese",
            imageUrl: "https://images.unsplash.com/photo-1615361200141-f45040f367be?q=80&w=1964&auto=format&fit=crop",
            isVegetarian: true
        },

        // Indian
        {
            name: "Butter Chicken",
            description: "Tender chicken in a rich, creamy tomato and cashew sauce.",
            price: 420,
            category: "Indian",
            imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=2070&auto=format&fit=crop",
            isVegetarian: false
        },
        {
            name: "Paneer Tikka Masala",
            description: "Grilled paneer cubes in spicy gravy.",
            price: 390,
            category: "Indian",
            imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=2071&auto=format&fit=crop",
            isVegetarian: true
        },
        {
            name: "Biryani",
            description: "Fragrant basmati rice cooked with aromatic spices and marinated vegetables.",
            price: 350,
            category: "Indian",
            imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=2070&auto=format&fit=crop",
            isVegetarian: true
        },
        {
            name: "Garlic Naan",
            description: "Soft, oven-baked flatbread topped with garlic and butter.",
            price: 60,
            category: "Indian",
            imageUrl: "https://images.unsplash.com/photo-1626074353765-5ea1d4719601?q=80&w=1974&auto=format&fit=crop",
            isVegetarian: true
        },

        {
            name: "Rice Test",
            description: "Delicious steamed rice test item.",
            price: 1,
            category: "Indian",
            imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=2072&auto=format&fit=crop",
            isVegetarian: true
        },

        // Mexican
        {
            name: "Mexican Street Tacos",
            description: "Three soft corn tortillas with carne asada, onions, and cilantro.",
            price: 299,
            category: "Mexican",
            imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=2070&auto=format&fit=crop",
            isVegetarian: false
        },
        {
            name: "Burrito Bowl",
            description: "Rice, beans, grilled chicken, salsa, guacamole, and cheese in a bowl.",
            price: 340,
            category: "Mexican",
            imageUrl: "https://images.unsplash.com/photo-1579930965306-69a3014c25ce?q=80&w=1974&auto=format&fit=crop",
            isVegetarian: false
        },

        // Chinese
        {
            name: "Kung Pao Chicken",
            description: "Stir-fried chicken with peanuts, vegetables, and chili peppers.",
            price: 380,
            category: "Chinese",
            imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1974&auto=format&fit=crop",
            isVegetarian: false
        },
        {
            name: "Veg Hakka Noodles",
            description: "Wok-tossed noodles with crunchy vegetables and soy sauce.",
            price: 250,
            category: "Chinese",
            imageUrl: "https://images.unsplash.com/photo-1612033448550-626591042717?q=80&w=2070&auto=format&fit=crop",
            isVegetarian: true
        },

        // Desserts
        {
            name: "Chocolate Brownie",
            description: "Fudgy chocolate brownie served with vanilla ice cream.",
            price: 180,
            category: "Desserts",
            imageUrl: "https://images.unsplash.com/photo-1564355808539-22fda30bed7c?q=80&w=2070&auto=format&fit=crop",
            isVegetarian: true
        },
        {
            name: "Tiramisu",
            description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream.",
            price: 250,
            category: "Desserts",
            imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=1974&auto=format&fit=crop",
            isVegetarian: true
        },
        {
            name: "New York Cheesecake",
            description: "Rich and creamy cheesecake with a graham cracker crust.",
            price: 280,
            category: "Desserts",
            imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=2070&auto=format&fit=crop",
            isVegetarian: true
        }
    ];

    await FoodItem.insertMany(items);
    console.log('Database seeded with ' + items.length + ' items');
};

// Routes
app.get('/api/food', async (req, res) => {
    try {
        const foods = await FoodItem.find({});
        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Nanosoup API is running...');
});

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
