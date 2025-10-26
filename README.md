# Event Registration System

A comprehensive event management and registration system built with Next.js, featuring automated email notifications, QR code generation, and food coupon tracking.

## 🚀 Features

### Core Functionality
- **Event Management**: Create and manage multiple events with details and dates
- **Student Registration**: Register students for events with duplicate prevention
- **Email Notifications**: Automated email with registration details and QR code
- **QR Code Generation**: Unique QR codes for each registration, stored in Azure Blob Storage
- **Ticket System**: Public ticket pages accessible via QR code
- **Food Coupon Tracking**: Admin-controlled food coupon issuance and status tracking
- **Participant Management**: View all participants per event with comprehensive details

### Authentication
- Email/Password based authentication using NextAuth
- Protected admin dashboard
- Session management with JWT strategy
- Admin-only actions (food coupon issuance)

### Email System
- Automated email notifications upon registration
- Beautiful HTML email templates
- Embedded QR codes from Azure storage
- Registration and event details included

### QR Code Features
- Generated using QRCode library
- Uploaded to Azure Blob Storage
- Public access for scanning
- Links to ticket verification page

### Food Coupon Management
- Visible to everyone (issued/not issued status)
- Admin-only issuance button (when logged in)
- One-time issuance protection
- Fast confirmation dialog for rush hour efficiency
- Real-time status updates

## 🛠️ Tech Stack

- **Framework**: Next.js 16.0.0 (App Router with Turbopack)
- **Authentication**: NextAuth v4.24.11
- **Database**: MongoDB with Mongoose
- **Email**: Nodemailer (Gmail)
- **Storage**: Azure Blob Storage
- **QR Code**: qrcode library
- **Styling**: SCSS Modules
- **Runtime**: React 19.2.0

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Azure Storage Account
- Gmail account with App Password

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/iicnitdgp/Event_Registration.git
   cd Event_Registration/event-registration
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/event-registration

   # NextAuth Configuration
   NEXTAUTH_SECRET=your-secret-key-change-this-in-production
   NEXTAUTH_URL=http://localhost:3000

   # Admin Credentials
   EMAIL_ID=your-admin-email@example.com
   EMAIL_PASSWORD=your-admin-password

   # Email Configuration (Gmail)
   PassKey=your-gmail-app-password-here

   # Azure Storage Configuration
   AZURE_STORAGE_CONNECTION_STRING=your-azure-connection-string
   AZURE_STORAGE_CONTAINER_NAME=uploads
   ```

4. **Generate NextAuth Secret** (optional but recommended)
   ```bash
   openssl rand -base64 32
   ```

5. **Set up Gmail App Password**
   - Go to Google Account → Security → 2-Step Verification
   - Scroll to "App passwords"
   - Generate password for "Mail"
   - Copy the password to `PassKey` in `.env.local`

6. **Set up Azure Storage**
   - Go to Azure Portal
   - Create/Select Storage Account
   - Go to Access keys
   - Copy Connection String to `.env.local`

## 🚀 Running the Application

**Development mode:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
event-registration/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/      # NextAuth configuration
│   │   ├── DBOperation/             # Database operations
│   │   ├── events/                  # Event CRUD endpoints
│   │   ├── register/                # Registration endpoint
│   │   ├── participants/            # Participants management
│   │   ├── ticket/                  # Ticket verification
│   │   └── upload/image/            # Azure image upload
│   ├── dashboard/                   # Admin dashboard
│   ├── ticket/[eventId]/[registrationId]/  # Public ticket page
│   ├── globals.css
│   ├── layout.js
│   └── page.js                      # Login page
├── component/
│   ├── CreateEvent.js/              # Event creation form
│   ├── EventRegistration/           # Registration form
│   ├── ViewParticipants/            # Participants table
│   └── sessionwrapper.js            # Session provider
├── lib/
│   ├── db.js                        # MongoDB connection
│   ├── mail.js                      # Email service
│   └── qrcode.js                    # QR code generation & Azure upload
├── model/
│   ├── event.js                     # Event schema
│   └── event_register.js            # Registration schema
└── public/
```

## 📊 Database Schema

### Event Model
```javascript
{
  EventName: String (required),
  EventDetails: String,
  EventDate: Date (required),
  timestamps: true
}
```

### EventRegister Model
```javascript
{
  EventID: ObjectId (ref: Event, required),
  Name: String (required),
  Email: String (required),
  Phone: String,
  RollNo: String (required),
  QRCodeUrl: String,
  FoodCuponIssue: Boolean (default: false),
  timestamps: true
}
```

## 🎯 Usage

### Admin Login
1. Navigate to `/` (login page)
2. Enter admin email and password (configured in `.env.local`)
3. Redirects to `/dashboard` after successful login

### Create Event
1. Go to "Create Event" tab in dashboard
2. Fill in Event Name, Details, and Date
3. Click "Create Event"

### Register Student
1. Go to "Register for Event" tab
2. Select an event from dropdown
3. Fill in student details (Name, Email, Phone, Roll Number)
4. Click "Register"
5. System checks for duplicates (by Roll No or Email)
6. Email sent with QR code upon successful registration

### View Participants
1. Go to "View Participants" tab
2. Select an event from dropdown
3. View table with all registered participants
4. See QR code links and food coupon status
5. Delete participants if needed

### Issue Food Coupon
1. Scan QR code or visit ticket page
2. Login as admin
3. Click "Issue Food Coupon" button
4. Confirm in dialog
5. Status updates immediately (no success popup for speed)

### Ticket Verification
- Anyone can access: `/ticket/[eventId]/[registrationId]`
- Shows event details, participant info, QR code
- Food coupon status visible to everyone
- Admin actions visible only when logged in

## 🔒 Security Features

- JWT-based session management
- Protected API routes with authentication checks
- Duplicate registration prevention
- One-time food coupon issuance
- Environment variable configuration
- Secure password handling

## 🎨 UI Features

- Responsive design (mobile-friendly)
- SCSS modules for styling
- Tabbed navigation in dashboard
- Color-coded status badges
- Loading states and error handling
- Confirmation dialogs for critical actions

## 📧 Email Template

The automated email includes:
- Event registration confirmation header
- Personal information (Name, Roll No, Email, Phone)
- Event details (Name, Date, Description)
- Embedded QR code image from Azure
- Link to ticket page
- Professional formatting with brand colors

## 🐛 Known Issues & Limitations

- Gmail daily sending limits apply
- Azure storage costs for QR codes
- Single admin account (can be extended to multiple)
- No email validation beyond format check

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Authors

- **IIC NIT Dgp** - [iicnitdgp](https://github.com/iicnitdgp)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- NextAuth for authentication solution
- Azure for blob storage
- MongoDB for database solution

## 📞 Support

For issues and questions, please create an issue in the GitHub repository.

---

**Built with ❤️ for efficient event management**