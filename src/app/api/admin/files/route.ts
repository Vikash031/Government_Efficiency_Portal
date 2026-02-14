import { NextResponse } from 'next/server';
import connectDB, { File } from '@/lib/db';

// GET: Fetch files for a department
export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const departmentId = searchParams.get('departmentId');

        if (!departmentId) {
            return NextResponse.json({ message: "Department ID is required" }, { status: 400 });
        }

        const files = await File.find({ departmentId }).sort({ updatedAt: -1 });
        return NextResponse.json(files, { status: 200 });
    } catch (error) {
        console.error("Error fetching files:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create a new file
export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        // Generate a Reference Number if not provided
        if (!body.referenceNumber) {
            body.referenceNumber = `FILE-${Date.now().toString(36).toUpperCase()}`;
        }

        // Add initial history entry
        body.history = [{
            stage: 'Created',
            timestamp: new Date(),
            notes: 'File created in system.',
            updatedBy: 'Admin'
        }];

        const newFile = await File.create(body);
        return NextResponse.json(newFile, { status: 201 });
    } catch (error) {
        console.error("Error creating file:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH: Update file status/details
export async function PATCH(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { id, status, notes, assignedTo, priority } = body;

        if (!id) return NextResponse.json({ message: "File ID required" }, { status: 400 });

        const file = await File.findById(id);
        if (!file) return NextResponse.json({ message: "File not found" }, { status: 404 });

        // Update fields if provided
        if (status) file.status = status;
        if (assignedTo) file.assignedTo = assignedTo;
        if (priority) file.priority = priority;

        // Add history entry
        file.history.push({
            stage: status || 'Updated',
            timestamp: new Date(),
            notes: notes || 'File details updated.',
            updatedBy: 'Admin'
        });

        file.updatedAt = new Date();
        await file.save();

        return NextResponse.json(file, { status: 200 });
    } catch (error) {
        console.error("Error updating file:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
