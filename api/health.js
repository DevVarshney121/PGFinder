import { json, method, securityHeaders } from '../lib/http.js';
export default async function handler(req,res) {
  securityHeaders(res);
  if (!method(req,res,['GET'])) return;
  json(res,200,{ok:true,service:'PGFinder API',databaseConfigured:Boolean(process.env.POSTGRES_URL)});
}
