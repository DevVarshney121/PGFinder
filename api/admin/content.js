import { sql } from '@vercel/postgres';
import { json, method, body, securityHeaders } from '../../lib/http.js';
import { requireUser, csrfOk } from '../../lib/auth.js';
export default async function handler(req,res) {
 securityHeaders(res); if(!method(req,res,['GET','POST','PATCH','DELETE'])) return;
 const u=await requireUser(req,res,true); if(!u)return;
 try {
  const kind=String(req.query.kind||'sections');
  const tables={sections:'page_sections',banners:'banners',faqs:'faqs',testimonials:'testimonials',settings:'site_settings'};
  const table=tables[kind]; if(!table) return json(res,400,{error:'Unknown content type.'});
  if(req.method==='GET') { const r=kind==='settings'?await sql`SELECT key,value FROM site_settings ORDER BY key`:kind==='sections'?await sql`SELECT * FROM page_sections ORDER BY page_key,sort_order`:kind==='banners'?await sql`SELECT * FROM banners ORDER BY sort_order`:kind==='faqs'?await sql`SELECT * FROM faqs ORDER BY sort_order`:await sql`SELECT * FROM testimonials ORDER BY sort_order`; return json(res,200,{items:r.rows}); }
  if(!csrfOk(req)) return json(res,403,{error:'Request origin could not be verified.'});
  const b=await body(req);
  if(req.method==='DELETE') { const id=Number(b.id); if(!id)return json(res,400,{error:'Valid id required.'}); if(kind==='sections') await sql`DELETE FROM page_sections WHERE id=${id}`; else if(kind==='banners') await sql`DELETE FROM banners WHERE id=${id}`; else if(kind==='faqs') await sql`DELETE FROM faqs WHERE id=${id}`; else if(kind==='testimonials') await sql`DELETE FROM testimonials WHERE id=${id}`; else return json(res,400,{error:'Settings are edited by key.'}); return json(res,200,{ok:true}); }
  if(kind==='sections') { const d=b; if(!d.page_key||!d.section_key||!d.title)return json(res,400,{error:'page_key, section_key, and title are required.'}); const r=await sql`INSERT INTO page_sections(page_key,section_key,title,description,image_url,button_text,button_link,is_visible,sort_order) VALUES(${d.page_key},${d.section_key},${d.title},${d.description||''},${d.image_url||null},${d.button_text||null},${d.button_link||null},${d.is_visible!==false},${Number(d.sort_order||0)}) ON CONFLICT(page_key,section_key) DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,image_url=EXCLUDED.image_url,button_text=EXCLUDED.button_text,button_link=EXCLUDED.button_link,is_visible=EXCLUDED.is_visible,sort_order=EXCLUDED.sort_order,updated_at=NOW() RETURNING id`; return json(res,200,{ok:true,id:r.rows[0].id}); }
  if(kind==='banners') { if(!b.title)return json(res,400,{error:'Title required.'}); const r=await sql`INSERT INTO banners(title,subtitle,image_url,button_text,button_link,is_active,sort_order) VALUES(${b.title},${b.subtitle||''},${b.image_url||null},${b.button_text||'Explore Properties'},${b.button_link||'/pg.html'},${b.is_active!==false},${Number(b.sort_order||0)}) RETURNING id`; return json(res,201,{id:r.rows[0].id}); }
  if(kind==='faqs') { if(!b.question||!b.answer)return json(res,400,{error:'Question and answer required.'}); const r=await sql`INSERT INTO faqs(category,question,answer,is_published,sort_order) VALUES(${b.category||'General'},${b.question},${b.answer},${b.is_published!==false},${Number(b.sort_order||0)}) RETURNING id`; return json(res,201,{id:r.rows[0].id}); }
  if(kind==='testimonials') { if(!b.name||!b.review)return json(res,400,{error:'Name and review required.'}); const r=await sql`INSERT INTO testimonials(name,role,rating,review,is_published,sort_order) VALUES(${b.name},${b.role||'Resident'},${Math.min(5,Math.max(1,Number(b.rating||5)) )},${b.review},${b.is_published===true},${Number(b.sort_order||0)}) RETURNING id`; return json(res,201,{id:r.rows[0].id}); }
  if(kind==='settings') { if(!b.key)return json(res,400,{error:'Setting key required.'}); await sql`INSERT INTO site_settings(key,value) VALUES(${b.key},${JSON.stringify(b.value??{})}::jsonb) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`; return json(res,200,{ok:true}); }
 } catch(e) { console.error(e); json(res,500,{error:'Content operation failed.'}); }
}
