# AI-Powered RFP Management System - Setup Guide

## Project Overview
A complete end-to-end RFP (Request for Proposal) management system with AI-powered features for creating RFPs, managing vendors, sending proposals via email, and comparing vendor responses.

## Prerequisites

- ✅ Node.js v20+ or v22+ (installed)
- ✅ PostgreSQL v14+ (installed)
- Gmail account with App Password enabled
- OpenAI API key

## Project Structure

```
aerchain-rfp-system/
├── backend/               # Express.js API server
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic (AI, Email)
│   │   ├── config/       # Database configuration
│   │   └── database/     # Schema and migrations
│   └── package.json
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   └── theme.js      # Material-UI theme
│   └── package.json
└── README.md
```

## Step-by-Step Setup

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb rfp_management

# Run migrations
cd backend
npm run migrate
```

### 2. Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rfp_management
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# Gmail (SMTP & IMAP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-gmail-app-password
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_TLS=true

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### How to Get Gmail App Password:
1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password (no spaces)

### 3. Start the Backend

```bash
cd backend
npm run dev
```

Backend will run on: http://localhost:5000

### 4. Start the Frontend

```bash
# In a new terminal
cd frontend
npm run dev
```

Frontend will run on: http://localhost:5173

## Features & Usage

### 1. Create RFP with AI
- Navigate to "Create RFP"
- Enter natural language description of your procurement needs
- AI automatically generates structured RFP
- Example: "I need 20 laptops with 16GB RAM, budget $30,000, delivery in 30 days"

### 2. Manage Vendors
- Add vendor information (name, email, company, phone)
- Edit or delete vendors
- Vendors stored in database for easy selection

### 3. Send RFP to Vendors
- View RFP details
- Select vendors from your list
- System sends formatted RFP via email
- Tracks sent status

### 4. Receive & Parse Vendor Responses
- Vendors reply to RFP emails
- Click "Fetch Responses" to retrieve emails via IMAP
- AI automatically parses responses into structured data
- Extracts: pricing, delivery terms, warranty, conditions

### 5. Compare Proposals with AI
- View side-by-side comparison of all proposals
- AI generates scores (0-10) for each proposal
- AI provides recommendation with detailed reasoning
- Visual indicators for best proposal

## API Endpoints

### RFPs
- `POST /api/rfps` - Create RFP from natural language
- `GET /api/rfps` - List all RFPs
- `GET /api/rfps/:id` - Get RFP details
- `PATCH /api/rfps/:id/status` - Update RFP status
- `DELETE /api/rfps/:id` - Delete RFP

### Vendors
- `POST /api/vendors` - Create vendor
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/:id` - Get vendor details
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

### Proposals
- `GET /api/proposals/:rfpId` - Get proposals for RFP
- `GET /api/proposals/:rfpId/compare` - AI-powered comparison
- `POST /api/proposals` - Create proposal manually

### Email
- `POST /api/email/send-rfp` - Send RFP to vendors
- `POST /api/email/fetch-responses` - Fetch vendor responses

## Tech Stack

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL
- **AI**: OpenAI GPT-4o-mini
- **Email**: Nodemailer (SMTP) + IMAP
- **Validation**: express-validator

### Frontend
- **Framework**: React 18 with Vite
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v7
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## Database Schema

### rfps
- id, title, description, budget, delivery_deadline
- payment_terms, warranty_period, items (JSONB)
- raw_input, status, created_at, updated_at

### vendors
- id, name, email, phone, company
- address, notes, created_at, updated_at

### proposals
- id, rfp_id, vendor_id, total_price
- delivery_timeline, payment_terms, warranty_period
- items (JSONB), additional_terms, raw_response
- ai_score, ai_summary, created_at, updated_at

### rfp_vendors (junction table)
- id, rfp_id, vendor_id, sent_at, status

## Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# Start PostgreSQL (macOS with Postgres.app)
# Just open Postgres.app

# Test connection
psql -d rfp_management
```

### Email Not Sending
- Verify Gmail App Password is correct (16 characters, no spaces)
- Ensure 2-Step Verification is enabled on Google Account
- Check GMAIL_USER and GMAIL_APP_PASSWORD in .env

### Frontend Not Connecting to Backend
- Ensure backend is running on port 5000
- Check VITE_API_URL in frontend/.env
- Check browser console for CORS errors

### Node Version Issues
```bash
# Use nvm to switch to Node 20 or 22
nvm use 22
# or
nvm use 20
```

## Development Workflow

1. **Create RFP**: Use natural language → AI generates structure
2. **Add Vendors**: Maintain vendor database
3. **Send RFP**: Select vendors → Email sent automatically
4. **Vendor Responds**: Vendor replies to email
5. **Fetch Responses**: System retrieves and parses with AI
6. **Compare**: View AI-powered comparison and recommendation
7. **Decision**: Select winning vendor

## Future Enhancements

- User authentication & multi-tenancy
- Real-time notifications
- Email tracking (opens, clicks)
- PDF export of RFPs and proposals
- Advanced analytics dashboard
- Approval workflows
- Version control for RFPs
- Contract management

## License

MIT

## Support

For issues or questions, please check the code comments or raise an issue in the repository.
