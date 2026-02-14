
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Grievance from '@/models/Grievance';
import User from '@/models/User'; // Ensure User model is registered

export async function GET(
    request: Request,
    { params }: { params: Promise<{ empId: string }> }
) {
    try {
        await dbConnect();

        const { empId } = await params;
        console.log(`[DEBUG] Fetching grievances for empId: ${empId}`);

        // 1. Find the employee in static data to get department linkage
        const { employees } = require('@/data/employees');
        const Department = require('@/models/Department').default;

        const employee = employees.find((e: any) => e.id === empId);

        if (!employee) {
            console.log(`[DEBUG] Employee not found in static data: ${empId}`);
        } else {
            console.log(`[DEBUG] Employee found: ${employee.name}, DeptUser: ${employee.departmentUsername}`);
        }

        // Default query: only explicit messages
        let query: any = { addressedTo: empId };

        if (employee && employee.departmentUsername) {
            const dept = await Department.findOne({ username: employee.departmentUsername });
            if (dept) {
                // Fetch grievances addressed to this employee OR assigned to their department (general)
                query = {
                    $or: [
                        { addressedTo: empId },
                        {
                            department: dept._id,
                            $or: [
                                { addressedTo: { $exists: false } },
                                { addressedTo: null },
                                { addressedTo: "" }
                            ]
                        }
                    ]
                };
            }
        }

        const grievances = await Grievance.find(query)
            .populate({ path: 'raisedBy', model: User, select: 'name email' })
            .sort({ createdAt: -1 });

        return NextResponse.json(grievances);
    } catch (error: any) {
        console.error('Error fetching employee grievances:', error);
        return NextResponse.json(
            { message: 'Error fetching employee grievances', error: error.message },
            { status: 500 }
        );
    }
}
