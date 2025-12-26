const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

console.log("Attempting to connect to MongoDB...");
console.log("URI length:", uri ? uri.length : 0);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log("SUCCESS: MongoDB Connected!");
        process.exit(0);
    })
    .catch(err => {
        console.error("ERROR: Connection failed.");
        console.error(err);
        process.exit(1);
    });
