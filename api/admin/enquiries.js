import { sql } from '@vercel/postgres';
import { json, method, body, securityHeaders } from '../../lib/http.js';
import { requireUser, csrfOk } from '../../lib/auth.js';
export default async function handler(req,res) {
 securityHeaders(res); if(!method(req,res,['GET','PATCH'])) return;
 const u=await requireUser(req,res,true); if(!u) return;
 try {
  if(req.method==='GET') { const r=await sql`SELECT e.id,e.name,e.phone,e.email,e.message,e.status,e.created_at,p.title,p.public_id,p.public_area FROM enquiries e LEFT JOIN properties p ON p.id=e.property_id ORDER BY e.created_at DESC LIMIT 250`; return json(res,200,{enquiries:r.rows}); }
  if(!csrfOk(req)) return json(res,403,{error:'Request origin could not be verified.'});
  const b=await body(req), id=Number(b.id), status=String(b.status);
  if(!id||!['new','contacted','closed','not_interested'].includes(status)) return json(res,400,{error:'Valid id and status required.'});
  await sql`UPDATE enquiries SET status=${status},updated_at=NOW() WHERE id=${id}`; json(res,200,{ok:true});
 } catch(e) { console.error(e); json(res,500,{error:'Enquiry operation failed.'}); }
}
