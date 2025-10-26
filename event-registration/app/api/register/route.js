import { NextResponse } from 'next/server';
import { EVENT_DBOperation } from '../DBOperation/event';
import sendEmail from '../../../lib/mail';
import { generateAndUploadQRCode } from '../../../lib/qrcode';

// POST - Register for event
export async function POST(request) {
    try {
        const body = await request.json();
        
        // Register the user
        const registration = await EVENT_DBOperation.registerForEvent(body);
        
        console.log('Registration created:', registration);
        
        // Generate ticket URL using the string ID
        const registrationId = registration._id.toString();
        const ticketUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/ticket/${registration.EventID}/${registrationId}`;
        
        console.log('Ticket URL:', ticketUrl);
        
        // Generate and upload QR code to Azure
        const qrCodeUrl = await generateAndUploadQRCode(ticketUrl, registrationId);
        
        console.log('QR Code URL from Azure:', qrCodeUrl);
        
        // Update registration with QR code URL
        await EVENT_DBOperation.updateRegistrationQRCode(registrationId, qrCodeUrl);
        
        console.log('Updated registration with QR code URL');
        
        // Get event details
        const event = await EVENT_DBOperation.getEventById(registration.EventID);
        
        // Create email HTML content using Azure URL
        const emailContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
              .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
              .details h3 { margin-top: 0; color: #4CAF50; }
              .details p { margin: 10px 0; }
              .label { font-weight: bold; color: #555; }
              .qr-section { text-align: center; margin: 20px 0; padding: 20px; background-color: white; }
              .qr-section img { max-width: 300px; height: auto; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Event Registration Successful!</h1>
              </div>
              <div class="content">
                <p>Dear ${registration.Name},</p>
                <p>Thank you for registering for the event. Here are your registration details:</p>
                
                <div class="details">
                  <h3>Personal Information</h3>
                  <p><span class="label">Name:</span> ${registration.Name}</p>
                  <p><span class="label">Roll Number:</span> ${registration.RollNo}</p>
                  <p><span class="label">Email:</span> ${registration.Email}</p>
                  <p><span class="label">Phone:</span> ${registration.Phone}</p>
                </div>
                
                <div class="details">
                  <h3>Event Information</h3>
                  <p><span class="label">Event Name:</span> ${event.EventName}</p>
                  <p><span class="label">Event Date:</span> ${new Date(event.EventDate).toLocaleDateString()}</p>
                  ${event.EventDetails ? `<p><span class="label">Details:</span> ${event.EventDetails}</p>` : ''}
                </div>
                
                <div class="qr-section">
                  <h3>Your Event Ticket QR Code</h3>
                  <p>Please present this QR code at the event venue:</p>
                  <img src="${qrCodeUrl}" alt="Event Ticket QR Code" style="max-width: 300px; height: auto; border: 2px solid #4CAF50; border-radius: 8px; padding: 10px;" />
                  <p style="margin-top: 15px; font-size: 14px; color: #666;">
                    You can also access your ticket at: <a href="${ticketUrl}" style="color: #4CAF50; text-decoration: none;">${ticketUrl}</a>
                  </p>
                </div>
                
                <p>We look forward to seeing you at the event!</p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        
        // Send email
        await sendEmail(
          registration.Email,
          `Registration Confirmed: ${event.EventName}`,
          emailContent
        );
        
        console.log('Email sent successfully');
        
        return NextResponse.json({ 
          success: true, 
          data: { ...registration, QRCodeUrl: qrCodeUrl },
          message: 'Registration successful! Confirmation email sent.' 
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
