import { sql } from '@vercel/postgres';
import { json, method, securityHeaders } from '../../lib/http.js';
export default async function handler(req,res) {
 securityHeaders(res); if(!method(req,res,['GET'])) return;
 try {
  const id=String(req.query.id||'');
  const r=await sql`SELECT id,public_id,property_type,title,room_type,monthly_rent,security_deposit,gender_preference,food_included,furnishing,public_area,amenities,short_description,description,house_rules,total_beds,available_beds,availability,image_url,is_featured FROM properties WHERE status='published' AND (public_id=${id} OR id::text=${id}) LIMIT 1`;
  if(!r.rows[0]) return json(res,404,{error:'Property not found'});
  const imgs=await sql`SELECT image_url,alt_text,is_main,sort_order FROM property_images WHERE property_id=${r.rows[0].id} ORDER BY is_main DESC,sort_order`;
  json(res,200,{property:r.rows[0],images:imgs.rows});
 } catch(e) { console.error(e); json(res,500,{error:'Could not load property.'}); }
}
