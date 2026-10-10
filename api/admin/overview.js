import { sql } from '@vercel/postgres';
import { json, method, securityHeaders } from '../../lib/http.js';
import { requireUser } from '../../lib/auth.js';
export default async function handler(req,res) {
 securityHeaders(res); if(!method(req,res,['GET'])) return;
 const u=await requireUser(req,res,true); if(!u) return;
 try {
  const [p,e,users]=await Promise.all([
   sql`SELECT COUNT(*)::int total, COUNT(*) FILTER(WHERE status='published')::int published, COUNT(*) FILTER(WHERE status='draft')::int drafts, COUNT(*) FILTER(WHERE property_type='pg')::int pgs, COUNT(*) FILTER(WHERE property_type='hostel')::int hostels, COUNT(*) FILTER(WHERE property_type='flat')::int flats FROM properties`,
   sql`SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE status='new')::int new,COUNT(*) FILTER(WHERE status='contacted')::int contacted,COUNT(*) FILTER(WHERE status='closed')::int closed FROM enquiries`,
   sql`SELECT COUNT(*)::int total FROM users`
  ]);
  json(res,200,{properties:p.rows[0],enquiries:e.rows[0],users:users.rows[0].total});
 } catch(err) { console.error(err); json(res,500,{error:'Dashboard could not load.'}); }
}
