import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI or MONGO_URI not found in environment variables.');
    console.error('Please create a .env file with your MongoDB connection string.');
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
}, {
    collection: 'Gov'
});

const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);

const departments = [
    {
        name: "Administration Department",
        username: "admin_dept",
        password: "password123",
        head: "Rajesh Kumar",
        budget: 5000000,
        description: "Handles overall administrative functions and coordination"
    },
    {
        name: "IT Department",
        username: "it_dept",
        password: "password123",
        head: "Arun Gupta",
        budget: 3000000,
        description: "Manages technology infrastructure and digital services"
    },
    {
        name: "Finance Department",
        username: "finance_dept",
        password: "password123",
        head: "Vikram Malhotra",
        budget: 8000000,
        description: "Oversees budgeting, accounting, and financial planning"
    },
    {
        name: "HR Department",
        username: "hr_dept",
        password: "password123",
        head: "Anjali Gupta",
        budget: 2000000,
        description: "Manages recruitment, training, and employee welfare"
    }
];

async function setupDepartments() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Clear existing departments
        console.log('\nClearing existing departments...');
        await Department.deleteMany({});
        console.log('✓ Cleared existing departments');

        // Hash passwords and insert departments
        console.log('\nCreating departments with hashed passwords...');
        for (const dept of departments) {
            const hashedPassword = await bcrypt.hash(dept.password, 10);
            const department = new Department({
                ...dept,
                password: hashedPassword
            });
            await department.save();
            console.log(`✓ Created: ${dept.name} (username: ${dept.username})`);
        }

        console.log('\n✅ All departments created successfully!');
        console.log('\nYou can now login with:');
        console.log('- Username: admin_dept, it_dept, finance_dept, or hr_dept');
        console.log('- Password: password123');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('\n✓ Database connection closed');
        }
    }
}

setupDepartments();
