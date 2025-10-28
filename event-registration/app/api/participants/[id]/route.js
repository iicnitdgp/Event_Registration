import { NextResponse } from 'next/server';
import { EVENT_DBOperation } from '../../DBOperation/event';
import sendEmail from '@/lib/mail';

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

// PATCH - Update a participant registration and optionally send email
export async function PATCH(request) {
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

        const body = await request.json();
        const { Name, Email, Phone, RollNo, FoodCuponNumber, sendEmail: shouldEmail } = body || {};

        const updated = await EVENT_DBOperation.updateParticipant(participantId, {
            Name,
            Email,
            Phone,
            RollNo,
            FoodCuponNumber,
        });

        if (shouldEmail) {
            const { EventName, EventDate, EventDetails, QRCodeUrl, FoodCuponIssued = 0, EventID } = updated;
            const safeDate = EventDate ? new Date(EventDate).toLocaleString() : '';
            const ticketUrl = `${process.env.NEXTAUTH_URL}/ticket/${EventID}/${participantId}`;

            const html = `
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
                  <h2 style="color:#4a5568;margin-bottom:8px">Your registration was updated</h2>
                  <p style="margin:0 0 12px 0">Hello ${updated.Name},</p>
                  <p style="margin:0 0 12px 0">Your registration details for <strong>${EventName}</strong> have been updated.</p>

                  <div style="background:#f7fafc;padding:12px 16px;border-left:4px solid #667eea;border-radius:8px;margin:16px 0">
                    <p style=\"margin:6px 0\"><strong>Event:</strong> ${EventName}</p>
                    ${safeDate ? `<p style=\"margin:6px 0\"><strong>Date:</strong> ${safeDate}</p>` : ''}
                    ${EventDetails ? `<p style=\"margin:6px 0\"><strong>Details:</strong> ${EventDetails}</p>` : ''}
                  </div>

                  <div style="background:#fff;padding:12px 16px;border:1px solid #e2e8f0;border-radius:8px;margin:16px 0">
                    <p style=\"margin:6px 0\"><strong>Name:</strong> ${updated.Name}</p>
                    <p style=\"margin:6px 0\"><strong>Email:</strong> ${updated.Email}</p>
                    ${updated.Phone ? `<p style=\"margin:6px 0\"><strong>Phone:</strong> ${updated.Phone}</p>` : ''}
                    <p style=\"margin:6px 0\"><strong>Roll No:</strong> ${updated.RollNo}</p>
                    ${typeof updated.FoodCuponNumber === 'number' ? `<p style=\"margin:6px 0\"><strong>Food Coupons Allocated:</strong> ${updated.FoodCuponNumber} (Issued: ${FoodCuponIssued})</p>` : ''}
                  </div>

                  ${QRCodeUrl ? `
                    <div style="margin:20px 0;text-align:center;background:#f7fafc;padding:20px;border-radius:8px">
                      <h3 style="color:#4a5568;margin-bottom:12px">Your Event Ticket QR Code</h3>
                      <p style="margin:0 0 12px 0;color:#4a5568">Please present this QR code at the event venue:</p>
                      <img src="${QRCodeUrl}" alt="Event Ticket QR Code" style="max-width:300px;height:auto;border:2px solid #4CAF50;border-radius:8px;padding:10px" />
                      <p style="margin-top:15px;font-size:14px;color:#666">
                        You can also access your ticket at: <a href="${ticketUrl}" style="color:#4CAF50;text-decoration:none">${ticketUrl}</a>
                      </p>
                    </div>
                  ` : ''}

                  <p style="margin-top:20px;color:#4a5568">If you didn't request this change, please contact the organizers.</p>
                </div>
            `;

            try {
                await sendEmail(updated.Email, `Registration updated - ${EventName}`, html);
            } catch (e) {
                console.error('Email sending failed:', e);
            }
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
