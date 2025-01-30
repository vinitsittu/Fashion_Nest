const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');  // New line
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
const port = 9000;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define User schema
const userSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String
});
const User = mongoose.model('User', userSchema);

// Register new user
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();
        res.json({ success: true, user: newUser });
    } catch (err) {
        console.error('Error saving user:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Login existing user
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Invalid email or password' });
        }

        res.json({ success: true, user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});
app.listen(9000, '0.0.0.0', () => console.log('Server is running on port 9000'));



// Start the server
// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);

    // Auto-open only if running locally
    // if (process.env.NODE_ENV !== 'production') {
    //     const filePath = `http://localhost:${port}/index.html`;
    //     const openCommand = 
    //         process.platform === 'win32' ? `start ${filePath}` :
    //         process.platform === 'darwin' ? `open ${filePath}` :
    //         `xdg-open ${filePath}`;

    //     exec(openCommand, (error) => {
    //         if (error) {
    //             console.error('Could not open browser automatically:', error);
    //         } else {
    //             console.log(`Opened ${filePath} in the browser`);
    //         }
    //     });
    // }

