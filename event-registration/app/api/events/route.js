import { NextResponse } from 'next/server';
import { EVENT_DBOperation } from '../DBOperation/event';

// GET - Get all events
export async function GET() {
    try {
        const events = await EVENT_DBOperation.getAllEvents();
        return NextResponse.json({ success: true, data: events });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST - Create new event
export async function POST(request) {
    try {
        const body = await request.json();
        const event = await EVENT_DBOperation.createEvent(body);
        return NextResponse.json({ success: true, data: event });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
