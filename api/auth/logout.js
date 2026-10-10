import { clearSession } from '../../lib/auth.js';
import { json, method, securityHeaders } from '../../lib/http.js';
export default async function handler(req,res) { securityHeaders(res); if(!method(req,res,['POST'])) return; clearSession(res); json(res,200,{ok:true}); }
