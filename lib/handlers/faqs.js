import { sql } from '@vercel/postgres';
import { json, method, securityHeaders } from '../http.js';
export default async function handler(req,res){securityHeaders(res);if(!method(req,res,['GET']))return;try{const r=await sql`SELECT id,category,question,answer FROM faqs WHERE is_published=TRUE ORDER BY sort_order,id`;json(res,200,{items:r.rows});}catch(e){console.error(e);json(res,500,{error:'FAQs are temporarily unavailable.'});}}
