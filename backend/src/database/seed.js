import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Read the seed SQL file
    const seedSQL = fs.readFileSync(
      path.join(__dirname, 'seed.sql'),
      'utf8'
    );

    // Execute the seed SQL
    await pool.query(seedSQL);

    // Get counts
    const vendorCount = await pool.query('SELECT COUNT(*) FROM vendors');
    const rfpCount = await pool.query('SELECT COUNT(*) FROM rfps');

    console.log('\n✅ Database seeded successfully!');
    console.log(`📊 Vendors inserted: ${vendorCount.rows[0].count}`);
    console.log(`📋 RFPs inserted: ${rfpCount.rows[0].count}`);

    // Display sample data
    console.log('\n📧 Sample Vendor Emails:');
    const vendors = await pool.query('SELECT id, name, email FROM vendors LIMIT 3');
    vendors.rows.forEach(v => {
      console.log(`  - ${v.name}: ${v.email} (ID: ${v.id})`);
    });

    console.log('\n📝 Sample RFPs:');
    const rfps = await pool.query('SELECT id, title, budget FROM rfps');
    rfps.rows.forEach(r => {
      console.log(`  - ${r.title}: $${r.budget} (ID: ${r.id})`);
    });

    console.log('\n✨ You can now test the email service with these IDs!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error(error.stack);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seedDatabase();
