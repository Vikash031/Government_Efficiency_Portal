
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/Gov';

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGO_URI environment variable inside .env.local'
    );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

// --- Define Schemas ---

// 1. Department Schema (Updated)
const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true },
    password: { type: String }, // Hashed
    head: { type: String, required: true },
    budget: { type: Number, required: true },
    expenditure: { type: Number, default: 0 }, // NEW: Track spending
    description: { type: String },
    metrics: {
        filesCleared: { type: Number, default: 0 },
        pendingFiles: { type: Number, default: 0 },
        efficiency: { type: Number, default: 0 },
    },
    resources: [{ // NEW: Resource Allocation
        name: { type: String },
        allocated: { type: Number, default: 0 },
        used: { type: Number, default: 0 },
        unit: { type: String, default: 'Units' }
    }],
    createdAt: { type: Date, default: Date.now },
}, { collection: 'Gov' });

export const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);

// 2. Grievance Schema
const grievanceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addressedTo: { type: String },
    status: {
        type: String,
        enum: ['Pending', 'Resolved', 'Rejected'],
        default: 'Pending'
    },
    resolutionNotes: { type: String },
    reopenedCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
}, { collection: 'Grievances' });

export const Grievance = mongoose.models.Grievance || mongoose.model('Grievance', grievanceSchema);

// 3. User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'citizen' },
    createdAt: { type: Date, default: Date.now },
}, { collection: 'Users' });

export const User = mongoose.models.User || mongoose.model('User', userSchema);

// 4. Scheme Schema
const schemeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
}, { collection: 'Schemes' });

export const Scheme = mongoose.models.Scheme || mongoose.model('Scheme', schemeSchema);

// 5. Employee Schema
const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true },
    role: { type: String, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    isPublic: { type: Boolean, default: false }, // If true, visible to citizens
    createdAt: { type: Date, default: Date.now }
}, { collection: 'Employees' });

export const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

// 6. Message Schema
const messageSchema = new mongoose.Schema({
    senderId: { type: String, required: true }, // User ID or Employee ID
    senderRole: { type: String, required: true }, // 'citizen', 'admin', 'employee'
    recipientId: { type: String, required: true }, // Employee ID or User ID
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'Messages' });

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

// 7. File Schema (NEW: e-Office)
const fileSchema = new mongoose.Schema({
    title: { type: String, required: true },
    referenceNumber: { type: String, unique: true, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    status: {
        type: String,
        enum: ['Draft', 'In Review', 'Pending Approval', 'Approved', 'Rejected'],
        default: 'Draft'
    },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    assignedTo: { type: String }, // Can be Employee Name or "General"
    description: { type: String },
    history: [{
        stage: String,
        timestamp: { type: Date, default: Date.now },
        notes: String,
        updatedBy: String
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'Files' });

export const File = mongoose.models.File || mongoose.model('File', fileSchema);

export default connectDB;
