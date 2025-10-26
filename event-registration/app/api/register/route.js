import { NextResponse } from 'next/server';
import { EVENT_DBOperation } from '../DBOperation/event';

// POST - Register for event
export async function POST(request) {
    try {
        const body = await request.json();
        const registration = await EVENT_DBOperation.registerForEvent(body);
        return NextResponse.json({ success: true, data: registration });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
