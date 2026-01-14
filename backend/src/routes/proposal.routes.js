import express from 'express';
import pool from '../config/database.js';
import { compareProposals } from '../services/ai.service.js';

const router = express.Router();

// Get all proposals for an RFP
router.get('/:rfpId', async (req, res) => {
  try {
    const { rfpId } = req.params;

    const query = `
      SELECT p.*, v.name as vendor_name, v.email as vendor_email
      FROM proposals p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE p.rfp_id = $1
      ORDER BY p.created_at DESC
    `;

    const result = await pool.query(query, [rfpId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

// Get AI-powered comparison of proposals for an RFP
router.get('/:rfpId/compare', async (req, res) => {
  try {
    const { rfpId } = req.params;

    // Get RFP data
    const rfpResult = await pool.query('SELECT * FROM rfps WHERE id = $1', [rfpId]);
    if (rfpResult.rows.length === 0) {
      return res.status(404).json({ error: 'RFP not found' });
    }
    const rfpData = rfpResult.rows[0];

    // Get all proposals
    const proposalsQuery = `
      SELECT p.*, v.name as vendor_name, v.email as vendor_email
      FROM proposals p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE p.rfp_id = $1
    `;
    const proposalsResult = await pool.query(proposalsQuery, [rfpId]);

    if (proposalsResult.rows.length === 0) {
      return res.status(404).json({ error: 'No proposals found for this RFP' });
    }

    // Use AI to compare
    const comparison = await compareProposals(rfpData, proposalsResult.rows);

    // Update proposal scores in database
    for (const score of comparison.proposal_scores) {
      await pool.query(
        'UPDATE proposals SET ai_score = $1, ai_summary = $2 WHERE id = $3',
        [score.score, score.summary, score.proposal_id]
      );
    }

    res.json({
      rfp: rfpData,
      proposals: proposalsResult.rows,
      comparison: comparison,
    });
  } catch (error) {
    console.error('Error comparing proposals:', error);
    res.status(500).json({ error: 'Failed to compare proposals', message: error.message });
  }
});

// Create proposal manually (for testing)
router.post('/', async (req, res) => {
  try {
    const {
      rfp_id,
      vendor_id,
      total_price,
      delivery_timeline,
      payment_terms,
      warranty_period,
      items,
      additional_terms,
      raw_response,
    } = req.body;

    if (!rfp_id || !vendor_id) {
      return res.status(400).json({ error: 'rfp_id and vendor_id are required' });
    }

    const query = `
      INSERT INTO proposals (
        rfp_id, vendor_id, total_price, delivery_timeline, payment_terms,
        warranty_period, items, additional_terms, raw_response, received_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      rfp_id,
      vendor_id,
      total_price,
      delivery_timeline,
      payment_terms,
      warranty_period,
      JSON.stringify(items),
      additional_terms,
      raw_response,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Proposal created successfully',
      proposal: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Proposal from this vendor for this RFP already exists' });
    }
    res.status(500).json({ error: 'Failed to create proposal' });
  }
});

export default router;
