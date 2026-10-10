import { SignJWT, jwtVerify } from 'jose';
import { sql } from '@vercel/postgres';
const secret = () => {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters.');
  return new TextEncoder().encode(process.env.SESSION_SECRET);
};
export async function createSession(res, user) {
  const token = await new SignJWT({ sub: String(user.id), role: user.role, name: user.name, email: user.email })
    .setProtectedHeader({ alg:'HS256' }).setIssuedAt().setExpirationTime('7d').sign(secret());
  res.setHeader('Set-Cookie', `pgfinder_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}
export function clearSession(res) { res.setHeader('Set-Cookie', `pgfinder_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`); }
export async function getUser(req) {
  const cookie = req.headers.cookie || '';
  const token = cookie.split(';').map(v=>v.trim()).find(v=>v.startsWith('pgfinder_session='))?.slice('pgfinder_session='.length);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const result = await sql`SELECT id,name,email,phone,role,status FROM users WHERE id=${Number(payload.sub)} AND status='active'`;
    return result.rows[0] || null;
  } catch { return null; }
}
export async function requireUser(req,res,admin=false) {
  const user = await getUser(req);
  if (!user) { res.status(401).json({error:'Please log in first.'}); return null; }
  if (admin && user.role !== 'admin') { res.status(403).json({error:'Administrator access required.'}); return null; }
  return user;
}
export function csrfOk(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host) { try { if (new URL(origin).host !== host) return false; } catch { return false; } }
  const site = req.headers['sec-fetch-site'];
  return !site || site === 'same-origin' || site === 'same-site' || site === 'none';
}
