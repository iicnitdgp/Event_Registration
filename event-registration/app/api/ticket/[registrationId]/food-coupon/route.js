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
        const { foodCouponIssued } = body;

        if (typeof foodCouponIssued !== 'boolean') {
            return NextResponse.json(
                { success: false, error: 'Invalid food coupon status' },
                { status: 400 }
            );
        }

        await EVENT_DBOperation.updateFoodCouponStatus(registrationId, foodCouponIssued);

        return NextResponse.json({ 
            success: true, 
            message: 'Food coupon status updated successfully' 
        });
    } catch (error) {
        console.error('Error updating food coupon:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
