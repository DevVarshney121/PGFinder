import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { json, method, body, securityHeaders } from '../../lib/http.js';
import { createSession } from '../../lib/auth.js';
import { limited } from '../../lib/rate-limit.js';
export default async function handler(req,res) {
 securityHeaders(res); if(!method(req,res,['POST'])) return;
 if(limited(req,'login',8)) return json(res,429,{error:'Too many attempts. Please wait and try again.'});
 const b=await body(req), p=z.object({email:z.string().email().max(255),password:z.string().min(1).max(128)}).safeParse(b);
 if(!p.success) return json(res,400,{error:'Enter a valid email and password.'});
 const r=await sql`SELECT id,name,email,phone,password_hash,role,status FROM users WHERE email=${p.data.email.toLowerCase()}`;
 const u=r.rows[0]; if(!u || u.status!=='active' || !(await bcrypt.compare(p.data.password,u.password_hash))) return json(res,401,{error:'Email or password is incorrect.'});
 await createSession(res,u); delete u.password_hash; return json(res,200,{user:u});
}
