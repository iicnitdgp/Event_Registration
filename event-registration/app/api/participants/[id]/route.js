import { NextResponse } from 'next/server';
import { EVENT_DBOperation } from '../../DBOperation/event';

// DELETE - Delete a participant registration
export async function DELETE(request, { params }) {
    try {
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/');
        const participantId = pathSegments[pathSegments.length - 1];

        if (!participantId) {
            return NextResponse.json(
                { success: false, error: 'Participant ID is required' },
                { status: 400 }
            );
        }

        await EVENT_DBOperation.deleteParticipant(participantId);
        return NextResponse.json({ success: true, message: 'Participant deleted successfully' });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
