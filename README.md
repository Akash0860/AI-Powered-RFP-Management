# AI-Powered RFP Management System

An intelligent procurement platform that streamlines the entire RFP (Request for Proposal) workflow using AI.

## Features

- **AI-Powered RFP Creation**: Describe procurement needs in natural language, AI converts to structured RFP
- **Vendor Management**: Maintain vendor database and select recipients for RFPs
- **Automated Email Distribution**: Send RFPs to vendors via email
- **Smart Response Processing**: AI automatically parses vendor responses from emails
- **Intelligent Comparison**: AI-powered proposal comparison and vendor recommendations

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **AI Provider**: Gemini (gemini-2.5-flash)
- **Email**: Gmail SMTP + IMAP (Nodemailer)

## Project Structure

```
aerchain-rfp-system/
├── frontend/          # React frontend application
├── backend/           # Express backend API
├── database/          # Database schema and migrations
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Gmail account with App Password enabled
- Gemini API key

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd aerchain-rfp-system
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb rfp_management

# Run migrations (from backend directory)
cd backend
npm run migrate
```

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 5. Environment Variables

See `.env.example` files in both frontend and backend directories for required configuration.

## Usage

1. **Create RFP**: Describe your procurement needs in natural language
2. **Add Vendors**: Maintain vendor contact information
3. **Send RFP**: Select vendors and send RFP via email
4. **Receive Responses**: Vendors reply to emails, system automatically parses responses
5. **Compare Proposals**: View AI-powered comparison and recommendations

## Development

```bash
# Backend development server
cd backend && npm run dev

# Frontend development server
cd frontend && npm run dev
```

## Documentation

For a comprehensive technical analysis including architecture decisions, 
AI integration strategy, and design rationale, see [TECHNICAL_ANALYSIS.md](TECHNICAL_ANALYSIS.md).

## API Documentation

API endpoints are available at `http://localhost:5000/api`

- `POST /api/rfps` - Create new RFP
- `GET /api/rfps` - List all RFPs
- `GET /api/rfps/:id` - Get RFP details
- `POST /api/vendors` - Add vendor
- `GET /api/vendors` - List vendors
- `POST /api/rfps/:id/send` - Send RFP to vendors
- `GET /api/proposals/:rfpId` - Get proposals for an RFP
- `GET /api/proposals/:rfpId/compare` - Get AI comparison

## License

MIT
