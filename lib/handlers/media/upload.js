import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';
import { json, method, securityHeaders } from '../../http.js';
import { requireUser, csrfOk } from '../../auth.js';
export const config = { api: { bodyParser: false } };
export default async function handler(req,res) {
 securityHeaders(res); if(!method(req,res,['POST']))return;
 const u=await requireUser(req,res,true); if(!u)return;
 if(!csrfOk(req))return json(res,403,{error:'Request origin could not be verified.'});
 const type=req.headers['content-type']||'';
 if(!type.includes('multipart/form-data'))return json(res,400,{error:'Send a multipart/form-data upload.'});
 // Use Vercel Blob client upload flow in production for large files. This endpoint intentionally accepts a raw image body.
 const mime=String(req.headers['x-image-content-type']||'');
 if(!['image/jpeg','image/png','image/webp','image/avif'].includes(mime))return json(res,415,{error:'Allowed formats: JPG, PNG, WEBP, AVIF.'});
 const chunks=[]; let size=0;
 for await(const chunk of req){size+=chunk.length;if(size>5*1024*1024)return json(res,413,{error:'Image must be 5 MB or smaller.'});chunks.push(chunk);}
 try { const blob=await put(`pgfinder/${Date.now()}-${u.id}.image`,Buffer.concat(chunks),{access:'public',contentType:mime,addRandomSuffix:true}); await sql`INSERT INTO media_files(url,pathname,created_by) VALUES(${blob.url},${blob.pathname},${u.id})`; json(res,201,{url:blob.url}); }
 catch(e){console.error(e);json(res,500,{error:'Upload failed. Check BLOB_READ_WRITE_TOKEN.'});}
}
