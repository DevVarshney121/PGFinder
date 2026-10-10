import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { json, method, body, securityHeaders } from '../lib/http.js';
import { limited } from '../lib/rate-limit.js';
export default async function handler(req,res){securityHeaders(res);if(!method(req,res,['POST']))return;if(limited(req,'newsletter',5))return json(res,429,{error:'Please try later.'});const p=z.object({email:z.string().email().max(255)}).safeParse(await body(req));if(!p.success)return json(res,400,{error:'Enter a valid email.'});try{await sql`INSERT INTO newsletter_subscribers(email) VALUES(${p.data.email.toLowerCase()}) ON CONFLICT(email) DO UPDATE SET is_active=TRUE`;json(res,201,{ok:true,message:'You are subscribed.'});}catch(e){console.error(e);json(res,500,{error:'Subscription could not be saved.'});}}
