import { NextResponse } from 'next/server';
import { getAllFIRs, createFIR, updateFIRStatus } from '@/lib/blockchain';

export async function GET() {
    try {
        const firs = await getAllFIRs();
        return NextResponse.json(firs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { description } = body;

        if (!description) {
            return NextResponse.json({ error: "Description is required" }, { status: 400 });
        }

        const result = await createFIR(description);
        return NextResponse.json({ success: true, hash: result.hash });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status, notes } = body;

        if (!id || !status) {
            return NextResponse.json({ error: "ID and Status are required" }, { status: 400 });
        }

        const result = await updateFIRStatus(Number(id), status, notes || "");
        return NextResponse.json({ success: true, hash: result.hash });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
