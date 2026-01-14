#!/bin/bash

echo "================================================"
echo "  RFP Management System - Quick Start"
echo "================================================"
echo ""

# Check if database exists
echo "Checking database..."
if psql -lqt | cut -d \| -f 1 | grep -qw rfp_management; then
    echo "✅ Database 'rfp_management' exists"
else
    echo "📦 Creating database 'rfp_management'..."
    createdb rfp_management
    echo "✅ Database created"
fi

# Run migrations
echo ""
echo "Running database migrations..."
cd backend
npm run migrate
cd ..

echo ""
echo "================================================"
echo "  Setup Instructions"
echo "================================================"
echo ""
echo "1. Configure backend/.env with your credentials:"
echo "   - PostgreSQL password"
echo "   - OpenAI API key"
echo "   - Gmail credentials (App Password)"
echo ""
echo "2. Start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "3. Start the frontend (in a new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "================================================"
echo "  For detailed setup, see SETUP.md"
echo "================================================"
