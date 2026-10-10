import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import bcrypt from 'bcryptjs';
import { sql } from '@vercel/postgres';
const rl = createInterface({ input, output });
try {
  const name = (await rl.question('Admin name: ')).trim();
  const email = (await rl.question('Admin email: ')).trim().toLowerCase();
  const password = await rl.question('Admin password (12+ characters): ');
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12) {
    throw new Error('Provide a name, valid email, and password of at least 12 characters.');
  }
  const hash = await bcrypt.hash(password, 12);
  await sql`INSERT INTO users (name,email,password_hash,role) VALUES (${name},${email},${hash},'admin')
    ON CONFLICT (email) DO UPDATE SET role='admin', password_hash=${hash}, updated_at=NOW()`;
  console.log(`Administrator account configured for ${email}. Keep the password private.`);
} finally { rl.close(); }
