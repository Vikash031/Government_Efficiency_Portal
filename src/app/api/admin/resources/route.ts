import { NextResponse } from 'next/server';
import connectDB, { Department } from '@/lib/db';

// GET: Fetch resources and budget for a department
export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const departmentId = searchParams.get('departmentId');

        if (!departmentId) {
            return NextResponse.json({ message: "Department ID is required" }, { status: 400 });
        }

        const dept = await Department.findById(departmentId).select('budget expenditure resources');
        if (!dept) return NextResponse.json({ message: "Department not found" }, { status: 404 });

        return NextResponse.json(dept, { status: 200 });
    } catch (error) {
        console.error("Error fetching resources:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH: Update Resources or Budget
export async function PATCH(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { departmentId, expenditure, resources } = body;

        if (!departmentId) return NextResponse.json({ message: "Department ID required" }, { status: 400 });

        const dept = await Department.findById(departmentId);
        if (!dept) return NextResponse.json({ message: "Department not found" }, { status: 404 });

        if (expenditure !== undefined) dept.expenditure = expenditure;
        if (resources) dept.resources = resources;

        await dept.save();

        return NextResponse.json(dept, { status: 200 });
    } catch (error) {
        console.error("Error updating resources:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
