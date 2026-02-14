const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file in the root directory
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.warn("Warning: Could not load .env file from", envPath);
} else {
    console.log("Loaded environment variables from", envPath);
}

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI or MONGO_URI not found in environment variables.');
    console.error('Environment variables loaded:', process.env);
    process.exit(1);
}

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true },
    password: { type: String },
    head: { type: String, required: true },
    budget: { type: Number, required: true },
    description: { type: String },
    metrics: {
        filesCleared: { type: Number, default: 0 },
        pendingFiles: { type: Number, default: 0 },
        efficiency: { type: Number, default: 0 },
    },
    createdAt: { type: Date, default: Date.now },
}, { collection: 'Gov' });

const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);

async function seedPolice() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Remove old 'police_admin' user if exists
        const oldUser = await Department.findOne({ username: 'police_admin' });
        if (oldUser) {
            console.log('Removing outdated "police_admin" user...');
            await Department.deleteOne({ username: 'police_admin' });
        }

        const username = "admin_police";
        const passwordPlain = "password123";
        const hashedPassword = await bcrypt.hash(passwordPlain, 10);

        const existingUser = await Department.findOne({ username });

        if (existingUser) {
            console.log(`User "${username}" already exists. Updating password...`);
            existingUser.password = hashedPassword;
            await existingUser.save();
            console.log('Password updated successfully.');
        } else {
            console.log(`Creating new user "${username}"...`);
            const policeDept = new Department({
                name: "Department of Police (Decentralized Justice)",
                username: username,
                password: hashedPassword,
                head: "Director General",
                budget: 5000000,
                description: "Decentralized Justice Portal for secure and transparent FIR management.",
                metrics: {
                    filesCleared: 0,
                    pendingFiles: 0,
                    efficiency: 0
                }
            });
            await policeDept.save();
            console.log(`User "${username}" created successfully.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedPolice();
