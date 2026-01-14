-- Clear existing data
TRUNCATE TABLE proposals, rfp_vendors, vendors, rfps CASCADE;

-- Insert sample vendors
INSERT INTO vendors (name, email, phone, company, address, notes) VALUES
('John Smith', 'john.smith@techvendor.com', '+1-555-0101', 'TechVendor Inc', '123 Tech Street, San Francisco, CA 94102', 'Specializes in office equipment'),
('Sarah Johnson', 'sarah.j@officesupply.com', '+1-555-0102', 'Office Supply Co', '456 Business Ave, New York, NY 10001', 'Large inventory, fast delivery'),
('Michael Chen', 'mchen@qualitygoods.com', '+1-555-0103', 'Quality Goods Ltd', '789 Commerce Blvd, Austin, TX 78701', 'Premium products, competitive pricing'),
('Emily Davis', 'emily@gadgetworld.com', '+1-555-0104', 'Gadget World', '321 Innovation Dr, Seattle, WA 98101', 'Latest technology products'),
('Robert Williams', 'rwilliams@supplyhub.com', '+1-555-0105', 'Supply Hub', '654 Market St, Boston, MA 02101', 'Bulk orders specialist');

-- Insert sample RFPs
INSERT INTO rfps (title, description, budget, delivery_deadline, payment_terms, warranty_period, items, raw_input, status) VALUES
(
    'Office Equipment Supply Request',
    'We need to procure office equipment for our new branch office including laptops, desks, chairs, and accessories.',
    50000.00,
    '2026-02-28',
    'Net 30',
    '12 months',
    '[
        {"item": "Dell Latitude Laptops", "quantity": 10, "specifications": "i7, 16GB RAM, 512GB SSD"},
        {"item": "Ergonomic Office Chairs", "quantity": 15, "specifications": "Adjustable height, lumbar support"},
        {"item": "Standing Desks", "quantity": 10, "specifications": "Electric, height adjustable, 60x30 inches"},
        {"item": "Wireless Keyboards", "quantity": 10, "specifications": "Bluetooth, rechargeable"},
        {"item": "Wireless Mice", "quantity": 10, "specifications": "Ergonomic design, USB receiver"}
    ]'::jsonb,
    'We need 10 laptops (Dell Latitude, i7, 16GB RAM, 512GB SSD), 15 ergonomic office chairs with lumbar support, 10 electric standing desks (60x30), 10 wireless keyboards, and 10 wireless mice. Budget: $50,000. Delivery by Feb 28, 2026. Payment terms: Net 30. Warranty: 12 months.',
    'draft'
),
(
    'IT Infrastructure Upgrade',
    'Looking for vendors to supply networking equipment and server hardware for data center upgrade.',
    150000.00,
    '2026-03-15',
    'Net 45',
    '24 months',
    '[
        {"item": "Network Switches", "quantity": 5, "specifications": "24-port Gigabit, managed, PoE+"},
        {"item": "Server Racks", "quantity": 3, "specifications": "42U, with cooling fans"},
        {"item": "Dell PowerEdge Servers", "quantity": 4, "specifications": "Dual Xeon, 128GB RAM, 2TB SSD"},
        {"item": "UPS Systems", "quantity": 2, "specifications": "3000VA, rack-mountable"},
        {"item": "Cat6 Ethernet Cables", "quantity": 100, "specifications": "6ft length, certified"}
    ]'::jsonb,
    'IT infrastructure upgrade needed: 5 managed 24-port Gigabit switches with PoE+, 3 server racks (42U), 4 Dell PowerEdge servers (dual Xeon, 128GB RAM, 2TB SSD), 2 UPS systems (3000VA, rack-mount), 100 Cat6 cables (6ft). Budget: $150,000. Delivery: March 15, 2026. Payment: Net 45. Warranty: 24 months.',
    'draft'
),
(
    'Conference Room Supplies',
    'Need to equip 3 conference rooms with presentation equipment and furniture.',
    30000.00,
    '2026-02-15',
    'Net 30',
    '12 months',
    '[
        {"item": "4K Projectors", "quantity": 3, "specifications": "4000 lumens, HDMI, wireless"},
        {"item": "Projection Screens", "quantity": 3, "specifications": "120 inch, motorized, white"},
        {"item": "Conference Tables", "quantity": 3, "specifications": "12-person capacity, oval shape"},
        {"item": "Conference Chairs", "quantity": 36, "specifications": "Executive style, padded"},
        {"item": "Wireless Presenters", "quantity": 5, "specifications": "USB receiver, laser pointer"}
    ]'::jsonb,
    'Equipping 3 conference rooms: 3 4K projectors (4000 lumens, wireless), 3 motorized screens (120 inch), 3 oval conference tables (12-person), 36 executive chairs (padded), 5 wireless presenters with laser pointer. Budget: $30,000. Delivery: Feb 15, 2026. Payment: Net 30. Warranty: 12 months.',
    'draft'
);

-- Show inserted data count
SELECT 'Vendors inserted: ' || COUNT(*) as result FROM vendors
UNION ALL
SELECT 'RFPs inserted: ' || COUNT(*) FROM rfps;
