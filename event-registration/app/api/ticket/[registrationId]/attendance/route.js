import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { EVENT_DBOperation } from '../../../DBOperation/event';

// PATCH - Mark entry or exit
export async function PATCH(request, { params }) {
    try {
        // Check if user is authenticated (admin)
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { registrationId } = await params;
        const body = await request.json();
        const { action } = body; // 'entry' or 'exit'

        if (!action || !['entry', 'exit'].includes(action)) {
            return NextResponse.json(
                { success: false, error: 'Invalid action. Must be "entry" or "exit"' },
                { status: 400 }
            );
        }

        if (action === 'entry') {
            await EVENT_DBOperation.markEntry(registrationId);
        } else {
            await EVENT_DBOperation.markExit(registrationId);
        }

        return NextResponse.json({
            success: true,
            message: `${action === 'entry' ? 'Entry' : 'Exit'} marked successfully`
        });
    } catch (error) {
        console.error('Error marking attendance:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
