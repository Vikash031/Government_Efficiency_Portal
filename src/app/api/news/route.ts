
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { News } from '@/lib/db';

export async function GET() {
    try {
        await connectDB();
        const news = await News.find().populate('departmentId', 'name').sort({ createdAt: -1 });
        return NextResponse.json(news);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching news', error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const data = await request.json();
        const news = new News(data);
        await news.save();
        return NextResponse.json(news, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating news', error }, { status: 500 });
    }
}
