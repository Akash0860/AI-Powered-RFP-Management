import nodemailer from 'nodemailer';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';

dotenv.config();

// Create SMTP transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Send RFP email to vendor
export async function sendRFPEmail(vendorEmail, vendorName, rfpData) {
  const emailContent = `
Dear ${vendorName},

We are pleased to invite you to submit a proposal for the following procurement request:

Title: ${rfpData.title}

Description:
${rfpData.description}

Requirements:
${rfpData.items.map((item, idx) => `${idx + 1}. ${item.name} - Quantity: ${item.quantity} - Specifications: ${item.specifications}`).join('\n')}

Budget: $${rfpData.budget || 'Not specified'}
Delivery Deadline: ${rfpData.delivery_deadline || 'Not specified'}
Payment Terms: ${rfpData.payment_terms || 'Not specified'}
Warranty: ${rfpData.warranty_period || 'Not specified'}

Please reply to this email with your proposal including:
- Item-by-item pricing
- Total price
- Delivery timeline
- Payment terms
- Warranty details
- Any additional terms or conditions

We look forward to your response.

Best regards,
Procurement Team
  `.trim();

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: vendorEmail,
    subject: `RFP: ${rfpData.title}`,
    text: emailContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

// Fetch emails from IMAP
export async function fetchVendorResponses(rfpTitle) {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASSWORD,
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: parseInt(process.env.IMAP_PORT) || 993,
      tls: process.env.IMAP_TLS === 'true',
      tlsOptions: { rejectUnauthorized: false },
    });

    const emails = [];

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        // Search for emails with RFP in subject
        const searchCriteria = [['SUBJECT', rfpTitle]];
        
        imap.search(searchCriteria, (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (results.length === 0) {
            imap.end();
            resolve([]);
            return;
          }

          const fetch = imap.fetch(results, { bodies: '' });

          fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, (err, parsed) => {
                if (err) {
                  console.error('Error parsing email:', err);
                  return;
                }

                emails.push({
                  from: parsed.from.value[0].address,
                  subject: parsed.subject,
                  text: parsed.text,
                  html: parsed.html,
                  date: parsed.date,
                });
              });
            });
          });

          fetch.once('error', (err) => {
            reject(err);
          });

          fetch.once('end', () => {
            imap.end();
          });
        });
      });
    });

    imap.once('error', (err) => {
      reject(err);
    });

    imap.once('end', () => {
      resolve(emails);
    });

    imap.connect();
  });
}
