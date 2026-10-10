import { sql } from '@vercel/postgres';
import { json, method, body, securityHeaders } from '../../http.js';
import { requireUser, csrfOk } from '../../auth.js';
export default async function handler(req,res) {
 securityHeaders(res); if(!method(req,res,['GET','POST','DELETE'])) return;
 const u=await requireUser(req,res); if(!u) return;
 if(req.method==='GET') { const r=await sql`SELECT p.id,p.public_id,p.title,p.property_type,p.room_type,p.monthly_rent,p.public_area,p.image_url FROM saved_properties s JOIN properties p ON p.id=s.property_id WHERE s.user_id=${u.id} AND p.status='published' ORDER BY s.created_at DESC`; return json(res,200,{properties:r.rows}); }
 if(!csrfOk(req)) return json(res,403,{error:'Request origin could not be verified.'});
 const b=await body(req); const id=Number(b.propertyId || req.query.propertyId); if(!Number.isInteger(id)||id<1) return json(res,400,{error:'Valid propertyId required.'});
 if(req.method==='POST') { await sql`INSERT INTO saved_properties(user_id,property_id) SELECT ${u.id},id FROM properties WHERE id=${id} AND status='published' ON CONFLICT DO NOTHING`; return json(res,200,{ok:true}); }
 await sql`DELETE FROM saved_properties WHERE user_id=${u.id} AND property_id=${id}`; return json(res,200,{ok:true});
}
