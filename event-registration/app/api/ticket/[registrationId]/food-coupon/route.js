import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { EVENT_DBOperation } from '../../../DBOperation/event';

// PATCH - Update food coupon status
export async function PATCH(request, { params }) {
    try {
        // Check if user is logged in
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please login.' },
                { status: 401 }
            );
        }

        const { registrationId } = await params;
        const body = await request.json();
        const { issuingCount } = body;

        if (typeof issuingCount !== 'number' || issuingCount < 1) {
            return NextResponse.json(
                { success: false, error: 'Invalid issuing count' },
                { status: 400 }
            );
        }

        await EVENT_DBOperation.issueFoodCoupons(registrationId, issuingCount);

        return NextResponse.json({ 
            success: true, 
            message: 'Food coupons issued successfully' 
        });
    } catch (error) {
        console.error('Error issuing food coupons:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
