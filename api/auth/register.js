import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { json, method, body, securityHeaders } from '../../lib/http.js';
import { createSession } from '../../lib/auth.js';
import { limited } from '../../lib/rate-limit.js';
const schema=z.object({name:z.string().trim().min(2).max(120),email:z.string().trim().email().max(255),phone:z.string().trim().max(30).optional().default(''),password:z.string().min(10).max(128)});
export default async function handler(req,res) {
 securityHeaders(res); if(!method(req,res,['POST'])) return;
 if(limited(req,'register',5)) return json(res,429,{error:'Too many attempts. Please try again later.'});
 const parsed=schema.safeParse(await body(req)); if(!parsed.success) return json(res,400,{error:'Check your name, email, phone, and password (minimum 10 characters).'});
 const {name,email,phone,password}=parsed.data, hash=await bcrypt.hash(password,12);
 try { const r=await sql`INSERT INTO users(name,email,phone,password_hash) VALUES(${name},${email.toLowerCase()},${phone},${hash}) RETURNING id,name,email,phone,role`;
 await createSession(res,r.rows[0]); return json(res,201,{user:r.rows[0]}); }
 catch(e) { if(e.code==='23505') return json(res,409,{error:'An account with this email already exists.'}); console.error(e); return json(res,500,{error:'Could not create account.'}); }
}
