
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();

        const genderDistribution = await User.aggregate([
            { $group: { _id: "$gender", count: { $sum: 1 } } },
            { $match: { _id: { $ne: null } } }
        ]);

        const employmentDistribution = await User.aggregate([
            { $group: { _id: "$employmentStatus", count: { $sum: 1 } } },
            { $match: { _id: { $ne: null } } }
        ]);

        const occupationDistribution = await User.aggregate([
            { $group: { _id: '$occupation', count: { $sum: 1 } } },
            { $match: { _id: { $nin: [null, ""] } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const educationDistribution = await User.aggregate([
            { $group: { _id: "$educationLevel", count: { $sum: 1 } } },
            { $match: { _id: { $nin: [null, ""] } } }
        ]);

        const maritalDistribution = await User.aggregate([
            { $group: { _id: "$maritalStatus", count: { $sum: 1 } } },
            { $match: { _id: { $nin: [null, ""] } } }
        ]);

        const housingDistribution = await User.aggregate([
            { $group: { _id: "$housingType", count: { $sum: 1 } } },
            { $match: { _id: { $nin: [null, ""] } } }
        ]);

        const incomeDistribution = await User.aggregate([
            {
                $bucket: {
                    groupBy: "$annualIncome",
                    boundaries: [0, 50000, 100000, 500000, 1000000, 5000000],
                    default: "5000000+",
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        return NextResponse.json({
            genderDistribution,
            employmentDistribution,
            occupationDistribution,
            educationDistribution,
            maritalDistribution,
            housingDistribution,
            incomeDistribution
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: 'Error fetching census stats', error: error.message },
            { status: 500 }
        );
    }
}
