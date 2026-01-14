import express from 'express';
import pool from '../config/database.js';
import { sendRFPEmail, fetchVendorResponses } from '../services/email.service.js';
import { parseVendorResponse } from '../services/ai.service.js';

const router = express.Router();

// Send RFP to selected vendors
router.post('/send-rfp', async (req, res) => {
  try {
    const { rfpId, vendorIds } = req.body;

    if (!rfpId || !vendorIds || vendorIds.length === 0) {
      return res.status(400).json({ error: 'rfpId and vendorIds are required' });
    }

    // Get RFP data
    const rfpResult = await pool.query('SELECT * FROM rfps WHERE id = $1', [rfpId]);
    if (rfpResult.rows.length === 0) {
      return res.status(404).json({ error: 'RFP not found' });
    }
    const rfpData = rfpResult.rows[0];

    // Get vendor details
    const vendorsResult = await pool.query(
      'SELECT * FROM vendors WHERE id = ANY($1)',
      [vendorIds]
    );

    const results = [];

    // Send email to each vendor
    for (const vendor of vendorsResult.rows) {
      try {
        await sendRFPEmail(vendor.email, vendor.name, rfpData);

        // Record in rfp_vendors table
        await pool.query(
          `INSERT INTO rfp_vendors (rfp_id, vendor_id, sent_at, status)
           VALUES ($1, $2, CURRENT_TIMESTAMP, 'sent')
           ON CONFLICT (rfp_id, vendor_id) 
           DO UPDATE SET sent_at = CURRENT_TIMESTAMP, status = 'sent'`,
          [rfpId, vendor.id]
        );

        results.push({ vendor: vendor.name, status: 'sent' });
      } catch (error) {
        console.error(`Error sending to ${vendor.name}:`, error);
        results.push({ vendor: vendor.name, status: 'failed', error: error.message });
      }
    }

    // Update RFP status to sent
    await pool.query(
      "UPDATE rfps SET status = 'sent', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [rfpId]
    );

    res.json({
      message: 'RFP sending completed',
      results,
    });
  } catch (error) {
    console.error('Error sending RFP:', error);
    res.status(500).json({ error: 'Failed to send RFP', message: error.message });
  }
});

// Fetch and process vendor responses
router.post('/fetch-responses', async (req, res) => {
  try {
    const { rfpId } = req.body;

    if (!rfpId) {
      return res.status(400).json({ error: 'rfpId is required' });
    }

    // Get RFP data
    const rfpResult = await pool.query('SELECT * FROM rfps WHERE id = $1', [rfpId]);
    if (rfpResult.rows.length === 0) {
      return res.status(404).json({ error: 'RFP not found' });
    }
    const rfpData = rfpResult.rows[0];

    // Fetch emails
    const emails = await fetchVendorResponses(rfpData.title);

    const processedResponses = [];

    for (const email of emails) {
      // Find vendor by email
      const vendorResult = await pool.query(
        'SELECT * FROM vendors WHERE email = $1',
        [email.from]
      );

      if (vendorResult.rows.length === 0) {
        console.log(`Vendor not found for email: ${email.from}`);
        continue;
      }

      const vendor = vendorResult.rows[0];

      // Parse response with AI
      const parsedProposal = await parseVendorResponse(email.text, rfpData);

      // Check if proposal already exists
      const existingProposal = await pool.query(
        'SELECT id FROM proposals WHERE rfp_id = $1 AND vendor_id = $2',
        [rfpId, vendor.id]
      );

      if (existingProposal.rows.length > 0) {
        // Update existing proposal
        await pool.query(
          `UPDATE proposals SET
            total_price = $1, delivery_timeline = $2, payment_terms = $3,
            warranty_period = $4, items = $5, additional_terms = $6,
            email_subject = $7, email_body = $8, raw_response = $9,
            received_at = $10, parsed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
           WHERE id = $11`,
          [
            parsedProposal.total_price,
            parsedProposal.delivery_timeline,
            parsedProposal.payment_terms,
            parsedProposal.warranty_period,
            JSON.stringify(parsedProposal.items),
            parsedProposal.additional_terms,
            email.subject,
            email.text,
            email.text,
            email.date,
            existingProposal.rows[0].id,
          ]
        );
      } else {
        // Create new proposal
        await pool.query(
          `INSERT INTO proposals (
            rfp_id, vendor_id, total_price, delivery_timeline, payment_terms,
            warranty_period, items, additional_terms, email_subject, email_body,
            raw_response, received_at, parsed_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)`,
          [
            rfpId,
            vendor.id,
            parsedProposal.total_price,
            parsedProposal.delivery_timeline,
            parsedProposal.payment_terms,
            parsedProposal.warranty_period,
            JSON.stringify(parsedProposal.items),
            parsedProposal.additional_terms,
            email.subject,
            email.text,
            email.text,
            email.date,
          ]
        );
      }

      processedResponses.push({
        vendor: vendor.name,
        email: email.from,
        parsed: parsedProposal,
      });
    }

    res.json({
      message: 'Vendor responses processed',
      count: processedResponses.length,
      responses: processedResponses,
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses', message: error.message });
  }
});

export default router;
