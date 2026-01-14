import express from 'express';
import pool from '../config/database.js';
import { parseRFPFromNaturalLanguage } from '../services/ai.service.js';

const router = express.Router();

// Create RFP from natural language
router.post('/', async (req, res) => {
  try {
    const { naturalLanguageInput } = req.body;

    if (!naturalLanguageInput) {
      return res.status(400).json({ error: 'naturalLanguageInput is required' });
    }

    // Use AI to parse the input
    const parsedRFP = await parseRFPFromNaturalLanguage(naturalLanguageInput);

    // Save to database
    const query = `
      INSERT INTO rfps (title, description, budget, delivery_deadline, payment_terms, warranty_period, items, raw_input, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      parsedRFP.title,
      parsedRFP.description,
      parsedRFP.budget,
      parsedRFP.delivery_deadline,
      parsedRFP.payment_terms,
      parsedRFP.warranty_period,
      JSON.stringify(parsedRFP.items),
      naturalLanguageInput,
      'draft',
    ];

    const result = await pool.query(query, values);
    
    res.status(201).json({
      message: 'RFP created successfully',
      rfp: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating RFP:', error);
    res.status(500).json({ error: 'Failed to create RFP', message: error.message });
  }
});

// Get all RFPs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM rfps ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching RFPs:', error);
    res.status(500).json({ error: 'Failed to fetch RFPs' });
  }
});

// Get single RFP
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM rfps WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching RFP:', error);
    res.status(500).json({ error: 'Failed to fetch RFP' });
  }
});

// Update RFP status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE rfps SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating RFP:', error);
    res.status(500).json({ error: 'Failed to update RFP' });
  }
});

// Delete RFP
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM rfps WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    res.json({ message: 'RFP deleted successfully' });
  } catch (error) {
    console.error('Error deleting RFP:', error);
    res.status(500).json({ error: 'Failed to delete RFP' });
  }
});

export default router;
