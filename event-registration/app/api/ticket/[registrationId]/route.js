import { NextResponse } from 'next/server';
import { EVENT_DBOperation } from '../../DBOperation/event';

// GET - Get registration details by ID
export async function GET(request, { params }) {
    try {
        const { registrationId } = await params;
        const registration = await EVENT_DBOperation.getRegistrationById(registrationId);
        return NextResponse.json({ success: true, data: registration });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 404 }
        );
    }
}
