
import { NextResponse } from 'next/server';
import dbConnect, { Scheme } from '@/lib/db';

export async function GET() {
    try {
        await dbConnect();
        const schemes = await Scheme.find().populate('departmentId', 'name').sort({ createdAt: -1 }); // Recently added first
        return NextResponse.json(schemes);
    } catch (error: any) {
        return NextResponse.json(
            { message: 'Error fetching schemes', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Validation could go here

        const scheme = await Scheme.create({
            title: body.title,
            description: body.description,
            departmentId: body.departmentId 
        });

        return NextResponse.json(scheme, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { message: 'Error creating scheme', error: error.message },
            { status: 500 }
        );
    }
}
