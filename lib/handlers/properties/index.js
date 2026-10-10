import { sql } from '@vercel/postgres';
import { json, method, securityHeaders } from '../../http.js';
export default async function handler(req,res) {
 securityHeaders(res); if(!method(req,res,['GET'])) return;
 try {
  const type=['pg','hostel','flat'].includes(String(req.query.type||'').toLowerCase())?String(req.query.type).toLowerCase():null;
  const area=String(req.query.area||'').slice(0,120), room=String(req.query.room||'').slice(0,80);
  const min=Math.max(0,Number(req.query.min||0)), max=Math.max(0,Number(req.query.max||1000000));
  const q=String(req.query.q||'').slice(0,100), page=Math.max(1,Number(req.query.page||1)), limit=12, offset=(page-1)*limit;
  const result=await sql`SELECT id,public_id,property_type,title,room_type,monthly_rent,security_deposit,gender_preference,food_included,furnishing,public_area,amenities,short_description,total_beds,available_beds,availability,image_url,is_featured
  FROM properties WHERE status='published' AND (${type}::text IS NULL OR property_type=${type}) AND (${area}='' OR public_area ILIKE ${'%'+area+'%'})
  AND (${room}='' OR room_type=${room}) AND monthly_rent BETWEEN ${min} AND ${max}
  AND (${q}='' OR title ILIKE ${'%'+q+'%'} OR short_description ILIKE ${'%'+q+'%'} OR public_area ILIKE ${'%'+q+'%'})
  ORDER BY is_featured DESC, created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  const count=await sql`SELECT COUNT(*)::int AS total FROM properties WHERE status='published' AND (${type}::text IS NULL OR property_type=${type}) AND (${area}='' OR public_area ILIKE ${'%'+area+'%'}) AND (${room}='' OR room_type=${room}) AND monthly_rent BETWEEN ${min} AND ${max} AND (${q}='' OR title ILIKE ${'%'+q+'%'} OR short_description ILIKE ${'%'+q+'%'})`;
  json(res,200,{properties:result.rows,page,total:count.rows[0].total,pages:Math.max(1,Math.ceil(count.rows[0].total/limit))});
 } catch(e) { console.error(e); json(res,500,{error:'Properties could not be loaded. Configure the database and run migrations.'}); }
}
