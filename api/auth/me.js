import { getUser } from '../../lib/auth.js';
import { json, method, securityHeaders } from '../../lib/http.js';
export default async function handler(req,res) { securityHeaders(res); if(!method(req,res,['GET'])) return; const user=await getUser(req); json(res,200,{user}); }
