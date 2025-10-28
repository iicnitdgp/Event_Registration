import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import EventRegister from '@/model/event_register';

// GET - Migrate existing records to add attendance fields
export async function GET(request) {
    try {
        // Check if user is authenticated (admin)
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const now = new Date();

        // Update all documents that don't have attendance fields
        const result = await EventRegister.updateMany(
            {
                $or: [
                    { EntryTimestamp: { $exists: false } },
                    { ExitTimestamp: { $exists: false } },
                    { TotalTimeInside: { $exists: false } }
                ]
            },
            {
                $set: {
                    EntryTimestamp: now,
                    ExitTimestamp: now,
                    TotalTimeInside: 0
                }
            }
        );

        return NextResponse.json({
            success: true,
            message: `Updated ${result.modifiedCount} records with attendance fields`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error migrating attendance fields:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
