import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { json, method, body, securityHeaders } from '../../lib/http.js';
import { requireUser, csrfOk } from '../../lib/auth.js';
const schema=z.object({propertyType:z.enum(['pg','hostel','flat']),internalName:z.string().min(2).max(180),title:z.string().min(2).max(180),roomType:z.string().min(1).max(80),rent:z.coerce.number().int().min(0),deposit:z.coerce.number().int().min(0).default(0),area:z.string().min(2).max(120),gender:z.string().max(30).default('any'),food:z.boolean().default(false),furnishing:z.string().max(30).default('furnished'),amenities:z.array(z.string().max(80)).max(30).default([]),description:z.string().max(5000).default(''),imageUrl:z.string().url().max(1000).optional().or(z.literal('')),status:z.enum(['published','draft','inactive']).default('draft'),featured:z.boolean().default(false)});
export default async function handler(req,res) {
 securityHeaders(res); if(!method(req,res,['GET','POST','PUT','DELETE'])) return;
 const u=await requireUser(req,res,true); if(!u) return;
 try {
  if(req.method==='GET') { const r=await sql`SELECT id,public_id,title,property_type,room_type,monthly_rent,public_area,status,is_featured,created_at FROM properties ORDER BY created_at DESC LIMIT 200`; return json(res,200,{properties:r.rows}); }
  if(!csrfOk(req)) return json(res,403,{error:'Request origin could not be verified.'});
  const b=await body(req);
  if(req.method==='DELETE') { const id=Number(b.id); if(!id) return json(res,400,{error:'Valid property id required.'}); await sql`DELETE FROM properties WHERE id=${id}`; return json(res,200,{ok:true}); }
  const p=schema.safeParse(b); if(!p.success) return json(res,400,{error:'Check required property fields.'});
  const d=p.data;
  if(req.method==='POST') {
   const publicId='PGF-'+Date.now().toString(36).toUpperCase();
   const r=await sql`INSERT INTO properties(public_id,property_type,internal_name,title,room_type,monthly_rent,security_deposit,gender_preference,food_included,furnishing,public_area,amenities,short_description,description,image_url,status,is_featured,show_on_homepage)
   VALUES(${publicId},${d.propertyType},${d.internalName},${d.title},${d.roomType},${d.rent},${d.deposit},${d.gender},${d.food},${d.furnishing},${d.area},${d.amenities},${d.description.slice(0,240)},${d.description},${d.imageUrl||null},${d.status},${d.featured},true) RETURNING id,public_id`;
   return json(res,201,{property:r.rows[0]});
  }
  const id=Number(b.id); if(!id) return json(res,400,{error:'Valid property id required.'});
  await sql`UPDATE properties SET property_type=${d.propertyType},internal_name=${d.internalName},title=${d.title},room_type=${d.roomType},monthly_rent=${d.rent},security_deposit=${d.deposit},gender_preference=${d.gender},food_included=${d.food},furnishing=${d.furnishing},public_area=${d.area},amenities=${d.amenities},short_description=${d.description.slice(0,240)},description=${d.description},image_url=${d.imageUrl||null},status=${d.status},is_featured=${d.featured},updated_at=NOW() WHERE id=${id}`;
  json(res,200,{ok:true});
 } catch(e) { console.error(e); json(res,500,{error:'Property operation failed.'}); }
}
