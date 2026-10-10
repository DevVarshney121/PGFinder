import { getUser } from '../../auth.js';
import { json, method, securityHeaders } from '../../http.js';
export default async function handler(req,res) { securityHeaders(res); if(!method(req,res,['GET'])) return; const user=await getUser(req); json(res,200,{user}); }
