import Imap from 'imap';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
import pool from '../config/database.js';
import { parseVendorResponseGemini } from './ai.service.js';

dotenv.config();

class EmailWatcher {
  constructor() {
    this.imap = null;
    this.isWatching = false;
  }

  start() {
    if (this.isWatching) {
      console.log('⚠️  Email watcher already running');
      return;
    }

    this.imap = new Imap({
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASSWORD,
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: parseInt(process.env.IMAP_PORT) || 993,
      tls: process.env.IMAP_TLS === 'true',
      tlsOptions: { rejectUnauthorized: false },
    });

    this.imap.once('ready', () => {
      console.log('✓ Email watcher connected to IMAP');
      this.isWatching = true;
      this.openInbox();
    });

    this.imap.once('error', (err) => {
      console.error('✗ IMAP connection error:', err.message);
      this.isWatching = false;
      // Reconnect after 60 seconds
      console.log('Reconnecting in 60 seconds...');
      setTimeout(() => this.start(), 60000);
    });

    this.imap.once('end', () => {
      console.log('IMAP connection ended');
      this.isWatching = false;
      // Reconnect after 10 seconds
      console.log('Reconnecting in 10 seconds...');
      setTimeout(() => this.start(), 10000);
    });

    this.imap.connect();
  }

  openInbox() {
    this.imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        console.error('Error opening inbox:', err);
        return;
      }

      console.log('✓ Inbox opened, watching for new emails...');
      console.log(`  Current messages: ${box.messages.total}`);

      // Listen for new emails
      this.imap.on('mail', (numNewMsgs) => {
        console.log(`\n📧 ${numNewMsgs} new email(s) received!`);
        this.fetchLatestEmails();
      });
    });
  }

  async fetchLatestEmails() {
    try {
      // QUICK FILTERING: Search for recent unread emails with "RFP" in subject
      const searchCriteria = ['UNSEEN', ['SUBJECT', 'RFP']];

      this.imap.search(searchCriteria, async (err, results) => {
        if (err) {
          console.error('Search error:', err);
          return;
        }

        if (results.length === 0) {
          console.log('No new RFP-related emails found (filtered out)');
          return;
        }

        console.log(`Found ${results.length} new RFP email(s), processing...`);

        const fetch = this.imap.fetch(results, { bodies: '', markSeen: false });

        fetch.on('message', (msg) => {
          msg.on('body', (stream) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) {
                console.error('Error parsing email:', err);
                return;
              }

              try {
                await this.processVendorEmail(parsed);
              } catch (error) {
                console.error('Error processing vendor email:', error);
              }
            });
          });
        });

        fetch.once('error', (err) => {
          console.error('Fetch error:', err);
        });

        fetch.once('end', () => {
          console.log('✓ Finished processing new emails\n');
        });
      });
    } catch (error) {
      console.error('Error fetching latest emails:', error);
    }
  }

  async processVendorEmail(parsed) {
    const from = parsed.from.value[0].address;
    const subject = parsed.subject;
    const text = parsed.text;
    const date = parsed.date;

    console.log(`\n📨 Processing email from: ${from}`);
    console.log(`   Subject: ${subject}`);

    // VALIDATION 1: Check if email is a reply
    if (!subject.toLowerCase().startsWith('re:')) {
      console.log('   ⚠️  Email is not a reply, skipping\n');
      return;
    }

    // VALIDATION 2: RFP Title Match - Extract RFP title from subject
    const rfpTitleMatch = subject.match(/RFP:\s*(.+)/i);
    if (!rfpTitleMatch) {
      console.log('   ⚠️  Email does not match RFP pattern (missing "RFP: Title"), skipping\n');
      return;
    }

    const rfpTitle = rfpTitleMatch[1].trim();
    console.log(`   ✓ RFP Title extracted: "${rfpTitle}"`);

    // VALIDATION 3: Check for proposal keywords
    const hasProposalKeywords = /price|pricing|cost|quote|proposal|total/i.test(text);
    if (!hasProposalKeywords) {
      console.log(`   ⚠️  Email doesn't contain proposal keywords, skipping\n`);
      return;
    }
    console.log('   ✓ Proposal keywords found');

    // Find RFP by title
    const rfpResult = await pool.query(
      'SELECT * FROM rfps WHERE title ILIKE $1 LIMIT 1',
      [`%${rfpTitle}%`]
    );

    if (rfpResult.rows.length === 0) {
      console.log(`   ⚠️  No RFP found matching title: "${rfpTitle}"\n`);
      return;
    }

    const rfpData = rfpResult.rows[0];
    console.log(`   ✓ Found RFP: ${rfpData.id}`);

    // Find vendor by email
    const vendorResult = await pool.query(
      'SELECT * FROM vendors WHERE email = $1',
      [from]
    );

    if (vendorResult.rows.length === 0) {
      console.log(`   ⚠️  Vendor not found for email: ${from}\n`);
      return;
    }

    const vendor = vendorResult.rows[0];
    console.log(`   ✓ Found vendor: ${vendor.name}`);

    // Parse response with AI
    console.log('   🤖 Parsing proposal with AI...');
    const parsedProposal = await parseVendorResponseGemini(text, rfpData);

    // Check if proposal already exists
    const existingProposal = await pool.query(
      'SELECT id FROM proposals WHERE rfp_id = $1 AND vendor_id = $2',
      [rfpData.id, vendor.id]
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
          subject,
          text,
          text,
          date,
          existingProposal.rows[0].id,
        ]
      );
      console.log(`   ✓ Updated existing proposal: ${existingProposal.rows[0].id}`);
    } else {
      // Create new proposal
      const result = await pool.query(
        `INSERT INTO proposals (
          rfp_id, vendor_id, total_price, delivery_timeline, payment_terms,
          warranty_period, items, additional_terms, email_subject, email_body,
          raw_response, received_at, parsed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
        RETURNING id`,
        [
          rfpData.id,
          vendor.id,
          parsedProposal.total_price,
          parsedProposal.delivery_timeline,
          parsedProposal.payment_terms,
          parsedProposal.warranty_period,
          JSON.stringify(parsedProposal.items),
          parsedProposal.additional_terms,
          subject,
          text,
          text,
          date,
        ]
      );
      console.log(`   ✓ Created new proposal: ${result.rows[0].id}`);
    }

    console.log(`   💾 Proposal saved successfully!\n`);
  }

  stop() {
    if (this.imap) {
      this.imap.end();
      this.isWatching = false;
      console.log('Email watcher stopped');
    }
  }
}

// Create singleton instance
const emailWatcher = new EmailWatcher();

export default emailWatcher;
