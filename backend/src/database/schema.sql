-- RFPs Table
CREATE TABLE IF NOT EXISTS rfps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(12, 2),
    delivery_deadline DATE,
    payment_terms VARCHAR(100),
    warranty_period VARCHAR(100),
    items JSONB NOT NULL,
    raw_input TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    company VARCHAR(255),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RFP-Vendor Mapping (which vendors received which RFP)
CREATE TABLE IF NOT EXISTS rfp_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfp_id UUID REFERENCES rfps(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    sent_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rfp_id, vendor_id)
);

-- Proposals Table (vendor responses to RFPs)
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfp_id UUID REFERENCES rfps(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    total_price DECIMAL(12, 2),
    delivery_timeline VARCHAR(100),
    payment_terms VARCHAR(100),
    warranty_period VARCHAR(100),
    items JSONB,
    additional_terms TEXT,
    raw_response TEXT,
    email_subject VARCHAR(500),
    email_body TEXT,
    received_at TIMESTAMP,
    parsed_at TIMESTAMP,
    ai_score DECIMAL(5, 2),
    ai_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rfp_id, vendor_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rfps_status ON rfps(status);
CREATE INDEX IF NOT EXISTS idx_rfps_created_at ON rfps(created_at);
CREATE INDEX IF NOT EXISTS idx_proposals_rfp_id ON proposals(rfp_id);
CREATE INDEX IF NOT EXISTS idx_proposals_vendor_id ON proposals(vendor_id);
CREATE INDEX IF NOT EXISTS idx_rfp_vendors_rfp_id ON rfp_vendors(rfp_id);
CREATE INDEX IF NOT EXISTS idx_rfp_vendors_vendor_id ON rfp_vendors(vendor_id);
