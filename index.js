require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { resolve } = require('path');

const app = express();
const port = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('static'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to database'))
.catch((err) => console.error('Error connecting to database', err));

// Serve HTML Page
app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// POST /api/users - Create a new user
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, age } = req.body;

        // Validate required fields
        if (!name || !email || !age) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create a new user
        const newUser = new User({ name, email, age });
        await newUser.save();

        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
