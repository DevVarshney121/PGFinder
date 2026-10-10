import { sql } from '@vercel/postgres';
import { json, method, securityHeaders } from '../../http.js';
import { requireUser } from '../../auth.js';
export default async function handler(req,res) { securityHeaders(res); if(!method(req,res,['GET'])) return; const u=await requireUser(req,res,true); if(!u)return; const r=await sql`SELECT id,name,email,phone,role,status,created_at FROM users ORDER BY created_at DESC LIMIT 300`; json(res,200,{users:r.rows}); }
