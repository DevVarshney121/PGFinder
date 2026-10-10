import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { json, method, body, securityHeaders } from '../../http.js';
import { getUser, csrfOk } from '../../auth.js';
import { limited } from '../../rate-limit.js';
const schema=z.object({propertyId:z.coerce.number().int().positive().optional(),name:z.string().trim().min(2).max(120),phone:z.string().trim().min(7).max(30),email:z.string().email().max(255).optional().or(z.literal('')),moveDate:z.string().optional(),message:z.string().trim().max(1500).optional().default('')});
export default async function handler(req,res) {
 securityHeaders(res); if(!method(req,res,['GET','POST'])) return;
 if(req.method==='POST') {
  if(!csrfOk(req)) return json(res,403,{error:'Request origin could not be verified.'});
  if(limited(req,'enquiry',8)) return json(res,429,{error:'Too many enquiries. Try again later.'});
  const p=schema.safeParse(await body(req)); if(!p.success) return json(res,400,{error:'Please check the required fields.'});
  try {
   const u=await getUser(req), d=p.data;
   if(d.propertyId) { const exists=await sql`SELECT id FROM properties WHERE id=${d.propertyId} AND status='published'`; if(!exists.rows.length) return json(res,404,{error:'Property not found.'}); }
   const r=await sql`INSERT INTO enquiries(user_id,property_id,name,phone,email,preferred_move_date,message) VALUES(${u?.id||null},${d.propertyId||null},${d.name},${d.phone},${d.email||null},${d.moveDate||null},${d.message}) RETURNING id`;
   return json(res,201,{ok:true,id:r.rows[0].id,message:'Enquiry received. You can also continue in WhatsApp.'});
  } catch(e) { console.error(e); return json(res,500,{error:'Enquiry could not be saved.'}); }
 }
 const u=await getUser(req); if(!u) return json(res,401,{error:'Log in to view your enquiries.'});
 const r=await sql`SELECT e.id,e.name,e.phone,e.message,e.status,e.created_at,p.public_id,p.title,p.public_area FROM enquiries e LEFT JOIN properties p ON p.id=e.property_id WHERE e.user_id=${u.id} ORDER BY e.created_at DESC LIMIT 100`;
 json(res,200,{enquiries:r.rows});
}
