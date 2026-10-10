import { json, securityHeaders } from '../lib/http.js';
import health from '../lib/handlers/health.js';
import faqs from '../lib/handlers/faqs.js';
import newsletter from '../lib/handlers/newsletter.js';
import login from '../lib/handlers/auth/login.js';
import register from '../lib/handlers/auth/register.js';
import me from '../lib/handlers/auth/me.js';
import logout from '../lib/handlers/auth/logout.js';
import properties from '../lib/handlers/properties/index.js';
import property from '../lib/handlers/properties/[id].js';
import favourites from '../lib/handlers/favourites/index.js';
import upload from '../lib/handlers/media/upload.js';
import content from '../lib/handlers/admin/content.js';
import overview from '../lib/handlers/admin/overview.js';
import adminProperties from '../lib/handlers/admin/properties.js';
import adminEnquiries from '../lib/handlers/admin/enquiries.js';
import adminUsers from '../lib/handlers/admin/users.js';
import enquiries from '../lib/handlers/enquiries/index.js';

const routes = {
  'health': health, 'faqs': faqs, 'newsletter': newsletter,
  'auth/login': login, 'auth/register': register, 'auth/me': me, 'auth/logout': logout,
  'properties': properties, 'favourites': favourites, 'media/upload': upload,
  'admin/content': content, 'admin/overview': overview, 'admin/properties': adminProperties,
  'admin/enquiries': adminEnquiries, 'admin/users': adminUsers, 'enquiries': enquiries
};
export default async function handler(req, res) {
  securityHeaders(res);
  const parts = Array.isArray(req.query.route) ? req.query.route : [req.query.route].filter(Boolean);
  let key = parts.join('/');
  if (key.startsWith('properties/')) {
    const id = key.slice('properties/'.length);
    if (id && id !== 'index') { req.query.id = id; key = 'properties/:id'; }
  }
  const fn = key === 'properties/:id' ? property : routes[key];
  if (!fn) return json(res, 404, { error: 'API route not found.' });
  return fn(req, res);
}
