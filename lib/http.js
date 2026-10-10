export function json(res, status, body) {
  res.status(status).setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.end(JSON.stringify(body));
}
export function method(req, res, allowed) {
  if (!allowed.includes(req.method)) { res.setHeader('Allow', allowed.join(', ')); json(res,405,{error:'Method not allowed'}); return false; }
  return true;
}
export async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let data=''; for await (const chunk of req) data += chunk;
  try { return JSON.parse(data || '{}'); } catch { return {}; }
}
export function securityHeaders(res) {
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
}
