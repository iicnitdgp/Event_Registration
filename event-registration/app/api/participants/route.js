import { NextResponse } from 'next/server';
import { EVENT_DBOperation } from '../DBOperation/event';

// GET - Get registered participants for an event
export async function GET(request, { params }) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');
        
        if (!eventId) {
            return NextResponse.json(
                { success: false, error: 'Event ID is required' },
                { status: 400 }
            );
        }

        const participants = await EVENT_DBOperation.getRegisteredParticipants(eventId);
        return NextResponse.json({ success: true, data: participants });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
