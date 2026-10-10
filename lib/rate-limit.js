const buckets = new Map();
export function limited(req, key, max=12, windowMs=60000) {
  const now=Date.now(), id=`${key}:${req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'}`;
  const old=buckets.get(id);
  if (!old || old.until < now) { buckets.set(id,{count:1,until:now+windowMs}); return false; }
  old.count++; return old.count > max;
}
