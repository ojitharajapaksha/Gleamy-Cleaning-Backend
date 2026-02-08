# GLEAMY Backend API

Backend API for GLEAMY Cleaning Services - Smart Cleaning Service Management & Marketing Platform

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (via Prisma ORM)
- **Authentication**: Firebase Authentication
- **File Storage**: Cloudinary
- **Email**: Nodemailer

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.config.ts
│   │   ├── firebase.config.ts
│   │   └── cloudinary.config.ts
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── booking.controller.ts
│   │   ├── service.controller.ts
│   │   ├── user.controller.ts
│   │   ├── admin.controller.ts
│   │   └── employee.controller.ts
│   ├── middleware/       # Custom middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── upload.middleware.ts
│   ├── routes/           # API routes
│   │   ├── auth.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── service.routes.ts
│   │   ├── user.routes.ts
│   │   ├── admin.routes.ts
│   │   └── employee.routes.ts
│   └── server.ts         # Main server file
├── prisma/
│   └── schema.prisma     # Database schema
├── uploads/              # Temporary file uploads
├── .env.example          # Environment variables example
├── package.json
└── tsconfig.json
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update the `.env` file with your actual configuration:

- MongoDB connection string
- Firebase Admin SDK credentials
- Cloudinary credentials
- Email configuration

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to MongoDB
npm run prisma:push
```

### 4. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 5. Build for Production

```bash
npm run build
npm start
```

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |
| PUT | `/profile` | Update profile | Yes |

### Bookings (`/api/bookings`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create booking | Yes (Customer) |
| GET | `/` | Get user bookings | Yes (Customer) |
| GET | `/:id` | Get booking details | Yes |
| PUT | `/:id` | Update booking | Yes |
| DELETE | `/:id` | Cancel booking | Yes |
| POST | `/:id/upload-images` | Upload environment images | Yes |

### Services (`/api/services`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all services | No |
| GET | `/:id` | Get service by ID | No |
| POST | `/` | Create service | Yes (Admin) |
| PUT | `/:id` | Update service | Yes (Admin) |
| DELETE | `/:id` | Delete service | Yes (Admin) |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard/stats` | Dashboard statistics | Yes (Admin) |
| GET | `/analytics` | Analytics data | Yes (Admin) |
| GET | `/bookings` | All bookings | Yes (Admin) |
| GET | `/customers` | All customers | Yes (Admin) |
| GET | `/employees` | All employees | Yes (Admin) |
| POST | `/employees` | Create employee | Yes (Admin) |
| PUT | `/employees/:id` | Update employee | Yes (Admin) |
| DELETE | `/employees/:id` | Delete employee | Yes (Admin) |
| POST | `/jobs/assign` | Assign job to employee | Yes (Admin) |

### Employee (`/api/employees`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/jobs` | Get assigned jobs | Yes (Employee) |
| GET | `/jobs/:id` | Get job details | Yes (Employee) |
| PUT | `/jobs/:id/status` | Update job status | Yes (Employee) |
| POST | `/jobs/:id/upload-images` | Upload job images | Yes (Employee) |

## 🔐 Authentication

The API uses Firebase Authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

## 🗄️ Database Models

### User Roles
- `CUSTOMER` - Regular customers
- `ADMIN` - System administrators
- `EMPLOYEE` - Cleaning staff
- `SUPER_ADMIN` - Super administrators

### Booking Statuses
- `PENDING` - Awaiting confirmation
- `CONFIRMED` - Confirmed and assigned
- `IN_PROGRESS` - Currently being serviced
- `COMPLETED` - Service completed
- `CANCELLED` - Cancelled by customer
- `RESCHEDULED` - Rescheduled to new date

### Payment Statuses
- `PENDING` - Payment pending
- `PAID` - Fully paid
- `PARTIALLY_PAID` - Partially paid
- `REFUNDED` - Refunded
- `FAILED` - Payment failed

## 🚀 Deployment

### Deploy to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables from `.env`
5. Deploy!

## 📝 Development Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:push      # Push schema to database
npm run prisma:studio    # Open Prisma Studio
npm run lint         # Run ESLint
```

## 🔧 Configuration Files

- `tsconfig.json` - TypeScript configuration
- `prisma/schema.prisma` - Database schema
- `.env` - Environment variables (not in git)
- `.env.example` - Environment variables template

## 📦 Key Dependencies

- `express` - Web framework
- `@prisma/client` - Prisma ORM
- `firebase-admin` - Firebase Admin SDK
- `cloudinary` - Image/video storage
- `multer` - File upload handling
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `nodemailer` - Email sending
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `zod` - Schema validation

## 🛡️ Security Features

- Firebase Authentication integration
- Role-based access control (RBAC)
- Input validation and sanitization
- Secure file upload handling
- HTTPS-only in production
- CORS configuration
- Rate limiting (to be implemented)
- Audit logging for admin actions

## 📧 Email Configuration

The system uses Nodemailer for sending emails. Configure your SMTP settings in `.env`:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## 🌐 CORS Configuration

Update `FRONTEND_URL` in `.env` to match your frontend URL:

```
FRONTEND_URL=http://localhost:5173
```

## 📊 Database Management

Using Prisma Studio for database management:

```bash
npm run prisma:studio
```

This opens a browser-based GUI at `http://localhost:5555`

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas
- Ensure database name is correct

### Firebase Authentication Issues
- Verify Firebase credentials in `.env`
- Check Firebase project settings
- Ensure service account has proper permissions

### Cloudinary Upload Issues
- Verify Cloudinary credentials
- Check upload folder permissions
- Ensure file size limits are appropriate

## 📄 License

ISC

## 👥 Author

GLEAMY CLEANING SERVICES (PVT) LTD
